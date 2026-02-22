/**
 * Tests for the `css()` and `xpath()` query-builder helpers.
 *
 * These functions wrap a raw query string together with its engine type
 * into a `QueryConfig` object consumed by `HTMLParser` / `HTMLElement`.
 */
import test from "ava"

import { css, xpath, QueryType } from "../index"

// ─── css() ───────────────────────────────────────────────────────────────────

test("css() — sets query string correctly", (t) => {
    const config = css("h1.title")
    t.is(config.query, "h1.title")
})

test("css() — sets type to QueryType.CSS", (t) => {
    const config = css("div")
    t.is(config.type, QueryType.CSS)
})

test("css() — works with complex selectors", (t) => {
    const selector = "article.post[data-author='alice'] > h2.post-title"
    const config = css(selector)
    t.is(config.query, selector)
    t.is(config.type, QueryType.CSS)
})

test("css() — works with empty string (no crash)", (t) => {
    const config = css("")
    t.is(config.query, "")
    t.is(config.type, QueryType.CSS)
})

// ─── xpath() ─────────────────────────────────────────────────────────────────

test("xpath() — sets query string correctly", (t) => {
    const config = xpath("//h1")
    t.is(config.query, "//h1")
})

test("xpath() — sets type to QueryType.XPath", (t) => {
    const config = xpath("//div")
    t.is(config.type, QueryType.XPath)
})

test("xpath() — works with complex expressions", (t) => {
    const expression = "//article[@class='post featured']/h2"
    const config = xpath(expression)
    t.is(config.query, expression)
    t.is(config.type, QueryType.XPath)
})

test("xpath() — works with empty string (no crash)", (t) => {
    const config = xpath("")
    t.is(config.query, "")
    t.is(config.type, QueryType.XPath)
})

// ─── QueryType enum values ────────────────────────────────────────────────────

test("QueryType.CSS has numeric value 0", (t) => {
    t.is(QueryType.CSS, 0)
})

test("QueryType.XPath has numeric value 1", (t) => {
    t.is(QueryType.XPath, 1)
})
