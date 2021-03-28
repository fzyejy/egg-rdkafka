'use strict';

const createSubscription = (dir, ctx) => {
    const Subscriber = require(dir);
    return new Subscriber(ctx);
}

module.exports = createSubscription;