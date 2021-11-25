import express from 'express';
import HealthController from './health.controller';

const HealthRouter: express.Router = express.Router();

HealthRouter.get('/lehava', HealthController.lehavaHealthCheck)

HealthRouter.get('*', (_req: express.Request, res: express.Response) => res.send('alive') )

export default HealthRouter; 
