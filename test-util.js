import  yyparse  from './parser/languageParser.js';

export default function test(language, code, expected) {
    const exp = yyparse.parse(code);
    assert.strictEqual(language.eval(exp), expected);
}