const redis = require('redis');

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;

if (!redisUrl) {
  throw new Error('Redis connection URL is not defined.');
}

const client = redis.createClient({
  url: redisUrl
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});


const connectRedis = async () => {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log('Successfully connected to Upstash Redis!');
    } catch (err) {
      console.error('Failed to connect to Upstash Redis:', err);
    }
  }
};


connectRedis();

module.exports = client;