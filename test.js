const { HtmlParser, QueryType, css, xpath } = require('./index');

// 1. Criamos um HTML de exemplo
const html = `
    <div>
        <h1 class="title dasdas da das">Olá Gemini</h1>
        <p>Web scraping com Rust é rápido!</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
    </div>
`;

// 2. Instanciamos o parser
const parser = new HtmlParser(html);

// 3. Testamos o seletor CSS
// const headingCss = parser.selectFirst({
//     query: {
//         type: QueryType.CSS,
//         query: "h1"
//     }
// });
// console.log('CSS:', headingCss?.text); // Deve imprimir: Olá Gemini

const headingCss2 = parser.selectFirst({ query: css("h1") });
const list = parser.selectFirst({ query: css("ul") })

console.log(list.outerHTML)

const items = list.selectFirst({ query: css("li") })//.map(item => item.tagName)

console.log('CSS:', {
    text: headingCss2.text,
    className: headingCss2.className,
    classList: headingCss2.classList,
    tagName: headingCss2.tagName,
    attributes: headingCss2.attributes
}); // Web scraping com Rust é rápido!

// // 4. Testamos o seletor XPath
// const headingXpath = parser.selectMany({ query: xpath('//h1') });
// console.log('XPath:', headingXpath); // Deve imprimir: Olá Gemini

console.log(items.outerHTML)