import * as redis from 'redis';
import { config } from '../config'
import { promisify } from 'util';

export default class RedisClient {
    private static client: redis.RedisClient = redis.createClient(config.redis.host);
    private static getRedis = promisify(RedisClient.client.get).bind(RedisClient.client);

    public static async getLehavaAccessKey() {
        const accessKey = await RedisClient.getRedis('X-AccessKey');
        if(accessKey) return JSON.parse(accessKey).rest_access.access_key;
    }
} 
