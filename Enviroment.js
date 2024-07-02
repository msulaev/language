/** 
* Scope
*/

export default class Enviroment{

    constructor(record = {}, parent = null) {
        this.record = record;
        this.parent = parent;
    }

    define(name, value) {
        this.record[name] = value;
        return value;
    }

    lookup(name) {
        if (this.record.hasOwnProperty(name)) {
            return this.record[name];
        }
        if (this.parent) {
            return this.parent.lookup(name);
        }
        throw new ReferenceError(`Variable "${name}" is not defined.`);
    }
}
