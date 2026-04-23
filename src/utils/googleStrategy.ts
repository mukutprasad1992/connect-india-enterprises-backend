import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, emails, name, photos } = profile;

        const user = {
            providerId: id,
            email: emails?.[0]?.value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            profileImageURL: photos?.[0]?.value,
            provider: 'google',
            accessToken, // optional but useful
        };

        done(null, user);
    }
}