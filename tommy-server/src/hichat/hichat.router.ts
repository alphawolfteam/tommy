import express from 'express';
import HichatController from './hichat.controller';

const HichatRouter: express.Router = express.Router();

HichatRouter.post('/sendmsg', HichatController.sendMessageToGroup)

HichatRouter.get('/isalive', (req: express.Request, res: express.Response) => res.status(200).send('Server Is Up'));

export default HichatRouter;