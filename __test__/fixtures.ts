/**
 * Shared HTML fixture used across all test suites.
 *
 * Structure overview:
 *  - <header id="main-header">  — element with id + multiple classes
 *    - <h1 class="title highlight"> — element with class, no id
 *  - <main>                      — element with no class/id
 *    - <article id="post-N">     — 3 articles with data-* attributes
 *      - <h2 class="post-title">
 *      - <p class="excerpt">
 *  - <ul id="tag-list">         — list with 4 <li class="tag"> items
 *  - <a id="main-link">         — anchor with href and data-track
 *  - <section id="nested">      — deeply nested structure for traversal tests
 *    - <div id="nested-parent">
 *      - <p id="nested-child-1">
 *      - <p id="nested-child-2">
 */
export const HTML = `
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

    <a href="https://example.com" id="main-link" class="link external" data-track="cta">Visit</a>

    <section id="nested">
      <div id="nested-parent">
        <p id="nested-child-1">First child</p>
        <p id="nested-child-2">Last child</p>
      </div>
    </section>
  </body>
</html>
`
