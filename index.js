import assert from 'assert';
import Enviroment from './Enviroment.js';

/**
 * interpreter
 */

class Language {

    constructor(global = new Enviroment()){
        this.global = global;
    }

    eval(exp, env = this.global) {
        if (isNumber(exp)) {
            return exp;
        }

        if (isString(exp)) {
            return exp.slice(1, -1);
        }

        if (Array.isArray(exp) && exp[0] === '+') {
            return this.eval(exp[1]) + this.eval(exp[2]);
        }  
        
        if (Array.isArray(exp) && exp[0] === '*') {
            return this.eval(exp[1]) * this.eval(exp[2]);
        }        

        if (exp[0] === 'var'){
            const[_, name, value] = exp;
            return env.define(name, this.eval(value));
        }

        if (isVariableName(exp)){
            return env.lookup(exp);
        }

        throw new Error(`not implemented: ${JSON.stringify(exp)}`);
    }
}

function isNumber(exp) {
    return typeof exp === 'number';
}

function isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp[exp.length - 1] === '"';
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(exp);
}

const language = new Language( new Enviroment({
    null: null,
    true: true,
    false: false,
    GLOBAL: 'global 0.1'
}));
assert.strictEqual(language.eval(1), 1);
assert.strictEqual(language.eval('"hello"'), 'hello');
assert.strictEqual(language.eval(['+', 1, 5]), 6);
assert.strictEqual(language.eval(['+', ['+', 3 , 2], 5]), 10);
assert.strictEqual(language.eval(['*', ['+', 3 , 2], 5]), 25);
assert.strictEqual(language.eval(['var', 'x', 42]), 42);
assert.strictEqual(language.eval('x'), 42);
assert.strictEqual(language.eval(['var', 'y', 'true']), true);



console.log('all tests pass');
