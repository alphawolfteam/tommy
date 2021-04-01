const axios = require("axios");
import { config } from '../config';
import { logger } from '../utils/logger-client';

// const { chatUrl, chatGroupUrl, chatMessageUrl, chatLoginUrl, loginUser, loginPass } = require("./config/config");
// const { trycatch } = require("../utils/util");


export class Chat {
    userId: any;
    authToken: any;
    cache: any;

    async login(): Promise<any> {
        if (this.userId && this.authToken)
            return { userId: this.userId, authToken: this.authToken };
        const loginUrl = `${config.chat.chatUrl}/${config.chat.chatLoginUrl}`;
        let result = await axios({
            method: 'post',
            url: loginUrl,
            data: {
                username: config.chat.loginUser,
                password: config.chat.loginPass
            }
        });
        if (result) {
            if (result.data && result.data.status === "success") {
                const { data } = result;
                const { userId, authToken } = data.data;
                this.userId = userId;
                this.authToken = authToken;
                return { userId, authToken };
            } else {
                logger(new Error("Chat login failed"));
            }
        }
    }

    async getAuthHeaders() {
        const { userId, authToken } = await this.login();
        const headers = {
            'X-Auth-Token': authToken,
            'X-User-Id': userId
        };
        return headers;
    };

    getAllowedGroupTitleFromText(title: string) {
        if (this.cache && this.cache[title])
            return this.cache[title];

        const isAlphaNumeric = 'a-zA-Z0-9';
        const isHebrewChars = 'א-ת';
        const isAllowedSpecialChars = '_.-';
        const regexString = `^${isAlphaNumeric}${isHebrewChars}${isAllowedSpecialChars}`;
        const regexExppresion = new RegExp(`[${regexString}]`, 'g');
        const allowedTitle = title.replace(regexExppresion, str => str.split('').map(() => '.').join(''));

        this.cache = this.cache || {};
        this.cache[title] = allowedTitle;

        return this.cache[title];
    }

    async createGroup(groupName: string, members: string[]) {
        const authHeaders = await this.getAuthHeaders();
        const name = this.getAllowedGroupTitleFromText(groupName);
        const sendUrl = `${config.chat.chatUrl}/${config.chat.chatGroupUrl}.create`;
        let result = await axios({
            method: 'post',
            url: sendUrl,
            data: {
                name: name,
                members: members
            },
            headers: { ...authHeaders }

        });
        if (result) {
            const { _id: groupId } = result.data.group;
            return result;
        }
    };

    async getGroupInfo(roomName: string) {
        const authHeaders = await this.getAuthHeaders();
        const result = await axios({
            method: 'get',
            url: `${config.chat.chatUrl}/${config.chat.chatGroupUrl}.info?roomName=${roomName}`,
            headers: { ...authHeaders }
        });
        return result;
    };

    async getGroupMembers(roomName: string) {
        const result = await this.getGroupInfo(roomName);

        if (result && result.data) {
            const usernames = result.data.group.usernames;
            return usernames;
        }
        return false;
    };


    async addMemberToGroupFactory(roomName: string, member: string) {
        const authHeaders = await this.getAuthHeaders();
        const result = await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.invite`, { roomName, username: member }, { headers: authHeaders });
        return result;
    }

    addMembersToGroup(roomName: string, members: string[]) {
        const promises = members.map(member => this.addMemberToGroupFactory(roomName, member));
        return Promise.all(promises);
    }


    // const addMemberToGroupFactory = roomId => async member => {
    //     const authHeaders = await this.getAuthHeaders();
    //     return await wrappedAxiosPost(`${chatUrl}/${chatGroupUrl}.invite`, { roomId, username: member }, 
    //     { headers: { ...authHeaders } });
    // };

    // const addMembersToGroup = async (roomId, members) => {
    //     const addMemberToRoom = addMemberToGroupFactory(roomId);
    //     const results = await Promise.all(members.map(addMemberToRoom));
    //     return results.map(({ result }) => result);
    // };

    async removeMemberFromGroupFactory(roomName: string, member: string) {
        const authHeaders = await this.getAuthHeaders();
        return member !== config.chat.loginUser ? await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.kick`, { roomName, username: member }, { headers: { ...authHeaders } }) : true;

        // return member !== config.chat.loginUser ? await wrappedAxiosPost(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.kick`, { roomId, username: member }, { headers: { ...authHeaders } }) : true;
    };

    removeMembersFromGroup(roomName: string, members: string[]) {
        const promises = members.map(member => this.removeMemberFromGroupFactory(roomName, member));
        return Promise.all(promises);
    };

    /**
     * return every item in arr1 that doesnt exist in arr2
     * @param {*} arr1 
     * @param {*} arr2 
     */
    getNonItercectingItems(arr1: any[], arr2: any[]) {
        const symmetricDifference: any[] = [];
        arr1.forEach(arr1Item => {
            !arr2.map(item => item.toLowerCase()).includes(arr1Item.toLowerCase()) ? symmetricDifference.push(arr1Item) : null;
        });
        return symmetricDifference;
    };

    async setRoomMembers(roomName: string, members: string[]) {
        const currentGroupMembers = await this.getGroupMembers(roomName);
        if (currentGroupMembers && currentGroupMembers.length > 0) {
            const membersToRemove = this.getNonItercectingItems(currentGroupMembers, members);
            const membersToAdd = this.getNonItercectingItems(members, currentGroupMembers);
            await this.removeMembersFromGroup(roomName, membersToRemove);
            await this.addMembersToGroup(roomName, membersToAdd);
        }
    };

    async setRoomAnnouncement(roomName: string, announcement: string) {
        const authHeaders = await this.getAuthHeaders();
        const result = await this.getGroupInfo(roomName);

        if (result && result.data) {
            const roomId = result.data.group._id;
            await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.setAnnouncement`,
                { roomId, announcement: announcement }, { headers: { ...authHeaders } });
        }
    };

    async closeGroup(roomName: string) {
        const authHeaders = await this.getAuthHeaders();
        const { result } = await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.archive`, { roomName }, { headers: { ...authHeaders } })
        return result;
    }

    async renameGroup(roomName: string, groupName: string) {
        const authHeaders = await this.getAuthHeaders();
        const name = this.getAllowedGroupTitleFromText(groupName);
        const { result } = await axios.post(`${config.chat.chatUrl}/${config.chat.chatGroupUrl}.rename`, { roomName, name }, { headers: { ...authHeaders } });
        return result;
    }

    async sendMessageToGroup(roomName: string, text: string) {
        const authHeaders = await this.getAuthHeaders();
        const { result } = await axios.post(`${config.chat.chatUrl}/${config.chat.chatMessageUrl}.postMessage`, { channel: `#${roomName}`, text }, { headers: { ...authHeaders } });
        return result;
    }

    getAllowedGroupName(userT: string) {
        const groupName = config.chat.hiChatGroupTitle(userT).toLowerCase();
        return this.getAllowedGroupTitleFromText(groupName);
    }
}
