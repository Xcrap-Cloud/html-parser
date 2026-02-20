use crate::types::HtmlElement;
use scraper::{Html};
use sxd_document::Package;
use sxd_xpath::evaluate_xpath;

pub fn select_first_by_css(document: &Html, query: String) -> Option<HtmlElement> {
    let selector = scraper::Selector::parse(&query).ok()?;

    return document.select(&selector)
        .next()
        .map(|element| HtmlElement {
            outer_html: element.html(),
        });
}

pub fn select_first_by_xpath(document_xpath: &Package, query: String) -> Option<HtmlElement> {
    let document = document_xpath.as_document();
    let result = evaluate_xpath(&document, &query).ok()?;

    if let sxd_xpath::Value::Nodeset(nodeset) = result {
        return nodeset.document_order_first().map(|node| HtmlElement {
            outer_html: node.string_value(),
        });
    }

    return None;
}

pub fn select_many_by_css(document: &Html, query: String, limit: Option<i32>) -> Vec<HtmlElement> {
    let selector = match scraper::Selector::parse(&query) {
        Ok(sel) => sel,
        Err(_) => return vec![],
    };

    let selection = document.select(&selector);

    let iter = selection.map(|element| HtmlElement {
        outer_html: element.html()
    });

    if let Some(l) = limit {
        if l > 0 {
            return iter.take(l as usize).collect();
        }
    }

    return iter.collect();
}

pub fn select_many_by_xpath(package: &Package, query: String, limit: Option<i32>) -> Vec<HtmlElement> {
    let document = package.as_document();

    let result = match evaluate_xpath(&document, &query) {
        Ok(res) => res,
        Err(_) => return vec![],
    };

    if let sxd_xpath::Value::Nodeset(nodeset) = result {
        let nodes = nodeset.document_order();

        let iter = nodes
            .iter()
            .map(|node| HtmlElement {
                outer_html: node.string_value()
            });

        if let Some(l) = limit {
            if l > 0 {
                return iter.take(l as usize).collect();
            }
        }

        return  iter.collect();
    }

    return vec![];
} 
