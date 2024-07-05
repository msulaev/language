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
            return this.eval(exp[1], env) + this.eval(exp[2], env);
        } 
        
        if (Array.isArray(exp) && exp[0] === '-') {
            return this.eval(exp[1], env) - this.eval(exp[2], env);
        }  
        
        if (Array.isArray(exp) && exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env);
        }        

        if (Array.isArray(exp) && exp[0] === '>') {
            return this.eval(exp[1], env) > this.eval(exp[2], env);
        }

        if (Array.isArray(exp) && exp[0] === '<') {
            return this.eval(exp[1], env) < this.eval(exp[2], env);
        }

        if (Array.isArray(exp) && exp[0] === '<=') {
            return this.eval(exp[1], env) <= this.eval(exp[2], env);
        }

        if (Array.isArray(exp) && exp[0] === '>=') {
            return this.eval(exp[1], env) >= this.eval(exp[2], env);
        }

        if (Array.isArray(exp) && exp[0] === '=') {
            return this.eval(exp[1], env) === this.eval(exp[2], env);
        }

        if (Array.isArray(exp) && exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        if (Array.isArray(exp) && exp[0] === 'set') {  
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }

        if (isVariableName(exp)){
            return env.lookup(exp);
        }

        if (Array.isArray(exp) && exp[0] === 'if') {
            const [_tag, condition, trueBranch, falseBranch] = exp;
            if (this.eval(condition, env)) {
                return this.eval(trueBranch, env);
            } 
            return this.eval(falseBranch, env);
        }

        // ---------------------------------------------
        // Block: sequence of expressions
        if (Array.isArray(exp) && exp[0] === 'begin') {
            const blockEnv = new Enviroment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        throw new Error(`not implemented: ${JSON.stringify(exp)}`);
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });
        return result;
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

// ---------------------------------------------
// Tests
const language = new Language(new Enviroment({
    null: null,
    true: true,
    false: false,
    GLOBAL: 'global 0.1'
}));

//test number & string
assert.strictEqual(language.eval(1), 1);
assert.strictEqual(language.eval('"hello"'), 'hello');
//test math expressions
assert.strictEqual(language.eval(['+', 1, 5]), 6);
assert.strictEqual(language.eval(['+', ['+', 3, 2], 5]), 10);
assert.strictEqual(language.eval(['*', ['+', 3, 2], 5]), 25);
//test variables
assert.strictEqual(language.eval(['var', 'x', 42]), 42);
assert.strictEqual(language.eval('x'), 42);
assert.strictEqual(language.eval(['var', 'y', 'true']), true);
// test block
assert.strictEqual(language.eval(
    ['begin',
        ['var', 'x', 10],
        ['var', 'y', 20],
        ['+', 'x', 'y']
    ]), 30);

assert.strictEqual(language.eval(
    ['begin',
        ['var', 'x', 10],
        ['begin',
            ['var', 'x', 20],
            'x'
        ],
        'x'
    ]), 10);

assert.strictEqual(language.eval(
    ['begin',
        ['var', 'val', 10],
        ['var', 'result', ['begin',
            ['var', 'x', ['+', 'val', 10]],
            'x'
        ]],
        'result'
    ]), 20);

// test set
assert.strictEqual(language.eval(
    ['begin',
        ['var', 'data', 10],
        ['begin',
            ['set', 'data', 100],
        ],
        'data'
    ]), 100);

//test if expression
assert.strictEqual(language.eval(
    ['begin',
        ['var', 'x', 10],
        ['var', 'y', 20],
        ['if',
            ['>', 'x', 10],
            ['set', 'y', 20],
            ['set', 'y', 30],
        ],
        'y'
    ]), 30);

console.log('all tests pass');
