import assert from 'assert';
/**
 * interpreter
 */

class Language{
    eval(exp){
        if(isNumber(exp){
            return exp;
        }
        throw new Error('not implemented');
    }
}

function isNumber(exp){
    return typeof exp === 'number';
}

const language = new Language();
assert.strictEqual(language.eval(1), 1);
