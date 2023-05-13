import SECRETS from '@streamtechroyale/secrets';
import * as jose from 'jose';
import { AuthenticationConfiguration } from './config';
import { Request } from 'express';
import { AuthenticationException, AuthorizationException } from '@streamtechroyale/models/responses/apiExceptions';
import { UserDto } from '@streamtechroyale/models';

const validateAdmin = async (req: Request) => {
    const user = await validate(req);
    if (!AuthenticationConfiguration.adminId.includes(user.id)) {
        throw new AuthorizationException('User is not admin');
    }
    return user;
};

const validate = async (req: Request):Promise<UserDto> => {
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
        const name = jwtVerifyResult.payload['name'];
        const email = jwtVerifyResult.payload['email'];
        const isAdmin = jwtVerifyResult.payload['isAdmin'];
        const profilePicture = jwtVerifyResult.payload['profilePicture'];

        if (
            typeof id !== 'string' ||
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof profilePicture !== 'string' 
        ) throw new AuthenticationException('Invalid token');

        return {
            id,
            name,
            email,
            profilePicture,
            isAdmin: !!isAdmin,
        };
    } catch (e) {
        if (e instanceof AuthenticationException) throw e;
        throw new AuthenticationException('Invalid or expired token');
    }
};

export const Authentication = {
    validate,
    validateAdmin
};