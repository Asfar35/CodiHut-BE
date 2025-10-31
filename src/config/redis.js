const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10262.c323.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 10262
    }
});
module.exports = redisClient;


