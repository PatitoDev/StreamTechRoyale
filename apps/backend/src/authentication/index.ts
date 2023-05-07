import SECRETS from '@streamtechroyale/secrets';
import * as jose from 'jose';
import { AuthenticationConfiguration } from './config';
import { Request } from 'express';
import { AuthenticationException, AuthorizationException } from '@streamtechroyale/models/responses/apiExceptions';

const validateAdmin = async (req: Request) => {
    const userId = await validate(req);
    if (!AuthenticationConfiguration.adminId.includes(userId)) {
        throw new AuthorizationException('User is not admin');
    }
    return userId;
};

const validate = async (req: Request):Promise<string> => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) throw new AuthenticationException('Missing token in header');
        const token = authorization.replace('Bearer ', '');
        const encryptionKey = new TextEncoder().encode(SECRETS.jwt.secret);
        const jwtVerifyResult = await jose.jwtVerify(token, encryptionKey, {
            audience: SECRETS.jwt.audience,
            issuer: SECRETS.jwt.issuer,
        });
        const id = jwtVerifyResult.payload['id'];
        if (typeof id !== 'string') throw new AuthenticationException('Invalid token');
        return id;
    } catch (e) {
        if (e instanceof AuthenticationException) throw e;
        throw new AuthenticationException('Invalid or expired token');
    }
};

export const Authentication = {
    validate,
    validateAdmin
};