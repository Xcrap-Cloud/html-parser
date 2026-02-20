import test from "ava"

import { HtmlParser, HtmlElement, css, xpath, QueryType } from "../index"

// ─── HTML fixture used across tests ──────────────────────────────────────────

const HTML = `
<html>
  <head><title>Test Page</title></head>
  <body>
    <header id="main-header" class="header sticky">
      <h1 class="title highlight">Hello World</h1>
    </header>

    <main>
      <article id="post-1" class="post featured" data-author="alice" data-views="120">
        <h2 class="post-title">First Post</h2>
        <p class="excerpt">First excerpt</p>
      </article>

      <article id="post-2" class="post" data-author="bob" data-views="80">
        <h2 class="post-title">Second Post</h2>
        <p class="excerpt">Second excerpt</p>
      </article>

      <article id="post-3" class="post" data-author="alice" data-views="200">
        <h2 class="post-title">Third Post</h2>
        <p class="excerpt">Third excerpt</p>
      </article>
    </main>

    <ul id="tag-list">
      <li class="tag">rust</li>
      <li class="tag">napi</li>
      <li class="tag">nodejs</li>
      <li class="tag">wasm</li>
    </ul>

    <a href="https://example.com" id="main-link" class="link external">Visit</a>
  </body>
</html>
`

// ─── css() / xpath() helpers ──────────────────────────────────────────────────

test("css() returns a QueryConfig with type CSS", (t) => {
  const config = css("h1")
  t.is(config.query, "h1")
  t.is(config.type, QueryType.CSS)
})

test("xpath() returns a QueryConfig with type XPath", (t) => {
  const config = xpath("//h1")
  t.is(config.query, "//h1")
  t.is(config.type, QueryType.XPath)
})

// ─── HtmlParser — selectFirst (CSS) ──────────────────────────────────────────

test("selectFirst with CSS — returns matching element", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("h1") })
  t.not(el, null)
  t.true((el as HtmlElement).text.includes("Hello World"))
})

test("selectFirst with CSS — returns null when no match", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("section.nonexistent") })
  t.is(el, null)
})

test("selectFirst with CSS — returns only the first match", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("article") }) as HtmlElement
  t.not(el, null)
  t.true(el.text.includes("First Post"))
})

// ─── HtmlParser — selectFirst (XPath) ────────────────────────────────────────

test("selectFirst with XPath — returns matching element", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: xpath("//h1") })
  t.not(el, null)
  t.true((el as HtmlElement).outerHTML.includes("Hello World"))
})

test("selectFirst with XPath — returns null when no match", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: xpath("//section[@class='nonexistent']") })
  t.is(el, null)
})

// ─── HtmlParser — selectMany (CSS) ───────────────────────────────────────────

test("selectMany with CSS — returns all matching elements", (t) => {
  const parser = new HtmlParser(HTML)
  const items = parser.selectMany({ query: css("article") })
  t.is(items.length, 3)
})

test("selectMany with CSS — respects limit", (t) => {
  const parser = new HtmlParser(HTML)
  const items = parser.selectMany({ query: css("article"), limit: 2 })
  t.is(items.length, 2)
})

test("selectMany with CSS — limit 0 returns all elements", (t) => {
  const parser = new HtmlParser(HTML)
  const items = parser.selectMany({ query: css(".tag"), limit: 0 })
  t.is(items.length, 4)
})

test("selectMany with CSS — returns empty array when no match", (t) => {
  const parser = new HtmlParser(HTML)
  const items = parser.selectMany({ query: css("section.nonexistent") })
  t.is(items.length, 0)
})

test("selectMany with CSS — returns correct text content", (t) => {
  const parser = new HtmlParser(HTML)
  const tags = parser.selectMany({ query: css("#tag-list .tag") })
  const texts = tags.map((el) => el.text.trim())
  t.deepEqual(texts, ["rust", "napi", "nodejs", "wasm"])
})

// ─── HtmlParser — selectMany (XPath) ─────────────────────────────────────────

test("selectMany with XPath — returns all matching elements", (t) => {
  const parser = new HtmlParser(HTML)
  const items = parser.selectMany({ query: xpath("//li[@class='tag']") })
  t.is(items.length, 4)
})

test("selectMany with XPath — respects limit", (t) => {
  const parser = new HtmlParser(HTML)
  const items = parser.selectMany({ query: xpath("//li[@class='tag']"), limit: 2 })
  t.is(items.length, 2)
})

// ─── HtmlParser — lazy loading (reuse between queries) ───────────────────────

test("HtmlParser reuses parsed document across multiple calls", (t) => {
  const parser = new HtmlParser(HTML)

  const first = parser.selectFirst({ query: css("h1") }) as HtmlElement
  const many = parser.selectMany({ query: css("article") })

  t.not(first, null)
  t.is(many.length, 3)
})

// ─── HtmlElement — properties ─────────────────────────────────────────────────

test("HtmlElement.text returns element's text content", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("h1") }) as HtmlElement
  t.is(el.text.trim(), "Hello World")
})

test("HtmlElement.outerHTML contains the element's HTML", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("h1") }) as HtmlElement
  t.true(el.outerHTML.includes("<h1"))
  t.true(el.outerHTML.includes("Hello World"))
})

test("HtmlElement.id", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("#main-header") }) as HtmlElement
  t.is(el.id, "main-header")
})

test("HtmlElement.getAttribute('id')", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("#main-header") }) as HtmlElement
  t.is(el.getAttribute("id"), "main-header")
})

test("HtmlElement.id returns null when element has no id", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("h1") }) as HtmlElement
  t.is(el.id, null)
})

test("HtmlElement.tagName returns uppercase tag name", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("h1") }) as HtmlElement
  t.is(el.tagName, "H1")
})

test("HtmlElement.className returns the full class string", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("#main-header") }) as HtmlElement
  t.is(el.className, "header sticky")
})

test("HtmlElement.classList returns an array of class names", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("#main-header") }) as HtmlElement
  t.deepEqual(el.classList, ["header", "sticky"])
})

test("HtmlElement.classList returns empty array when element has no class", (t) => {
  const parser = new HtmlParser(HTML)
  // <main> has no class attribute
  const el = parser.selectFirst({ query: css("main") }) as HtmlElement
  t.deepEqual(el.classList, [])
})

test("HtmlElement.getAttribute returns the attribute value", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("#main-link") }) as HtmlElement
  t.is(el.getAttribute("href"), "https://example.com")
})

test("HtmlElement.getAttribute returns null for missing attribute", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("h1") }) as HtmlElement
  t.is(el.getAttribute("href"), null)
})

test("HtmlElement.attributes returns all attributes as a record", (t) => {
  const parser = new HtmlParser(HTML)
  const el = parser.selectFirst({ query: css("#post-1") }) as HtmlElement
  const attrs = el.attributes
  t.is(attrs["id"], "post-1")
  t.is(attrs["class"], "post featured")
  t.is(attrs["data-author"], "alice")
  t.is(attrs["data-views"], "120")
})

// ─── HtmlElement — nested selectFirst / selectMany ───────────────────────────

test("HtmlElement.selectFirst navigates within a found element (CSS)", (t) => {
  const parser = new HtmlParser(HTML)
  const article = parser.selectFirst({ query: css("#post-1") }) as HtmlElement
  const title = article.selectFirst({ query: css(".post-title") }) as HtmlElement
  t.not(title, null)
  t.is(title.text.trim(), "First Post")
})

test("HtmlElement.selectMany retrieves children of a found element (CSS)", (t) => {
  const parser = new HtmlParser(HTML)
  const list = parser.selectFirst({ query: css("#tag-list") }) as HtmlElement
  const items = list.selectMany({ query: css("li") })
  t.is(items.length, 4)
})

test("HtmlElement.selectMany respects limit on nested query", (t) => {
  const parser = new HtmlParser(HTML)
  const list = parser.selectFirst({ query: css("#tag-list") }) as HtmlElement
  const items = list.selectMany({ query: css("li"), limit: 2 })
  t.is(items.length, 2)
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

test("handles empty HTML string without throwing", (t) => {
  const parser = new HtmlParser("")
  const el = parser.selectFirst({ query: css("h1") })
  t.is(el, null)
})

test("handles HTML with special characters in text", (t) => {
  const specialHtml = `<p class="special">Olá &amp; Mundo &lt;3&gt;</p>`
  const parser = new HtmlParser(specialHtml)
  const el = parser.selectFirst({ query: css("p.special") }) as HtmlElement
  t.not(el, null)
  t.true(el.text.length > 0)
})

test("selectMany with invalid CSS selector returns empty array", (t) => {
  const parser = new HtmlParser(HTML)
  const items = parser.selectMany({ query: css("##invalid!!") })
  t.is(items.length, 0)
})
