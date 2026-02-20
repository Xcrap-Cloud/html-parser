use napi_derive::napi;
use scraper::Html;

use crate::engines::{select_first_by_css, select_first_by_xpath, select_many_by_css, select_many_by_xpath};

#[napi]
pub enum QueryType {
    CSS,
    XPath,
}

#[napi(object)]
pub struct QueryConfig {
    pub query: String,
    #[napi(js_name = "type")]
    pub query_type: QueryType,
}

#[napi]
pub struct HtmlElement {
    #[napi(js_name = "outerHTML")]
    pub outer_html: String,
}

#[napi]
impl HtmlElement {
    #[napi(getter)]
    pub fn text(&self) -> String {
        let fragment = Html::parse_fragment(&self.outer_html);
        let element = fragment.root_element();
        return element.text().collect::<Vec<_>>().join(" ");
    }

    #[napi(getter)]
    pub fn id(&self) -> Option<String> {
        let fragment = Html::parse_fragment(&self.outer_html);
        return self.get_real_element(&fragment)
            .and_then(|el| el.value().id())
            .map(|id_str| id_str.to_string());
    }

    fn get_real_element<'a>(&self, fragment: &'a Html,
    ) -> Option<scraper::ElementRef<'a>> {
        let element = fragment.root_element();

        return element
            .children()
            .filter_map(scraper::ElementRef::wrap)
            .next();
    }

    #[napi(getter)]
    pub fn tag_name(&self) -> String {
        let fragment = Html::parse_fragment(&self.outer_html);

        return match self.get_real_element(&fragment) {
            Some(el) => el.value().name().to_uppercase(),
            None => "UNKNOWN".to_string(),
        };
    }

    #[napi]
    pub fn get_attribute(&self, name: String) -> Option<String> {
        let fragment = Html::parse_fragment(&self.outer_html);

        return self.get_real_element(&fragment)
            .and_then(|el| el.value().attr(&name))
            .map(|v| v.to_string());
    }

    #[napi(getter)]
    pub fn attributes(&self) -> std::collections::HashMap<String, String> {
        let fragment = Html::parse_fragment(&self.outer_html);
        let mut attr_map = std::collections::HashMap::new();

        if let Some(el) = self.get_real_element(&fragment) {
            for (key, value) in el.value().attrs() {
                attr_map.insert(key.to_string(), value.to_string());
            }
        }

        return attr_map;
    }

    #[napi(getter)]
    pub fn class_name(&self) -> String {
        let fragment = Html::parse_fragment(&self.outer_html);

        return self.get_real_element(&fragment)
            .and_then(|el| el.value().attr("class"))
            .unwrap_or("")
            .to_string();
    }

    #[napi(getter)]
    pub fn class_list(&self) -> Vec<String> {
        let fragment = Html::parse_fragment(&self.outer_html);

        return match self.get_real_element(&fragment)
            .and_then(|el| el.value().attr("class")) 
        {
            Some(classes) => classes
                .split_whitespace()
                .map(|s| s.to_string())
                .collect(),
            None => vec![],
        };
    }

    #[napi]
    pub fn select_first(&self, options: SelectFirstOptions) -> Option<HtmlElement> {
        let query_config = options.query;

        match query_config.query_type {
            QueryType::CSS => {
                let document = Html::parse_fragment(&self.outer_html);
                return select_first_by_css(&document, query_config.query);
            },
            QueryType::XPath => {
                let package = sxd_html::parse_html(&self.outer_html);
                return select_first_by_xpath(&package, query_config.query);
            },
        }
    }

    #[napi]
    pub fn select_many(&self, options: SelectManyOptions) -> Vec<HtmlElement> {
        let query_config = options.query;

        match query_config.query_type {
            QueryType::CSS => {
                let document = Html::parse_fragment(&self.outer_html);
                return select_many_by_css(&document, query_config.query, options.limit);
            },
            QueryType::XPath => {
                let package = sxd_html::parse_html(&self.outer_html);
                return select_many_by_xpath(&package, query_config.query, options.limit);
            },
        }
    }
}

#[napi(object)]
pub struct SelectFirstOptions {
    pub query: QueryConfig,
}

#[napi(object)]
pub struct SelectManyOptions {
    pub query: QueryConfig,
    pub limit: Option<i32>,
}

#[napi]
pub fn css(query: String) -> QueryConfig {
    return QueryConfig {
        query: query,
        query_type: QueryType::CSS,
    };
}

#[napi]
pub fn xpath(query: String) -> QueryConfig {
    return QueryConfig {
        query: query,
        query_type: QueryType::XPath,
    };
}
