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
        console.log(`Evaluating: ${JSON.stringify(exp)}`); // Logging
        if (this._isNumber(exp)) {
            return exp;
        }

        if (this._isString(exp)) {
            return exp.slice(1, -1);
        }

        if (Array.isArray(exp) && exp[0] === '++') {
            const operand = exp[1];
            if (this._isVariableName(operand)) {
                const currentValue = env.lookup(operand);
                if (typeof currentValue !== 'number') {
                    throw new Error(`Variable ${operand} is not a number`);
                }
                const newValue = currentValue + 1;
                env.assign(operand, newValue);
                return newValue;
            } else if (typeof operand === 'number') {
                return operand + 1;
            } else {
                throw new Error(`Operand ${operand} is not a variable name or a number`);
            }
        }

        if (Array.isArray(exp) && exp[0] === 'or') {
            for (let i = 1; i < exp.length; i++) {
                if (this.eval(exp[i], env)) {
                    return this.eval(exp[i], env);
                }
            }
            return this.eval(exp[exp.length - 1], env);
        }

        if (Array.isArray(exp) && exp[0] === 'and') {
            for (let i = 1; i < exp.length; i++) {
                if (!this.eval(exp[i], env)) {
                    return this.eval(exp[i], env);
                }
            }
            return this.eval(exp[exp.length - 1], env);
        }

        if (Array.isArray(exp) && exp[0] === 'not') {
            return !this.eval(exp[1], env);
        }

        if (Array.isArray(exp) && exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        if (Array.isArray(exp) && exp[0] === 'set') {  
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }

        if (this._isVariableName(exp)){
            console.log(`Looking up variable: ${exp}`); // Logging
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

        if (Array.isArray(exp) && exp[0] === 'def') {
            const [_tag, name, args, body] = exp;
            const varExp = ['var', name, ['lambda', args, body]];
            console.log(`Defining function: ${name}`); // Logging
            return this.eval(varExp, env);
        }

        // ---------------------------------------------
        // Block: sequence of expressions
        if (Array.isArray(exp) && exp[0] === 'lambda') {
            const [_tag, args, body] = exp;
            return {
                args,
                body,
                env, // closure
            };
        }

        if (Array.isArray(exp) && exp[0] === 'begin') {
            const blockEnv = new Enviroment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        if(Array.isArray(exp)){
            const fn = this.eval(exp[0], env); 
            console.log(`Function call: ${fn.args ? fn.args : 'built-in function'}`); // Logging
            const args = exp.slice(1).map(arg => this.eval(arg, env));
            if (typeof fn === 'function') { // built-in function
                return fn(...args);
            }

            const activationRecord = {};
            fn.args.forEach((arg, index) => {
                activationRecord[arg] = args[index];
            });

            const closureEnv = new Enviroment(activationRecord, fn.env);
            return this._evalBody(fn.body, closureEnv);
        }

        throw new Error(`not implemented: ${JSON.stringify(exp)}`);
    }
    
    _evalBody(body, env) {
        if(body[0] === 'begin') {  
            return this._evalBlock(body, env);
        }
        return this.eval(body, env);
    }
    
    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });
        return result;
    }

    _isNumber(exp) {
        return typeof exp === 'number';
    }
    
    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp[exp.length - 1] === '"';
    }
    
    _isVariableName(exp) {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.test(exp);
    }
}

// ---------------------------------------------
// Tests
const globalEnv = new Enviroment({
    null: null,
    true: true,
    false: false,
    GLOBAL: 'global 0.1',
    '+'(op1, op2) { return op1 + op2; },
    '-'(op1, op2=null) { 
        if(op2 == null) return -op1;
        return op1 - op2; },
    '*'(op1, op2) { return op1 * op2; },
    '/'(op1, op2) { return op1 / op2; },
    '>'(op1, op2) { return op1 > op2; },
    '<'(op1, op2) { return op1 < op2; },
    '<='(op1, op2) { return op1 <= op2; },
    '>='(op1, op2) { return op1 >= op2; },
    '='(op1, op2) { return op1 === op2; },
    print(...args) { console.log(...args); },
});

const language = new Language(globalEnv);

test(language, '1', 1); // Test number evaluation
test(language, '"hello"', 'hello'); // Test string evaluation
test(language, '(+ 1 5)', 6); // Test addition
test(language, '(+ (+ 3 2) 5)', 10); // Test nested addition
test(language, '(* (+ 3 2) 5)', 25); // Test multiplication with nested addition
test(language, '(begin (var x 42) x)', 42); // Test variable declaration and usage
test(language, '(begin (var x 10) (var y 20) (+ x y))', 30); // Test block execution
test(language, '(or 1 2)', 1); // Test logical OR
test(language, '(or 1 2 3)', 1); // Test logical OR with multiple values
test(language, '(and 1 2)', 2); // Test logical AND
test(language, '(not 1)', false); // Test logical NOT
test(language, '(++ 1)', 2); // Test increment
//test(language, '(++ "foo")', 'Operand "foo" is not a variable name or a number'); // Test increment with string
test(language, '(begin (var x 1) (++ x) x)', 2); // Test increment in block
language.eval(['print', '"hello"', '"world"']); // Test print
test(language,'(begin (def square (x) (* x x)) (square 2))', 4); // Test function definition and usage
test(language, '(begin (def calc (x y) (begin (var z 30) (+ (* x y) z))) (calc 2 3))', 36); // Test function definition with block
test(language, `
    (begin 
        (def makeCounter (initial) 
            (begin 
                (var count initial)
                (def counter () 
                    (begin 
                        (set count (++ count)) 
                        count)))
        (makeCounter 0))
    (var counter1 (makeCounter 5))
    (var counter2 (makeCounter 10))
    (counter1)
    (counter1)
    (counter2)
)`, 11);
test(language, `
    (begin
        (def onClick (callback)
         (begin
           (var x 10)
           (var y 20)
           (callback (+ x y))))
        (onClick (lambda (data) (* data 10)))
    )`, 300);
test(language, `
    ((lambda (x) (* x x)) 2)
`, 4);
test(language, `
    (begin
        (var square (lambda (x) (* x x)))
    (square 2))
`, 4);
console.log('all tests pass');
