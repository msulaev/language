export default class Enviroment{

    constructor(record={}){
        this.record = record;
    }

    define(name, value){
        this.record[name] = value;
        return value;
    }

    lookup(name){
        if (!this.record.hasOwnProperty(name)){
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }
        return this.record[name];
    }
}

