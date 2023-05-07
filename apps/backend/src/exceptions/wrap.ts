
import { NextFunction, Request, RequestHandler, Response } from 'express';

export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function wrap(fn: AsyncRequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): unknown => {
        return (<AsyncRequestHandler> fn)(req, res, next).catch(next);
    };

}