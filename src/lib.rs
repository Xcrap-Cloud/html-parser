#![deny(clippy::all)]
use napi_derive::napi;
mod types;
mod engines;
mod parser;
mod query_builders;
pub use types::*;
pub use parser::*;
pub use query_builders::*;

#[napi]
pub fn parse(content: String) -> HTMLParser {
    return HTMLParser::new(content);
}