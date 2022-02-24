import LehavaDataManager from './lehavaData.manager';

class LehavaDataController {
    static async getData(req: any, res: any) {
        const data = await LehavaDataManager.getData();
        if (data === 'loading') return res.status(200).send({ status: "success", data: "tommy is loading" });
        await LehavaDataManager.updateRedisData();
        if (data) {
            res.status(200).send({ status: "success", data });
        }
    }
}
export default LehavaDataController;