import HichatManager from './hichat.manager';
import { config } from '../config';
import express from 'express';
import IShragaRequest from '../utils/shragaUser.interface';
import { AxiosError } from 'axios';

export default class HichatController {
    public static sendMessageToGroup = async (req: IShragaRequest, res: express.Response) => {
        try {
          HichatManager.isGroupExists(req?.user?.adfsId).then(async (response) => {
              const supportUsers = await config.chat.getSupportUsers();
              const userAdfsId = req.user.adfsId;
              if (response.exists) {
                  HichatManager.updateUserGroupMembers(userAdfsId, supportUsers).then(() => {
                      HichatController.sendMsgToGroup(req, res, `${config.chat.hiChatUrl}/${response.groupName}`);
                  });
                  res.json({ url: `${config.chat.hiChatUrl}/${response.groupName}` });
              }
              HichatManager.createGroupForUser(userAdfsId, supportUsers).then((groupName) => {
                  HichatController.sendMsgToGroup(req, res, `${config.chat.hiChatUrl}/${response.groupName}`);
                  res.json({ url: `${config.chat.hiChatUrl}/${groupName}` });
              });
          });
        } catch (error) {
          if(error.code && error.code === '401') return HichatManager.fetchAuthData().then(()=> HichatController.sendMessageToGroup(req, res))
          console.error(error);
        }
    };

    private static sendMsgToGroup(req: IShragaRequest, res: express.Response, groupUrl) {
        const { taskId, taskDate, taskLink } = req.body;

        const message = config.chat.hiChatTaskMessageStructure(taskId, taskDate, taskLink);

        HichatManager.sendMessageToGroup(req?.user?.adfsId, message).then(async () => {
            res.json({ url: groupUrl });
        });
    }
}
