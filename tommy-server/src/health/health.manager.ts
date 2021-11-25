import Axios, { AxiosRequestConfig } from "axios";

export default class HealthManager {
    static async isResponseOk(serviceName: string, axiosRequestConfig: AxiosRequestConfig) {
        try {
            await Axios(axiosRequestConfig);
            return true;
        } catch (error) {
            console.error(`${serviceName} has responsed an error while trying to check health`);
            return false;
        }
    }
} 
