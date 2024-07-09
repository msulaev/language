import assert from 'assert';
import Enviroment from './Enviroment.js';
import test from './test-util.js';

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

        if (Array.isArray(exp) && exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            let result;
            while (this.eval(condition, env)) {
                result = this.eval(body, env);
            }
            return result;
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

test(language, '1', 1); // Test number evaluation
test(language, '"hello"', 'hello'); // Test string evaluation
test(language, '(+ 1 5)', 6); // Test addition
test(language, '(+ (+ 3 2) 5)', 10); // Test nested addition
test(language, '(* (+ 3 2) 5)', 25); // Test multiplication with nested addition
test(language, '(begin (var x 42) x)', 42); // Test variable declaration and usage
test(language, '(begin (var x 10) (var y 20) (+ x y))', 30); // Test block execution
console.log('all tests pass');
