export class ApiException { 

    public status: number;

    public message?: string | undefined;

    constructor(status: number, message?: string) {
        this.message = message;
        this.status = status;
    }
}

export class AuthenticationException extends ApiException { 
    constructor (message?: string) {
        super(401, message);
    }
}

export class AuthorizationException extends ApiException {
    constructor (message?: string) {
        super(403, message);
    }
}

export class BadRequestException extends ApiException {
    constructor (message?: string) {
        super(400, message);
    }
}

export class NotFoundException extends ApiException {
    constructor (message?: string) {
        super(404, message);
    }
}