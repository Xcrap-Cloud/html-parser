/**
 * Tests for the `HTMLParser` class and the `parse()` convenience function.
 *
 * Covers:
 *  - Constructor / parse() function
 *  - selectFirst() — CSS and XPath
 *  - selectMany()  — CSS and XPath (with and without limits)
 *  - Lazy-loading behaviour: engines are initialised only once and reused
 */
import test from "ava"

import { HTMLParser, HTMLElement, css, xpath, parse } from "../index"
import { HTML } from "./fixtures"

// ─── Constructor / parse() ────────────────────────────────────────────────────

test("new HTMLParser() — creates an instance without throwing", (t) => {
    t.notThrows(() => new HTMLParser(HTML))
})

test("parse() — returns an HTMLParser instance equivalent to new HTMLParser()", (t) => {
    const parser = parse(HTML)
    const el = parser.selectFirst({ query: css("h1") })
    t.not(el, null)
    t.is((el as HTMLElement).text.trim(), "Hello World")
})

test("parse() — works with empty HTML string", (t) => {
    const parser = parse("")
    const el = parser.selectFirst({ query: css("h1") })
    t.is(el, null)
})

// ─── selectFirst (CSS) ───────────────────────────────────────────────────────

test("HTMLParser.selectFirst (CSS) — returns the matching element", (t) => {
    const parser = new HTMLParser(HTML)
    const el = parser.selectFirst({ query: css("h1") })
    t.not(el, null)
})

test("HTMLParser.selectFirst (CSS) — returns null when nothing matches", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectFirst({ query: css("section.nonexistent") }), null)
})

test("HTMLParser.selectFirst (CSS) — returns only the FIRST match", (t) => {
    const parser = new HTMLParser(HTML)
    const el = parser.selectFirst({ query: css("article") }) as HTMLElement
    t.true(el.text.includes("First Post"))
    t.false(el.text.includes("Second Post"))
})

test("HTMLParser.selectFirst (CSS) — can select by id", (t) => {
    const parser = new HTMLParser(HTML)
    const el = parser.selectFirst({ query: css("#post-2") }) as HTMLElement
    t.true(el.text.includes("Second Post"))
})

test("HTMLParser.selectFirst (CSS) — can select by attribute", (t) => {
    const parser = new HTMLParser(HTML)
    const el = parser.selectFirst({ query: css("[data-author='bob']") }) as HTMLElement
    t.not(el, null)
    t.is(el.getAttribute("data-author"), "bob")
})

// ─── selectFirst (XPath) ─────────────────────────────────────────────────────

test("HTMLParser.selectFirst (XPath) — returns the matching element", (t) => {
    const parser = new HTMLParser(HTML)
    const el = parser.selectFirst({ query: xpath("//h1") })
    t.not(el, null)
    t.true((el as HTMLElement).outerHTML.includes("Hello World"))
})

test("HTMLParser.selectFirst (XPath) — returns null when nothing matches", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectFirst({ query: xpath("//section[@class='nonexistent']") }), null)
})

test("HTMLParser.selectFirst (XPath) — returns only the FIRST match", (t) => {
    const parser = new HTMLParser(HTML)
    const el = parser.selectFirst({ query: xpath("//article") }) as HTMLElement
    t.true(el.outerHTML.includes("First Post"))
})

test("HTMLParser.selectFirst (XPath) — can select by attribute value", (t) => {
    const parser = new HTMLParser(HTML)
    const el = parser.selectFirst({ query: xpath("//li[@class='tag']") }) as HTMLElement
    t.is(el.text.trim(), "rust")
})

// ─── selectMany (CSS) ────────────────────────────────────────────────────────

test("HTMLParser.selectMany (CSS) — returns all matching elements", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: css("article") }).length, 3)
})

test("HTMLParser.selectMany (CSS) — respects a positive limit", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: css("article"), limit: 2 }).length, 2)
})

test("HTMLParser.selectMany (CSS) — limit of 1 returns a single element", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: css("article"), limit: 1 }).length, 1)
})

test("HTMLParser.selectMany (CSS) — limit 0 is ignored (returns all)", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: css(".tag"), limit: 0 }).length, 4)
})

test("HTMLParser.selectMany (CSS) — no limit returns all elements", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: css(".tag") }).length, 4)
})

test("HTMLParser.selectMany (CSS) — returns empty array when nothing matches", (t) => {
    const parser = new HTMLParser(HTML)
    t.deepEqual(parser.selectMany({ query: css("section.nonexistent") }), [])
})

test("HTMLParser.selectMany (CSS) — elements have correct text content", (t) => {
    const parser = new HTMLParser(HTML)
    const tags = parser.selectMany({ query: css("#tag-list .tag") })
    t.deepEqual(
        tags.map((el) => el.text.trim()),
        ["rust", "napi", "nodejs", "wasm"],
    )
})

test("HTMLParser.selectMany (CSS) — invalid selector returns empty array", (t) => {
    const parser = new HTMLParser(HTML)
    t.deepEqual(parser.selectMany({ query: css("##invalid!!") }), [])
})

// ─── selectMany (XPath) ──────────────────────────────────────────────────────

test("HTMLParser.selectMany (XPath) — returns all matching elements", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: xpath("//li[@class='tag']") }).length, 4)
})

test("HTMLParser.selectMany (XPath) — respects a positive limit", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: xpath("//li[@class='tag']"), limit: 2 }).length, 2)
})

test("HTMLParser.selectMany (XPath) — limit 0 is ignored (returns all)", (t) => {
    const parser = new HTMLParser(HTML)
    t.is(parser.selectMany({ query: xpath("//li[@class='tag']"), limit: 0 }).length, 4)
})

test("HTMLParser.selectMany (XPath) — returns empty array when nothing matches", (t) => {
    const parser = new HTMLParser(HTML)
    t.deepEqual(parser.selectMany({ query: xpath("//section[@class='nonexistent']") }), [])
})

test("HTMLParser.selectMany (XPath) — elements have correct text content", (t) => {
    const parser = new HTMLParser(HTML)
    const items = parser.selectMany({ query: xpath("//li[@class='tag']") })
    t.deepEqual(
        items.map((el) => el.text.trim()),
        ["rust", "napi", "nodejs", "wasm"],
    )
})

// ─── Lazy loading (engine reuse) ─────────────────────────────────────────────

test("HTMLParser — CSS engine is reused across multiple calls", (t) => {
    const parser = new HTMLParser(HTML)
    const first = parser.selectFirst({ query: css("h1") }) as HTMLElement
    const many = parser.selectMany({ query: css("article") })
    t.is(first.text.trim(), "Hello World")
    t.is(many.length, 3)
})

test("HTMLParser — XPath engine is reused across multiple calls", (t) => {
    const parser = new HTMLParser(HTML)
    const first = parser.selectFirst({ query: xpath("//h1") }) as HTMLElement
    const many = parser.selectMany({ query: xpath("//article") })
    t.true(first.outerHTML.includes("Hello World"))
    t.is(many.length, 3)
})

test("HTMLParser — CSS and XPath engines can be mixed on the same instance", (t) => {
    const parser = new HTMLParser(HTML)
    const cssEl = parser.selectFirst({ query: css("h1") }) as HTMLElement
    const xpathEl = parser.selectFirst({ query: xpath("//h1") }) as HTMLElement
    t.true(cssEl.text.includes("Hello World"))
    t.true(xpathEl.outerHTML.includes("Hello World"))
})

// ─── Edge cases ──────────────────────────────────────────────────────────────

test("HTMLParser — handles empty HTML without throwing", (t) => {
    const parser = new HTMLParser("")
    t.is(parser.selectFirst({ query: css("h1") }), null)
    t.deepEqual(parser.selectMany({ query: css("h1") }), [])
})

test("HTMLParser — handles whitespace-only HTML without throwing", (t) => {
    const parser = new HTMLParser("   \n\t  ")
    t.is(parser.selectFirst({ query: css("div") }), null)
})

test("HTMLParser — handles HTML with special characters in text", (t) => {
    const parser = new HTMLParser(`<p class="special">Olá &amp; Mundo &lt;3&gt;</p>`)
    const el = parser.selectFirst({ query: css("p.special") }) as HTMLElement
    t.not(el, null)
    t.true(el.text.length > 0)
})
