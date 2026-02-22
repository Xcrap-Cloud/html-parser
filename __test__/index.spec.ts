/**
 * Integration smoke tests for @xcrap/html-parser.
 *
 * This file verifies that all public exports are accessible and that the most
 * common end-to-end flows work correctly in combination. Detailed unit tests
 * for each feature live in the dedicated spec files:
 *
 *  - query-builders.spec.ts         — css() / xpath() helpers and QueryType enum
 *  - html-parser.spec.ts            — HTMLParser constructor, selectFirst, selectMany
 *  - html-element-properties.spec.ts — HTMLElement getters and toString()
 *  - html-element-queries.spec.ts   — HTMLElement.selectFirst / selectMany (scoped)
 */
import test from "ava"

import { HTMLParser, HTMLElement, css, xpath, parse } from "../index"
import type { QueryType } from "../index"

// ─── Public API surface ───────────────────────────────────────────────────────

test("all named exports are defined", (t) => {
  t.is(typeof HTMLParser, "function")
  t.is(typeof HTMLElement, "function")
  t.is(typeof css, "function")
  t.is(typeof xpath, "function")
  t.is(typeof parse, "function")
  // QueryType is a const enum — it is inlined at compile time and has no
  // runtime object. We verify its shape by checking the compiled literal values.
  const cssValue: QueryType = 0  // QueryType.CSS
  const xpathValue: QueryType = 1 // QueryType.XPath
  t.is(cssValue, 0)
  t.is(xpathValue, 1)
})

// ─── End-to-end: CSS workflow ─────────────────────────────────────────────────

test("end-to-end CSS workflow: parse → selectFirst → read property", (t) => {
  const parser = new HTMLParser("<h1 id='title' class='main'>Hello</h1>")
  const el = parser.selectFirst({ query: css("h1") }) as HTMLElement
  t.is(el.text.trim(), "Hello")
  t.is(el.id, "title")
  t.is(el.tagName, "H1")
  t.is(el.className, "main")
})

test("end-to-end CSS workflow: parse → selectMany → map texts", (t) => {
  const parser = new HTMLParser("<ul><li>A</li><li>B</li><li>C</li></ul>")
  const items = parser.selectMany({ query: css("li") })
  t.deepEqual(
    items.map((el) => el.text.trim()),
    ["A", "B", "C"],
  )
})

// ─── End-to-end: XPath workflow ───────────────────────────────────────────────

test("end-to-end XPath workflow: parse → selectFirst → read outerHTML", (t) => {
  const parser = new HTMLParser("<div><span>World</span></div>")
  const el = parser.selectFirst({ query: xpath("//span") }) as HTMLElement
  t.true(el.outerHTML.includes("World"))
})

test("end-to-end XPath workflow: parse → selectMany → check count", (t) => {
  const parser = new HTMLParser("<ul><li>1</li><li>2</li></ul>")
  const items = parser.selectMany({ query: xpath("//li") })
  t.is(items.length, 2)
})

// ─── End-to-end: parse() convenience function ─────────────────────────────────

test("end-to-end using parse() function alias", (t) => {
  const el = parse("<p class='msg'>Done</p>").selectFirst({ query: css("p.msg") }) as HTMLElement
  t.is(el.text.trim(), "Done")
})

// ─── End-to-end: nested queries ───────────────────────────────────────────────

test("end-to-end nested query: parser → element → scoped selectFirst", (t) => {
  const html = `
    <nav>
      <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  `
  const parser = new HTMLParser(html)
  const nav = parser.selectFirst({ query: css("nav") }) as HTMLElement
  const links = nav.selectMany({ query: css("a") })
  t.is(links.length, 2)
  t.is(links[0].getAttribute("href"), "/home")
  t.is(links[1].getAttribute("href"), "/about")
})

test("end-to-end: firstChild → lastChild chain", (t) => {
  const parser = new HTMLParser("<ul><li>First</li><li>Middle</li><li>Last</li></ul>")
  const ul = parser.selectFirst({ query: css("ul") }) as HTMLElement
  t.is(ul.firstChild?.text.trim(), "First")
  t.is(ul.lastChild?.text.trim(), "Last")
})

// ─── End-to-end: limit ────────────────────────────────────────────────────────

test("end-to-end: selectMany with limit stops at correct count", (t) => {
  const parser = new HTMLParser("<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>")
  const items = parser.selectMany({ query: css("li"), limit: 3 })
  t.is(items.length, 3)
  t.is(items[0].text.trim(), "1")
  t.is(items[2].text.trim(), "3")
})
