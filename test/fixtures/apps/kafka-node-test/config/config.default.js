'use strict';
//const path = require('path');
exports.keys = '123456';

exports.kafka = {
  commonOption: {
      'metadata.broker.list': '192.168.3.100:9092,192.168.3.100:9093,192.168.3.100:9094',
  },
  consumerOption: {
      'group.id': 'rd18',
      'enable.auto.commit': false,
      'offset_commit_cb': function(err, topicPartitions) {

        if (err) {
          // There was an error committing
          console.error(err);
        } else {
          console.log(`Commit went through. Let's log the topic partitions`);
          console.log(topicPartitions);
        }
    
      }
  },
  producerOption: {
      'client.id': 'default-client',
  },
  topicOption: {
      dir: './app/kafka',
      env: '',
      excludeTopics: [],
      rawTopics: []
  },
  messageOption: {
      
  }
};

