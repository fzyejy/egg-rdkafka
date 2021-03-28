'use strict'
const Topic = require('./topic');

class Message {

    constructor({ topic, key = '', value = '', partition = null, timestamp = Date.now(), offset = -1 }, options = {}) {
        this._options = Object.assign({rawTopic: false}, options);
        if (this._options.rawTopic) {
            this._topic = topic;
        } else {
            this._topic = new Topic(topic).name;   
        }
        this._key = key;
        this._value = value;
        this._partition = partition;
        this._timestamp = timestamp;
        this._offset = parseInt(offset);
    }

    get topic() {
        return this._topic;
    }

    get key() {
        return this._key;
    }

    get value() {
        return this._value;
    }

    get partition() {
        return this._partition;
    }

    get timestamp() {
        return this._timestamp;
    }

    get offset() {
        return this._offset;
    }

    get options() {
        return this._options;
    }

    get() {
        return {
            topic: this._topic,
            key: this._key,
            value: this._value,
            partition: this._partition,
            timestamp: this._timestamp,
            offset: this._offset
        }
    }
}
module.exports = Message;