import { wrapController } from '../utils/index'
import LehavaDataController from './lehavaData.controller';
import { Router } from "express";


const LehavaDataRouter: Router = Router();

LehavaDataRouter.get('/', wrapController(LehavaDataController.getData))


export default LehavaDataRouter;