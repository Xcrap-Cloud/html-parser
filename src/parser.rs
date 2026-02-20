use napi_derive::napi;
use scraper::Html;
use sxd_document::Package;

use crate::types::{HtmlElement, QueryType, SelectFirstOptions, SelectManyOptions};
use crate::engines::{
    select_first_by_css, 
    select_first_by_xpath, 
    select_many_by_css, 
    select_many_by_xpath
};

#[napi]
pub struct HtmlParser {
    pub(crate) document: Html,
    pub(crate) package: Package,
}

#[napi]
impl HtmlParser {
    #[napi(constructor)]
    pub fn new(content: String) -> Self {
        let document = Html::parse_document(&content);
        let package = sxd_html::parse_html(&content);

        return HtmlParser {
            document,
            package,
        }
    }

    #[napi]
    pub fn select_first(&self, options: SelectFirstOptions) -> Option<HtmlElement> {
        let query_config = options.query;

        match query_config.query_type {
            QueryType::CSS => {
                return select_first_by_css(&self.document, query_config.query);
            },
            QueryType::XPath => {
                return select_first_by_xpath(&self.package, query_config.query);
            },
        }
    }

    #[napi]
    pub fn select_many(&self, options: SelectManyOptions) -> Vec<HtmlElement> {
        let query_config = options.query;

        match query_config.query_type {
            QueryType::CSS => {
                return select_many_by_css(&self.document, query_config.query, options.limit);
            }
            QueryType::XPath => {
                return select_many_by_xpath(&self.package, query_config.query, options.limit);
            }
        }
    }
}