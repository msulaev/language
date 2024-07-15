class Enviroment {
    constructor(records = {}, parent = null) {
        this.records = records;
        this.parent = parent;
    }

    define(name, value) {
        this.records[name] = value;
        return value;
    }

    assign(name, value) {
        this.resolve(name).records[name] = value;
        return value;
    }

    lookup(name) {
        return this.resolve(name).records[name];
    }

    resolve(name) {
        if (this.records.hasOwnProperty(name)) {
            return this;
        }
        if (this.parent == null) {
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }
        return this.parent.resolve(name);
    }
}

export default Enviroment;
