'use strict';

const { HighLevelProducer } = require('node-rdkafka');
class Producer extends HighLevelProducer{

    constructor(config) {
        super(Object.assign({}, config.commonOption, config.producerOption));
        this._brokers = config.commonOption['metadata.broker.list'].split(',');
        this._clientId = config.producerOption['client.id'];
    }

    get brokers() {
        return this._brokers;
    }

    get clientId() {
        return this._clientId;
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

    async send(message) {
        let result = new Promise((resolve, reject) => {
            super.produce(message.topic, message.partition, Buffer.from(message.value), message.key, message.timestamp, (err, offset) => {
                if (err) return reject(err);
                return resolve(offset);
            });
        });
        return {
            topic: message.topic,
            offset: result
        }
    };

}
module.exports = Producer;
