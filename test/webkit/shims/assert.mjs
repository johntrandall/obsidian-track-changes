// node:assert for the WebKit run: the `assert` npm package, a port of Node's
// assert module (same deepStrictEqual semantics), not a hand-rolled subset.
import assert from "assert";
export const strict = assert.strict;
export default assert;
