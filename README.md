# 🕷️ Xcrap Extractor: Parsing HTML with Rust

Xcrap HTML Parser is an **experimental library** written in Rust, built with the NAPI-RS framework for compatibility with Node.js. Its goal is to be fast, lightweight, and support both CSS and XPath queries. Designed for the Xcrap framework ecosystem — but not limited to it — it natively provides query options and limits on processed elements.

**Rust HTML parsing libraries used internally:**

* scraper
* sxd-document
* sxd-xpath
* sxd_html

---

## ⚡ Performance

In terms of initial parser instance loading speed, we are currently the fastest. We use lazy loading both for the internal CSS handler instance and for the internal XPath handler instance:

```
@xcrap/html-parser         :0.246214 ms/file ± 0.136808
html-parser                :36.8255 ms/file ± 28.8551
htmljs-parser              :0.501577 ms/file ± 1.21080
html-dom-parser            :2.18028 ms/file ± 1.79617
html5parser                :1.67464 ms/file ± 1.22279
cheerio                    :8.67998 ms/file ± 6.32852
parse5                     :4.82118 ms/file ± 2.66822
htmlparser2                :1.49739 ms/file ± 1.39804
htmlparser                 :16.1712 ms/file ± 109.076
high5                      :2.98229 ms/file ± 1.92748
node-html-parser           :2.90167 ms/file ± 1.90804
```

Tests performed using a cloned repository from:
[https://github.com/taoqf/node-html-parser](https://github.com/taoqf/node-html-parser)

---

## 📦 Installation

Installation is very simple. You can use NPM or any other package manager of your choice, such as PNPM, Yarn, etc.

```bash
npm i @xcrap/html-parser
```

---

## 🛠️ How to Use

```ts
import { HtmlParser, css, xpath } from "@xcrap/html-parser"

// Example HTML
const html = `
    <div>
        <h1 class="title dasdas da das">Hello Gemini</h1>
        <p>Web scraping with Rust is fast!</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
    </div>
`

// Instantiate the parser
const parser = new HtmlParser(html)

// Selecting a single element
const heading1 = parser.selectFirst({ query: xpath("//h1") })

console.log(heading1.text)

// Selecting multiple elements
const listItems = parser.selectMany({ query: css("ul li"), limit: 2 })
const texts = listItems.map(item => item.text)

console.log(texts)
```

Of course, you can also retrieve attributes, id, class, etc. I plan to improve the documentation soon.

---

## 🤝 Contributing

Want to contribute? Follow these steps:

* Fork the repository.
* Create a new branch (`git checkout -b feature-new`).
* Commit your changes (`git commit -m 'Add new feature'`).
* Push to the branch (`git push origin feature-new`).
* Open a Pull Request.

---

## 📝 License

This project is licensed under the MIT License.
