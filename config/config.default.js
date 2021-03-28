'use strict';

const path = require('path');

/**
 * egg-rdkafka default config
 * @member Config #rdkafka
 * @property {String} SOME_KEY - some description
 */
exports.kafka = {
    commonOption: {
        'metadata.broker.list': '',
    },
    consumerOption: {
        'group.id': 'default-consumer',
        'enable.auto.commit': false,
    },
    producerOption: {
        'client.id': 'default-client',
    },
    topicOption: {
        dir: path.join(process.cwd(), 'app/kafka'),
        env: '',
        excludeTopics: [],
        rawTopics: []
    },
    messageOption: {
        
    }
};
