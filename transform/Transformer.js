export default class Transformer {

    transformDeftoLambda(def) {
        const [_tag, name, args, body] = def;
        return ['var', name, ['lambda', args, body]];
    } 
    
    transformSwitchToIf(switchExp) {
        const [_tag, ...cases] = switchExp;
        const ifExp = ['if', null, null, null];

        let current = ifExp;

        for (let i = 0; i < cases.length; i++) {
            const [currentCond, currentBlock] = cases[i];
            current[1] = currentCond;
            current[2] = currentBlock;
            if (i + 1 < cases.length) {
                const next = cases[i + 1];
                const [nextCond, nextBlock] = next;
                if (nextCond === 'else') {
                    current[3] = nextBlock;
                    break; 
                } else {
                    current[3] = ['if', null, null, null];
                }
            } else {
                current[3] = ['else', null, currentBlock, null];
            }
            current = current[3];
        }

        return ifExp;
    }

    transformForToWhile(exp) {
        const [_tag, init, condition, increment, body] = exp;
        return ['begin',init,['while', condition, ['begin', body, increment]]];
    }
}