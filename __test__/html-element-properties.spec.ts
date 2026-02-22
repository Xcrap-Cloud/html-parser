/**
 * Tests for `HTMLElement` properties.
 *
 * Covers every getter and method exposed by the `HTMLElement` class:
 *  - outerHTML, innerHTML, text
 *  - id, tagName, className, classList
 *  - attributes, getAttribute()
 *  - firstChild, lastChild
 *  - toString()
 */
import test from "ava"

import { HTMLParser, HTMLElement, css } from "../index"
import { HTML } from "./fixtures"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function select(query: string): HTMLElement {
    return new HTMLParser(HTML).selectFirst({ query: css(query) }) as HTMLElement
}

// ─── outerHTML ───────────────────────────────────────────────────────────────

test("HTMLElement.outerHTML — includes opening tag", (t) => {
    t.true(select("h1").outerHTML.includes("<h1"))
})

test("HTMLElement.outerHTML — includes text content", (t) => {
    t.true(select("h1").outerHTML.includes("Hello World"))
})

test("HTMLElement.outerHTML — includes closing tag", (t) => {
    t.true(select("h1").outerHTML.includes("</h1>"))
})

test("HTMLElement.outerHTML — includes element attributes", (t) => {
    const html = select("#main-link").outerHTML
    t.true(html.includes("href"))
    t.true(html.includes("https://example.com"))
})

// ─── innerHTML ───────────────────────────────────────────────────────────────

test("HTMLElement.innerHTML — returns inner HTML without parent tags", (t) => {
    const html = select("header").innerHTML
    t.false(html.includes("<header"))
    t.true(html.includes("<h1"))
})

test("HTMLElement.innerHTML — returns text for leaf element", (t) => {
    const html = select("h1").innerHTML
    t.is(html.trim(), "Hello World")
})

test("HTMLElement.innerHTML — returns children markup for container", (t) => {
    const html = select("#tag-list").innerHTML
    t.true(html.includes("<li"))
    t.true(html.includes("rust"))
})

// ─── text ────────────────────────────────────────────────────────────────────

test("HTMLElement.text — returns plain text of a leaf element", (t) => {
    t.is(select("h1").text.trim(), "Hello World")
})

test("HTMLElement.text — concatenates text from descendants", (t) => {
    const text = select("#post-1").text
    t.true(text.includes("First Post"))
    t.true(text.includes("First excerpt"))
})

test("HTMLElement.text — returns text for a list item", (t) => {
    const tags = new HTMLParser(HTML).selectMany({ query: css(".tag") })
    t.is(tags[0].text.trim(), "rust")
    t.is(tags[3].text.trim(), "wasm")
})

// ─── id ──────────────────────────────────────────────────────────────────────

test("HTMLElement.id — returns the id attribute value", (t) => {
    t.is(select("#main-header").id, "main-header")
})

test("HTMLElement.id — returns null when element has no id", (t) => {
    t.is(select("h1").id, null)
})

test("HTMLElement.id — returns null for element without any attributes", (t) => {
    t.is(select("main").id, null)
})

// ─── tagName ─────────────────────────────────────────────────────────────────

test("HTMLElement.tagName — returns uppercase tag name for H1", (t) => {
    t.is(select("h1").tagName, "H1")
})

test("HTMLElement.tagName — returns uppercase tag name for ARTICLE", (t) => {
    t.is(select("article").tagName, "ARTICLE")
})

test("HTMLElement.tagName — returns uppercase tag name for A", (t) => {
    t.is(select("#main-link").tagName, "A")
})

test("HTMLElement.tagName — returns uppercase tag name for UL", (t) => {
    t.is(select("#tag-list").tagName, "UL")
})

// ─── className ───────────────────────────────────────────────────────────────

test("HTMLElement.className — returns full class attribute string", (t) => {
    t.is(select("#main-header").className, "header sticky")
})

test("HTMLElement.className — returns single class when only one present", (t) => {
    t.is(select("h2.post-title").className, "post-title")
})

test("HTMLElement.className — returns empty string when element has no class", (t) => {
    t.is(select("main").className, "")
})

// ─── classList ───────────────────────────────────────────────────────────────

test("HTMLElement.classList — returns array of class names", (t) => {
    t.deepEqual(select("#main-header").classList, ["header", "sticky"])
})

test("HTMLElement.classList — returns single-item array for one class", (t) => {
    t.deepEqual(select("h2.post-title").classList, ["post-title"])
})

test("HTMLElement.classList — returns empty array when element has no class", (t) => {
    t.deepEqual(select("main").classList, [])
})

test("HTMLElement.classList — array length matches number of classes", (t) => {
    const classes = select("#post-1").classList
    t.is(classes.length, 2) // "post featured"
})

// ─── getAttribute() ──────────────────────────────────────────────────────────

test("HTMLElement.getAttribute — returns value of href attribute", (t) => {
    t.is(select("#main-link").getAttribute("href"), "https://example.com")
})

test("HTMLElement.getAttribute — returns value of data-* attribute", (t) => {
    t.is(select("#post-1").getAttribute("data-author"), "alice")
    t.is(select("#post-1").getAttribute("data-views"), "120")
})

test("HTMLElement.getAttribute — returns value of id attribute", (t) => {
    t.is(select("#main-header").getAttribute("id"), "main-header")
})

test("HTMLElement.getAttribute — returns value of class attribute", (t) => {
    t.is(select("#main-header").getAttribute("class"), "header sticky")
})

test("HTMLElement.getAttribute — returns null for a missing attribute", (t) => {
    t.is(select("h1").getAttribute("href"), null)
})

test("HTMLElement.getAttribute — returns null for data-* attribute not present", (t) => {
    t.is(select("h1").getAttribute("data-anything"), null)
})

// ─── attributes ──────────────────────────────────────────────────────────────

test("HTMLElement.attributes — returns all attributes as a Record", (t) => {
    const attrs = select("#post-1").attributes
    t.is(attrs["id"], "post-1")
    t.is(attrs["class"], "post featured")
    t.is(attrs["data-author"], "alice")
    t.is(attrs["data-views"], "120")
})

test("HTMLElement.attributes — returns empty record for element without attributes", (t) => {
    // <main> has no attributes in the fixture
    t.deepEqual(select("main").attributes, {})
})

test("HTMLElement.attributes — record has correct number of keys", (t) => {
    // id, class, href, data-track = 4 attributes
    const attrs = select("#main-link").attributes
    t.is(Object.keys(attrs).length, 4)
})

test("HTMLElement.attributes — attribute values are strings", (t) => {
    for (const value of Object.values(select("#post-1").attributes)) {
        t.is(typeof value, "string")
    }
})

// ─── firstChild ──────────────────────────────────────────────────────────────

test("HTMLElement.firstChild — returns the first element child", (t) => {
    const parent = select("#nested-parent")
    const child = parent.firstChild as HTMLElement
    t.not(child, null)
    t.is(child.id, "nested-child-1")
})

test("HTMLElement.firstChild — returns null on a leaf element", (t) => {
    // <h1> has only text content, no element children
    t.is(select("h1").firstChild, null)
})

test("HTMLElement.firstChild — tag name is correct", (t) => {
    const child = select("#nested-parent").firstChild as HTMLElement
    t.is(child.tagName, "P")
})

// ─── lastChild ───────────────────────────────────────────────────────────────

test("HTMLElement.lastChild — returns the last element child", (t) => {
    const parent = select("#nested-parent")
    const child = parent.lastChild as HTMLElement
    t.not(child, null)
    t.is(child.id, "nested-child-2")
})

test("HTMLElement.lastChild — returns null on a leaf element", (t) => {
    t.is(select("h1").lastChild, null)
})

test("HTMLElement.lastChild — differs from firstChild when multiple children exist", (t) => {
    const parent = select("#nested-parent")
    t.not(parent.firstChild?.id, parent.lastChild?.id)
})

test("HTMLElement.lastChild — equals firstChild when only one child exists", (t) => {
    // <section id="nested"> has exactly one child: <div id="nested-parent">
    const section = select("#nested")
    t.is(section.firstChild?.id, section.lastChild?.id)
})

// ─── toString() ──────────────────────────────────────────────────────────────

test("HTMLElement.toString() — returns the outerHTML string", (t) => {
    const el = select("h1")
    t.is(el.toString(), el.outerHTML)
})

test("HTMLElement.toString() — contains tag and text content", (t) => {
    const str = select("h1").toString()
    t.true(str.includes("<h1"))
    t.true(str.includes("Hello World"))
})
