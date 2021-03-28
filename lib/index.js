'use strict';

const path = require('path');
const fs = require('fs');
const Producer = require('./producer');
const Consumer = require('./consumer');
const Topic = require('./topic');
const Message = require('./message');
const createSubscription = require('./subscription');
const createEventsProxy = require('eventsproxy');

module.exports = async app => {
    const config = app.config.kafka;
    const ep = createEventsProxy();
    const consumer = new Consumer(config);
    const subscriptions = new Map();
    const producer = new Producer(config);
    if (producer.brokers.length > 0) {
        await producer.connect();
        app.kafka = {
            async sendMessage({
                topic,
                key,
                value,
                partition,
                timestamp
            }, options = {}) {
                return await producer.send(
                    new Message({
                            topic,
                            key,
                            value,
                            partition,
                            timestamp
                        },
                        Object.assign({
                            rawTopic: false
                        }, config.messageOption, options)
                    )
                );
            }
        };
    }

    ep.once('app_ready', async () => {
        const topics = [];
        const topicDirs = fs.readdirSync(path.join(app.config.baseDir, config.topicOption.dir), {
            withFileTypes: true
        });
        const topicOption = config.topicOption;
        topicDirs.forEach(dirent => {
            if (dirent.isDirectory()) {
                if (config.topicOption.excludeTopics.includes(dirent.name)) return;
                if (config.topicOption.rawTopics.includes(dirent.name)) {
                    topicOption.raw = true;
                } else {
                    topicOption.raw = false;
                }
                topics.push(new Topic(dirent.name, topicOption));
            }
        });
        const ctx = app.createAnonymousContext();
        topics.forEach(topic => {
            const subscriptionDirs = fs.readdirSync(path.join(app.config.baseDir, topic.dir), {
                withFileTypes: true
            });
            subscriptionDirs.forEach(dirent => {
                if (dirent.isFile()) {
                    const key = dirent.name.match(/^(.*).js$/);
                    if (key) {
                        if (subscriptions.has(`${topic.name}:${key[1]}`) && !topic.options.raw) return;
                        subscriptions.set(`${topic.name}:${key[1]}`, createSubscription(path.join(app.config.baseDir, topic.dir, dirent.name), ctx))
                    }
                }
            });
        });

        if (consumer.brokers.length > 0) {
            consumer.on('event.log', function (log) {
                app.logger.info(`[egg-kafka-event-log] kafkaHost: ${consumer.brokers} groupId: ${consumer.groupId}\n ${log}`);
            });
            consumer.on('event.stats', function (stats) {
                app.logger.info(`[egg-kafka-event-stats] kafkaHost: ${consumer.brokers} groupId: ${consumer.groupId}\n ${stats}`);
            });
            consumer.on('event.error', function (error) {
                app.logger.error(`[egg-kafka-event-error] kafkaHost: ${consumer.brokers} groupId: ${consumer.groupId}\n ${error}`);
            });
            consumer.on('event.throttle', function (throttle) {
                app.logger.info(`[egg-kafka-event-throttle] kafkaHost: ${consumer.brokers} groupId: ${consumer.groupId}\n ${throttle}`);
            });
            await consumer.connect();
            app.logger.info(`[egg-kafka] kafkaHost: ${consumer.brokers} groupId: ${consumer.groupId} consumer connected!`);
            const topicNames = [];
            topics.forEach(topic => {
                if (!topicNames.includes(topic.name)) {
                    topicNames.push(topic.name);
                }
            });
            await consumer.subscribe(topicNames);            
            consumer.on('message', ({
                topic,
                key,
                value,
                partition,
                timestamp,
                offset
            }) => {
                const message = new Message({
                    topic,
                    key,
                    value,
                    partition,
                    timestamp,
                    offset
                }, Object.assign({
                    rawTopic: true
                }, config.messageOption));
                let subcriber = subscriptions.get(`${message.topic}:${message.key}`);
                if (subcriber) subcriber.subscribe(message.get());
                else {
                    subcriber = subscriptions.get(`${message.topic}:__default`);
                    if (subcriber) subcriber.subscribe(message.get());
                }
            });
            await consumer.consume();
        } else {
            app.logger.info(`[egg-kafka] brokers are empty,consume does not connect!`);
        }
    })

    app.beforeClose(async () => {
        producer.disconnect();
        app.logger.info('[egg-kafka] producer has disconnected!');
        consumer.disconnect();
        app.logger.info('[egg-kafka] consumer has disconnected!');
    });
    app.ready(() => {
        app.coreLogger.info('[egg-rdkafka] ready!');
        ep.emit('app_ready');
    });
};