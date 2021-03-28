'use strict';

//const EventEmitter = require('events');
const { KafkaConsumer } = require('node-rdkafka');

class Consumer extends KafkaConsumer {

    constructor(config) {
        super(Object.assign({}, config.commonOption, config.consumerOption));
        this._brokers = config.commonOption['metadata.broker.list'].split(',');
        this._groupId = config.consumerOption['group.id'];
        this._autoCommit = false;
        this._topics = [];
        this._counter = 0;
        this._numMessages = 5;
        this.on('data', data => {
            if (data.key === null) data.key = '';
            if (data.value === null) data.value = '';
            this._counter++;
            console.log(this._counter);
            this.emit(
                'message',
                {
                    topic: data.topic,
                    key: data.key.toString(),
                    value: data.value.toString(),
                    partition: data.partition,
                    timestamp: data.timestamp,
                    offset: data.offset
                }
            );
            this.commitMessage(data);
            console.log(data.topic);
            console.log(data.value.toString());
        });

    }

    get brokers() {
        return this._brokers;
    }

    get groupId() {
        return this._groupId;
    }

    get autoCommit() {
        return this._autoCommit;
    }

    get topics() {
        return this._topics;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            super.connect(null, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve('ok');
                }
            });
        });
    }

    disconnect() {
        super.disconnect();
    }

    async subscribe(topics) {
        for (let i in topics) {
            if (this._topics.includes(topics[i])) continue;
            this._topics.push(topics[i]);
        }
        console.log(this._topics);
        super.subscribe(this._topics);
    }

    async consume() {
        super.consume();
    }
}

module.exports = Consumer;
