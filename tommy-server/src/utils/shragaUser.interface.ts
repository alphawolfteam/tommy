import express from 'express';

export default interface IShragaRequest extends express.Request {
    user?: {
        adfsId?: string;
    },
    body: any;
}