
import { Request, Response, NextFunction } from 'express';
import axios from "axios";
import { config } from "../../config";
import amqp from "amqplib/callback_api";
import * as redis from "redis";
import { logger } from "../../utils/logger-client";




   export const healthCheck =((req: Request, res: Response, next: NextFunction,redisClient: redis.RedisClient, AccessTokenProvider: any ) => {
    console.log('health check')

        let healthCheck: string = '';
        const servicesArray: Array<{ serviceName: string; isAlive: boolean }> = [
          { serviceName: "Server", isAlive: true },
          { serviceName: "Client", isAlive: true },
          { serviceName: "RabbitMQ", isAlive: true },
          { serviceName: "Redis", isAlive: true },
          { serviceName: "Access Token", isAlive: true },
        ];
        const clientPromise = new Promise<void>((resolve, reject) =>
          axios
            .get(`${config.client.url}/isaliveclient`)
            .then((response) => resolve())
            .catch((err) => { reject(servicesArray[1].isAlive = false) })
  
        );
  
        const rabbitPromise = new Promise<void>((resolve, reject) => {
          amqp.connect(config.rabbitmq.url, (err, connection) => {
            if (err) {
              reject(servicesArray[2].isAlive = false)
            }
            else {
              resolve()
            }
          }
          );
        });
  
        const redisPromise = new Promise<void>((resolve, reject) => {
  
          if (redisClient.set('key', 'value')) {
            resolve();
          }
          else {
            reject(servicesArray[3].isAlive = false)
          }
        });
  
        const accessTokenPromise = new Promise<void>((resolve, reject) => {
          AccessTokenProvider.getAccessToken()
            .then(() => resolve())
            .catch(() => reject(servicesArray[4].isAlive = false))
        });
  
        Promise.all([clientPromise, rabbitPromise, redisPromise, accessTokenPromise].map(p => p.catch(e => e)))
          .finally(() => {
            servicesArray.forEach((service) => {
              if (service.isAlive) {
                healthCheck = `${healthCheck} ${service.serviceName} is up`;
              } else {
                healthCheck = `${healthCheck} ${service.serviceName} is down`;
              }
            });
  
            logger({ message: healthCheck });
            res.send(healthCheck);
          });
      });