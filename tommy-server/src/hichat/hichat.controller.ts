import HichatManager from './hichat.manager'
import { config } from '../config'
import express from 'express'
import IShragaRequest from '../utils/shragaUser.interface'

export default class HichatController {

    public static assignUserGroup = async (req: IShragaRequest, res: express.Response) => {
        HichatManager.isGroupExists(req?.user?.adfsId).then(async groupExists => {
            if (groupExists) {
                HichatManager.updateUserGroupMembers(req.user.adfsId, await config.chat.getSupportUsers()).then(groupName => {
                    res.json({ url: `${config.chat.hiChatUrl}/${groupName}` });
                });
            } else {
                HichatManager.createGroupForUser(req.user.adfsId, await config.chat.getSupportUsers()).then(groupName => {
                    res.json({ url: `${config.chat.hiChatUrl}/${groupName}` });
                });
            }
        })
    }

    public static sendMessageToGroup = async (req: IShragaRequest, res: express.Response) => {
        const message = config.chat.hiChatTaskMessageStructure(req.body.taskId, req.body.taskDate, req.body.taskLink);
        HichatManager.sendMessageToGroup(req?.user?.adfsId, message).then(() => {
            res.send({ status: 'Message sent to group successfully' });
        })
    }

}