import LehavaDataManager from './lehavaData.manager';

class LehavaDataController {
    static async getData(req: any, res: any) {
        const data = await LehavaDataManager.getData();
        LehavaDataManager.updateRedisData();
        if (data) {
            res.status(200).send({ status: "success", data });
        }
    }
}
export default LehavaDataController;