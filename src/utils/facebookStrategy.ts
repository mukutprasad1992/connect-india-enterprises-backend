import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor() {
        super({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/facebook/callback`,
            profileFields: ['id', 'emails', 'name', 'photos'],
            scope: ['email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const { id, emails, name, photos } = profile;
        return {
            provider: 'facebook',
            providerId: id,
            email: emails?.[0]?.value || null,
            firstName: name?.givenName || '',
            lastName: name?.familyName || '',
            profileImageURL: photos?.[0]?.value || '',
        };
    }
}
