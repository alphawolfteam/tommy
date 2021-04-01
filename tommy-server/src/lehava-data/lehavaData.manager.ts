import { config } from "../config";
import { logger } from '../utils/logger-client';
import MetadataCache from "../metadata-cache/metadataCache";
import { LehavaDataError } from '../utils/errors/application'
import LehavaData from "./lehavaData";
import moment from "moment";


// Returns time difference between CURRENT time and dateToCompare in hours
const getTimeDifference = (date: string) => {
    const currentTime = moment();
    const dateToCompare = moment(new Date(date))
    return currentTime.diff(dateToCompare, 'h');
}
export class LehavaDataManager {
    private static lehavaData = new LehavaData();

    static async getData() {
        const data = await MetadataCache.getRedis(config.redis.lehavaDataKey);
        return data ? data : LehavaDataManager.getLehavaDataAndSetInRedis();
    }

    private static async getLehavaDataAndSetInRedis() {
        try {
            const data = await this.lehavaData.getAllData();
            const jsonData = JSON.stringify(data);
            await MetadataCache.setRedisNoExpiry(config.redis.lehavaDataKey, jsonData);
            const currentTime = moment().toString();
            await MetadataCache.setRedisNoExpiry(config.redis.lehavaDataStoredTimeKey, currentTime);
            return jsonData;
        } catch (err) {
            logger(err);
            console.log(err);
            throw new LehavaDataError(err)
        }
    }

    static async updateRedisData() {
        const dataTime = await MetadataCache.getRedis(config.redis.lehavaDataStoredTimeKey);
        if (!dataTime || getTimeDifference(dataTime) > config.redis.lehavaDataTTL) {
            this.getLehavaDataAndSetInRedis();
        }
    }
}

export default LehavaDataManager;
