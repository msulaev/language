export default function test(language, code, expected) {
    const exp = languageParser.parse(code);
    assert.strictEqual(language.eval(exp), expected);
}