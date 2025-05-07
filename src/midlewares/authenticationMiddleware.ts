import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    invalidOrExpiredToken,
    tokenNotFound,
    unauthorized
} from './common/authenticationMessage';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<any> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException({
                statusCode: 401,
                message: tokenNotFound,
                error: unauthorized,
            });
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            request.user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException({
                statusCode: 401,
                message: invalidOrExpiredToken,
                error: unauthorized,
            });
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const authorizationHeader = request.headers['authorization'];
        if (!authorizationHeader) return undefined;
        const [type, token] = authorizationHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
