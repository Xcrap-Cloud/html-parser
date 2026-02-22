/**
 * Tests for `HTMLElement.selectFirst()` and `HTMLElement.selectMany()`.
 *
 * These are scoped variants of the same methods on `HTMLParser`: they search
 * only within the subtree of the element they are called on, preventing
 * accidental matches in sibling or parent branches.
 *
 * Covers:
 *  - selectFirst() with CSS — found, not found, first-only
 *  - selectFirst() with XPath — found, not found
 *  - selectMany() with CSS — all, limit, limit 0, empty, correct content
 *  - selectMany() with XPath — all, limit, empty
 *  - Scope isolation: queries do not leak into sibling elements
 */
import test from "ava"

import { HTMLParser, HTMLElement, css, xpath } from "../index"
import { HTML } from "./fixtures"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parser() {
    return new HTMLParser(HTML)
}

// ─── selectFirst (CSS) ───────────────────────────────────────────────────────

test("HTMLElement.selectFirst (CSS) — finds element within subtree", (t) => {
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    const title = article.selectFirst({ query: css(".post-title") }) as HTMLElement
    t.not(title, null)
    t.is(title.text.trim(), "First Post")
})

test("HTMLElement.selectFirst (CSS) — returns null when query matches nothing", (t) => {
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    t.is(article.selectFirst({ query: css(".nonexistent") }), null)
})

test("HTMLElement.selectFirst (CSS) — returns only first match inside subtree", (t) => {
    const main = parser().selectFirst({ query: css("main") }) as HTMLElement
    const heading = main.selectFirst({ query: css("h2") }) as HTMLElement
    t.is(heading.text.trim(), "First Post")
})

test("HTMLElement.selectFirst (CSS) — can select by tag name inside element", (t) => {
    const list = parser().selectFirst({ query: css("#tag-list") }) as HTMLElement
    const firstItem = list.selectFirst({ query: css("li") }) as HTMLElement
    t.is(firstItem.text.trim(), "rust")
})

// ─── selectFirst (XPath) ─────────────────────────────────────────────────────

test("HTMLElement.selectFirst (XPath) — finds element within subtree", (t) => {
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    const title = article.selectFirst({ query: xpath("//h2") }) as HTMLElement
    t.not(title, null)
    t.true(title.outerHTML.includes("First Post"))
})

test("HTMLElement.selectFirst (XPath) — returns null when query matches nothing", (t) => {
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    t.is(article.selectFirst({ query: xpath("//section[@class='nope']") }), null)
})

// ─── selectMany (CSS) ────────────────────────────────────────────────────────

test("HTMLElement.selectMany (CSS) — returns all matching children", (t) => {
    const list = parser().selectFirst({ query: css("#tag-list") }) as HTMLElement
    t.is(list.selectMany({ query: css("li") }).length, 4)
})

test("HTMLElement.selectMany (CSS) — respects a positive limit", (t) => {
    const list = parser().selectFirst({ query: css("#tag-list") }) as HTMLElement
    t.is(list.selectMany({ query: css("li"), limit: 2 }).length, 2)
})

test("HTMLElement.selectMany (CSS) — limit 0 is ignored (returns all)", (t) => {
    const list = parser().selectFirst({ query: css("#tag-list") }) as HTMLElement
    t.is(list.selectMany({ query: css("li"), limit: 0 }).length, 4)
})

test("HTMLElement.selectMany (CSS) — returns empty array when nothing matches", (t) => {
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    t.deepEqual(article.selectMany({ query: css("section") }), [])
})

test("HTMLElement.selectMany (CSS) — elements have correct text content", (t) => {
    const list = parser().selectFirst({ query: css("#tag-list") }) as HTMLElement
    const items = list.selectMany({ query: css("li") })
    t.deepEqual(
        items.map((el) => el.text.trim()),
        ["rust", "napi", "nodejs", "wasm"],
    )
})

test("HTMLElement.selectMany (CSS) — multiple children of article", (t) => {
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    const children = article.selectMany({ query: css("h2, p") })
    t.is(children.length, 2)
})

// ─── selectMany (XPath) ──────────────────────────────────────────────────────

test("HTMLElement.selectMany (XPath) — returns all matching children", (t) => {
    const list = parser().selectFirst({ query: css("#tag-list") }) as HTMLElement
    t.is(list.selectMany({ query: xpath("//li") }).length, 4)
})

test("HTMLElement.selectMany (XPath) — respects a positive limit", (t) => {
    const list = parser().selectFirst({ query: css("#tag-list") }) as HTMLElement
    t.is(list.selectMany({ query: xpath("//li"), limit: 3 }).length, 3)
})

test("HTMLElement.selectMany (XPath) — returns empty array when nothing matches", (t) => {
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    t.deepEqual(article.selectMany({ query: xpath("//section[@class='nope']") }), [])
})

// ─── Scope isolation ─────────────────────────────────────────────────────────

test("HTMLElement.selectMany — does not bleed into sibling articles", (t) => {
    // #post-1 has exactly one <h2> and one <p>; should not see sibling articles
    const article = parser().selectFirst({ query: css("#post-1") }) as HTMLElement
    const headings = article.selectMany({ query: css("h2") })
    t.is(headings.length, 1)
    t.is(headings[0].text.trim(), "First Post")
})

test("HTMLElement.selectFirst — scoped query does not match ancestors", (t) => {
    // There are 3 <article> elements in <main>, but searching inside <main>
    // for <h2> should only return the first one (first match)
    const main = parser().selectFirst({ query: css("main") }) as HTMLElement
    const first = main.selectFirst({ query: css("h2") }) as HTMLElement
    t.is(first.text.trim(), "First Post")
})
