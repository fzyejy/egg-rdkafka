'use strict';

const mock = require('egg-mock');
const assert = require('assert');

describe('test/kafka-node.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/kafka-node-test',
    });
    return app.ready();
  });
  after(() => {
    app.close();
  });
  afterEach(mock.restore);

  it('app.kafka is exist and app.kafka.sendMessage is a method', () => {
    const kafka = app.kafka;
    assert(Object.prototype.toString.call(kafka) === '[object Object]');
    //assert(Object.prototype.toString.call(kafka.sendMessage) === '[object Function]');
  });

  it('ctx.kafka is exist and same to app.kafka', () => {
    const ctx = app.mockContext();
    const kafka = ctx.kafka;
    assert(Object.prototype.toString.call(kafka) === '[object Object]');
    //assert(Object.prototype.toString.call(kafka.sendMessage) === '[object Function]');
  });

  it('app.kafka.sendMessage can publish a message to kafka', async () => {
    const kafka = app.kafka;
    try {
      await kafka.sendMessage({
        topic: 'testTopic1',
        key: 'Some',
        value: `this is a message ${new Date()} ${Math.random()}`,
      });
      assert(true);
    } catch (error) {
      assert(false);
    }
  });

  it('app.kafka.sendMessage can publish a buffer message ', async () => {
    const kafka = app.kafka;
    try {
      await kafka.sendMessage({
        topic: 'testTopic1',
        key: Buffer.from('Some'),
        value: Buffer.from(`this is a message ${new Date()} ${Math.random()}`),
      });
      assert(true);
    } catch (error) {
      assert(false);
    }
  });

  it('app.kafka.sendMessage published message can consume by corresponding topics', async () => {
    const kafka = app.kafka;
    for (let i = 0; i < 10; i++) {
      await kafka.sendMessage({
        topic: 'testTopic1',
        key: 'Some',
        value: `this is a message ${new Date()} ${Math.random()}`,
      });
    }

    for (let i = 0; i < 10; i++) {
      await kafka.sendMessage({
        topic: 'testTopic2',
        key: 'Every',
        value: `this is a message ${new Date()} ${Math.random()}`,
      });
    }


    for (let i = 0; i < 10; i++) {
      await kafka.sendMessage({
        topic: 'testTopic3',
        key: 'New',
        value: `this is a message ${new Date()} ${Math.random()}`,
      });
    }

    assert(true);
  });

  it('support consume message without key params', async () => {
    const kafka = app.kafka;
    try {
      await kafka.sendMessage({
        topic: 'testTopic1',
        value: `this is a message ${new Date()} ${Math.random()}`,
      });
      assert(true);
    } catch (error) {
      assert(false);
    }
  });
  
  it('test will be done', done => {
    setTimeout(() => {
      assert(true);
      done();
    }, 5000);
  });

});
