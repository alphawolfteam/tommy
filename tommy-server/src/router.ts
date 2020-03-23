import { Router, Request, Response, NextFunction } from "express";
import axios from 'axios';
import { NotPermittedError } from "./utils/errors/user";
import { AccessTokenProvider } from './access-token/access-token-service';


const AppRouter: Router = Router();

AppRouter.get('/isalive', (req: Request, res: Response) => res.status(200).send('Server Is Up'));

AppRouter.post('*', (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.user;

    try {
        if (user.adfsId.split('@')[0] === req.body.cr.z_username) {
            next();
        } else {
            throw new NotPermittedError;
        }
    } catch (err) {
        throw new NotPermittedError;
    }
});

AppRouter.all('*', async (req: Request, res: Response) => {
    console.log(req.method, `http:/${req.url}`);
    try {        
        const apiHeaders = { ...req.headers };
        apiHeaders['X-AccessKey'] = await AccessTokenProvider.getAccessToken();

        const apiRes = await axios({
            method: req.method,
            url: `http:/${req.url}`,
            params: req.params,
            headers: apiHeaders,
            data: req.body
        });

        res.status(apiRes.status).send(apiRes.data);
    } catch (e) {
        console.log('error')

        console.error(e.message);
        res.send(e.data);
    }
})

export { AppRouter };