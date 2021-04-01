import axios, { AxiosError, AxiosResponse } from 'axios'
import { config } from '../config'
import { logger } from '../utils/logger-client';
import { promisify } from 'util';
import * as redis from 'redis';

export default class HichatManager {

    private static userId: string;
    private static authToken: string;
    private static cache: any;

    private static client: redis.RedisClient = redis.createClient(config.redis.host);
    private static getRedis = promisify(HichatManager.client.get).bind(HichatManager.client);
    private static setRedis = promisify(HichatManager.client.set).bind(HichatManager.client);

    private static async login(): Promise<void> {

        if (!HichatManager.client.connected) throw new Error('HiChat: Login Failed - connection to redis failed');

        HichatManager.getRedis('hi-user-id').then((redisRes: string | null) => {
            if (redisRes) HichatManager.userId = redisRes;
        })
        HichatManager.getRedis('hi-auth-token').then((redisRes: string | null) => {
            if (redisRes) HichatManager.authToken = redisRes;
        })

        if (!HichatManager.userId || !HichatManager.authToken) HichatManager.fetchAuthData()
    };

    public static async fetchAuthData() {
        await axios({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            url: `${config.chat.chatUrl}/${config.chat.chatLoginUrl}`,
            data: {
                username: config.chat.loginUser,
                password: config.chat.loginPass
            }
        }).then((res: AxiosResponse): void => {
            if (res.data && res.data.status === 'success') {
                const { userId, authToken } = res.data.data;
                HichatManager.userId = userId;
                HichatManager.setRedis('hi-user-id', JSON.stringify(userId));
                HichatManager.authToken = authToken;
                HichatManager.setRedis('hi-auth-token', JSON.stringify(authToken));
            } else {
                const loginError = new Error('Chat login failed');
                logger(loginError);
                throw loginError;
            }
        }).catch(err => {
            logger(err);
            throw err;
        })
    }

    private static async getAuthHeaders(): Promise<object> {

        if (HichatManager.userId && HichatManager.authToken) {
            return {
                'X-User-Id': HichatManager.userId,
                'X-Auth-Token': HichatManager.authToken,
                'Content-type': 'application/json'
            }
        }

        try {
            await HichatManager.login();
        } catch (err) {
            console.log(err);
            return err;
        }

        return await HichatManager.getAuthHeaders();
    }

    public static async createGroupForUser(userT: string, members: string[]) {

        const authHeaders = await HichatManager.getAuthHeaders();
        const builtTommyGroupName = HichatManager.buildGroupName(userT);
        const normalizedGroupName = HichatManager.getAllowedGroupTitleFromText(builtTommyGroupName);
        const hichatNormalizedMembers = HichatManager.normalizeHichatMembersList(members.concat(userT));
        const sendUrl = `${config.chat.chatUrl}/${config.chat.chatGroupUrl}.create`;

        return await axios({
            method: 'post',
            url: sendUrl,
            data: {
                name: normalizedGroupName,
                members: hichatNormalizedMembers
            },
            headers: { ...authHeaders }

        }).then(async (res: AxiosResponse) => {
            await HichatManager.setRoomAnnouncement(normalizedGroupName, config.chat.announcement);
            if (res?.data?.group) return normalizedGroupName;
            throw new Error('Group creation failed');
        })
    }

    private static async getGroupMembers(roomName: string) {
        const authHeaders = await HichatManager.getAuthHeaders();

        return await axios({
            method: 'GET',
            url: `${config.chat.chatUrl}/${config.chat.chatGroupUrl}.members?roomName=${roomName}`,
            headers: { ...authHeaders }
        }).then((res: AxiosResponse) => {
            if (res?.data) {
                const usernames = res.data.members.map(member => member.username);
                return usernames;
            } throw new Error('Get group members method failed');
        }).catch((error: AxiosError) => {
            logger(error);
            return;
        })
    }

    private static async removeMemberFromGroupFactory(roomName: string, member: string): Promise<void> {
        const authHeaders = await HichatManager.getAuthHeaders();
        if (member !== config.chat.loginUser) {
            await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.kick`,
                { roomName, username: member }, { headers: { ...authHeaders } })
                .catch(error => {
                    logger(error);
                });
        };
    }

    private static removeMembersFromGroup(roomName: string, members: string[]) {
        const promises = members.map(member => HichatManager.removeMemberFromGroupFactory(roomName, member));
        return Promise.all(promises);
    };

    private static buildGroupName(userT: string): string {
        const groupName = config.chat.hiChatGroupTitle(userT.split('@')[0]).toLowerCase();
        return HichatManager.getAllowedGroupTitleFromText(groupName);
    }

    public static async setRoomMembers(roomName: string, members: string[]) {
        const currentGroupMembers = await HichatManager.getGroupMembers(roomName);
        if (currentGroupMembers && currentGroupMembers.length > 0) {
            const membersToRemove = HichatManager.getNonItercectingItems(currentGroupMembers, members);
            const membersToAdd = HichatManager.getNonItercectingItems(members, currentGroupMembers);
            await HichatManager.removeMembersFromGroup(roomName, membersToRemove);
            await HichatManager.addMembersToGroup(roomName, membersToAdd);
        }
    };

    public static async updateUserGroupMembers(userT: string, members: string[]): Promise<string> {
        const builtTommyGroupName = HichatManager.buildGroupName(userT);
        const normalizedGroupName = HichatManager.getAllowedGroupTitleFromText(builtTommyGroupName);
        const hichatNormalizedMembers = HichatManager.normalizeHichatMembersList(members.concat(userT));
        await HichatManager.setRoomMembers(normalizedGroupName, hichatNormalizedMembers);
        return normalizedGroupName;
    }

    public static async setRoomAnnouncement(roomName: string, announcement: string) {
        const authHeaders = await HichatManager.getAuthHeaders();
        const result = await HichatManager.getGroupInfo(roomName);

        if (result && result.data) {
            const roomId = result.data.group._id;
            await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.setAnnouncement`,
                { roomId, announcement: announcement }, { headers: { ...authHeaders } })
                .catch(error => {
                    logger(error);
                    throw `Error: Could not set room ${roomName} announcement ${announcement}`;
                });
        }
    };

    private static async addMemberToGroupFactory(roomName: string, member: string) {
        const authHeaders = await HichatManager.getAuthHeaders();
        const result = await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.invite`, { roomName, username: member }, { headers: authHeaders });
        return result;
    };

    private static addMembersToGroup(roomName: string, members: string[]) {
        const promises = members.map(member => HichatManager.addMemberToGroupFactory(roomName, member));
        return Promise.all(promises);
    };

    public static async sendMessageToGroup(userT: string, text: string) {
        const builtTommyGroupName = HichatManager.buildGroupName(userT);
        const normalizedGroupName = HichatManager.getAllowedGroupTitleFromText(builtTommyGroupName);
        const authHeaders = await HichatManager.getAuthHeaders();
        await axios.post(`${config.chat.chatUrl}/${config.chat.chatMessageUrl}.postMessage`,
            { channel: `#${normalizedGroupName}`, text }, { headers: { ...authHeaders } })
            .then(res => res.data)
            .catch(error => {
                logger(error);
                throw new Error(`Failed to send message to group ${normalizedGroupName} `);
            })
    }

    private static normalizeHichatMembersList(membersList: string[]) {
        let nonDuplicate: string[] = [];
        const cleaner = membersList.map(member => {
            const lowermember = member.toLowerCase();
            const cleanChars = lowermember.replace(/[^a-zA-Z0-9@]/g, "")
            return (cleanChars[0] === 't' && cleanChars.split('@')[1] === 'aman') ? cleanChars : '';
        }).filter((obj: string) => obj && obj !== '')
        cleaner.forEach((user: string) => {
            if (!nonDuplicate.includes(user)) nonDuplicate.push(user)
        })
        return nonDuplicate;
    }

    private static getAllowedGroupTitleFromText(title: string): string {
        if (HichatManager.cache && HichatManager.cache[title])
            return HichatManager.cache[title];

        const isAlphaNumeric = 'a-zA-Z0-9';
        const isHebrewChars = 'א-ת';
        const isAllowedSpecialChars = '_.-';
        const regexString = `^${isAlphaNumeric}${isHebrewChars}${isAllowedSpecialChars}`;
        const regexExppresion = new RegExp(`[${regexString}]`, 'g');
        const allowedTitle = title.replace(regexExppresion, str => str.split('').map(() => '.').join(''));

        HichatManager.cache = HichatManager.cache || {};
        HichatManager.cache[title] = allowedTitle;

        return HichatManager.cache[title];
    }

    private static async getGroupInfo(roomName: string) {
        const authHeaders = await HichatManager.getAuthHeaders();
        const result = await axios({
            method: 'get',
            url: `${config.chat.chatUrl}/${config.chat.chatGroupUrl}.info?roomName=${roomName}`,
            headers: { ...authHeaders }
        });
        return result;
    };

    public static async isGroupExists(userT: string): Promise<any> {
        const builtTommyGroupName = HichatManager.buildGroupName(userT);
        const normalizedGroupName = HichatManager.getAllowedGroupTitleFromText(builtTommyGroupName);
        return HichatManager.getGroupInfo(normalizedGroupName).then(() => ({exists: true, groupName: normalizedGroupName})).catch(() => ({exists: false}));
    }


    /**
     * return every item in arr1 that doesnt exist in arr2
     * @param {*} arr1 
     * @param {*} arr2 
     */
    private static getNonItercectingItems(arr1: any[], arr2: any[]) {
        const symmetricDifference: any[] = [];
        arr1.forEach(arr1Item => {
            !arr2.map(item => item.toLowerCase()).includes(arr1Item.toLowerCase()) ? symmetricDifference.push(arr1Item) : null;
        });
        return symmetricDifference;
    };


}