import SECRETS from '@streamtechroyale/secrets';
import express from 'express';
import { SignJWT } from 'jose';
import { twitchApi } from '../index';
import { wrap } from '../exceptions/wrap';
import { Authentication } from '../authentication';
const app = express.Router();

app.get('/', wrap(async (req, res) => {
    const encryptionKey = new TextEncoder().encode(SECRETS.jwt.secret);
    const authorization = req.headers.authorization;
    if (!authorization) throw new Error();
    const twitchCode = authorization.replace('Bearer ', '');
    const userData = await twitchApi.validateToken(twitchCode);
    const jwt = await new SignJWT({
        ...userData,
        aud: SECRETS.jwt.audience,
        iss: SECRETS.jwt.issuer
    })
        .setProtectedHeader({
            alg: 'HS256'
        })
        .setExpirationTime('5h')
        .sign(encryptionKey);

    res.send(JSON.stringify({ token: jwt, user: userData }));
}));

app.get('/validate', wrap(async (req, res) => {
    await Authentication.validate(req);
    res.sendStatus(200);
}));

export const AuthController = app;