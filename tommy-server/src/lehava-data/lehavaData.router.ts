import MetadataCache from '../metadata-cache/metadataCache';
import { Router, Request, Response, NextFunction } from "express";
import { config } from '../config'
import { logger } from '../utils/logger-client';
import LehavaData from "./lehavaData";


const LehavaDataRouter: Router = Router();


LehavaDataRouter.get('/', async (req: Request, res: Response) => {
    const data = await MetadataCache.getRedis(config.redis.lehavaDataKey);
    if (!data) {
        const lehavaData = new LehavaData();
        try {
            const networksServicesAndCategories = await lehavaData.getAllData();
            const jsonData = JSON.stringify(networksServicesAndCategories);
            MetadataCache.setRedis(config.redis.lehavaDataKey, config.redis.cachedReqsTTL, jsonData);
            return res.status(200).send({ status: "success", data: jsonData });
        } catch (err) {
            console.log(err);
            logger(err);
            return res.status(400).send(err);
        }
    }
    res.status(200).send({ status: "success", data });

});

export default LehavaDataRouter;