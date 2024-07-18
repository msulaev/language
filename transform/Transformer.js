export default class Transformer {

    transformDeftoLambda(def) {
        const [_tag, name, args, body] = def;
        return ['var', name, ['lambda', args, body]];
    }   
}