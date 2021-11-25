import express from 'express';
import HealthManager from './health.manager';
import { config } from '../config';
import { AccessTokenProvider } from '../access-token/access-token-service';
import RedisClient from './redis.client';

export default class HealthController {
    public static async lehavaHealthCheck(_req: express.Request, res: express.Response): Promise<void> {
        const accessKey = await RedisClient.getLehavaAccessKey();
        const alive = await HealthManager.isResponseOk('lehava-api', {
            url: config.client.requests.GET_FIRST_NETWORK_URL,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-AccessKey': accessKey,
            },
            timeout: 1000,
        });
        alive ? res.json('alive') : res.status(503).send('Service unavailable');
    }
}
