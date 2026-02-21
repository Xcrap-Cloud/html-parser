use napi_derive::napi;

use crate::{QueryConfig, QueryType};

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
