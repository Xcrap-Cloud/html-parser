#![deny(clippy::all)]
use napi_derive::napi;
mod engines;
mod parser;
mod query_builders;
mod types;
pub use parser::*;
pub use query_builders::*;
pub use types::*;

#[napi]
pub fn parse(content: String) -> HTMLParser {
    return HTMLParser::new(content);
}
