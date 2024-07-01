import assert from 'assert';

/**
 * interpreter
 */

class Language {
    eval(exp) {
        if (isNumber(exp)) {
            return exp;
        }

        if (isString(exp)) {
            return exp.slice(1, -1);
        }

        if (exp[0] === '+') {
            return exp[1] + exp[2];
        }

        throw new Error('not implemented');
    }
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp[exp.length - 1] === '"';
}

const language = new Language();
assert.strictEqual(language.eval(1), 1);
assert.strictEqual(language.eval('"hello"'), 'hello');
assert.strictEqual(language.eval(['+', 1, 5]), 6);

console.log('all tests pass');
