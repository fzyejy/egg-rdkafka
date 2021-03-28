'use strict'
const path = require('path');

class Topic {

    constructor(topic, options = {}) {
        this._name;
        this._options = options;
        this._topic = topic;
    }

    get name() {
        if (!this._options.raw && this._options.env) {
            return `${this._topic}-${this._options.env}`;
        } else {
            return this._topic;
        }
    }

    get dir() {
        return path.join(this._options.dir, this._topic);
    }

    get options() {
        return this._options;
    }
}
module.exports = Topic;