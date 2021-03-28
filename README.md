# egg-rdkafka

- [简体中文](README.zh_CN.md)

该插件是[rdkafka](https://github.com/Blizzard/node-rdkafka) 的封装, 方便在egg.js 环境下使用的一个egg风格的插件, 并提供了方便的api发送给kafka消息的方法 部分详细配置请参考 [https://github.com/Blizzard/node-rdkafka](https://github.com/Blizzard/node-rdkafka)

目前该版本为项目组内测版本，可用于测试项目与部分生产项目，希望各开发人员在使用过程中，提供宝贵的建议及意见，积极加入该插件的维护工作中


## 依赖说明

### 依赖的 egg 版本
--- | ---
2.x | 😁
1.x | 😁
0.x | 😁

### 依赖的 Node 版本
node >= 8.0.0  😁

## 使用方案

1、同步插件目录，并npm i
2、将插件目录整个复制到项目的node_modules目录

## 开启插件

```js
// config/plugin.js
exports.rdkafka = {
  enable: true,
  package: 'egg-rdkafka',
};
```

## 配置
```js
// {app_root}/config/config.default.js
exports.kafka = {
  commonOption: {  //通用配置
    'metadata.broker.list': '',//kafka 集群地址
  },
  consumerOption: { //消费者配置
    'group.id': 'rdkafka',  //设置消费者组id
    'enable.auto.commit': false  //是否自动提交，目前该配置无效，强制在消费时候自动提交
  },
  producerOption: { //生产者配置
    'client.id': 'default-client', // 标记生产者
  },
  topicOption: {
    dir: path.join(process.cwd(), '/app/kafka'), // 消费者订阅目录
    env: '', // 环境变量，会在topic后面自动加上后缀-${env}，例：例如env = test，foo文件夹转化成topic时候会变成foo-test
    excludeTopics: [], // 不订阅目录下的指定文件夹（topic）
    rawTopics: [] // 忽略env参数订阅目录下的指定文件夹（topic），如果遇到带env参数的topic和不带env参数的topic冲突，则以不带env参数的topic为主
  },
  messageOption: {
    // 保留
  }
};
```

## 详细配置

请到 https://github.com/edenhill/librdkafka/blob/v1.4.2/CONFIGURATION.md 查看详细配置项说明（仅对commonOption，consumerOption，producerOption有效）。

## 目录结构

```js
egg-project
├── package.json
├── app.js (optional)
├── app
|   ├── router.js
│   ├── controller
│   ├── service
│   └── kafka (optional)  --------> like `controller, service...`
│       ├── someTopic (optional)  -------> 文件夹名称代表kafka主题，如someTopic
│            ├── someKey1.js(optional)  ------> 订阅key为someKey1的消息
|            └── someKey2.js(optional)  ------> 订阅key为someKey2的消息
|            └── __default.js(optional)  ------> 订阅的key都未命中时，默认订阅，包括key为空的情况。
// |    
├── config
|   ├── plugin.js
|   ├── config.default.js
│   ├── config.prod.js
|   ├── config.test.js (optional)
|   ├── config.local.js (optional)
|   └── config.unittest.js (optional)


```  
## 使用注意

> Note: 你必须设置 app.config.topicOption.dir， egg-rdkafka-node 需要基于 这个去加载所订阅的topic


## 使用案例

```js
// {app_root}/controller/index.js
class IndexController extends Controller {
  async index() {
    await this.ctx.kafka.sendMessage({
      topic: 'someTopic', // 指定 kafka 目录下 的topic 
      key: 'someKey', // 指定 kafka 下的 topic 目录 对应key的consumer
      value: JSON.stringify({
        username: 'JohnApache',
        userId: 10001,
        gender: 0
      })
    });
  }

  async some() {
    this.ctx.kafka.sendMessageSync({
      topic: 'someTopic', // 指定 kafka 目录下的 topic 
      key: 'someKey', // 指定 kafka 下的 topic 目录 对应key 的consumer
      value: JSON.stringify({
        username: 'JohnApache',
        userId: 10001,
        gender: 0
      })
    }, () => {
      // success callback 
    }, () => {
      // error callback 
    })
  }
}

// {app_root}/kafka/someTopic/someKeyConsumer.js
class SomeKeySubscription extends Subscription {
  async subscribe(message) {
    const { topic, key, value, partition, timestamp, offset } = message;
    this.ctx.logger.info(`consume message ${value} by topic ${topic} key ${key} consumer`);
    await asyncTask();
  }
}
```
## 提问交流

## License

[MIT](LICENSE)