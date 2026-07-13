import { config } from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserRepo from '../../modules/users/repositories/user.repository.js';

config();

const userRepo = new UserRepo();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL || 'http://localhost:3000'}/auth/google/callback`,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            done(new Error('Google profile email not found'), null);
            return;
          }

          let user = await userRepo.findOne({ email });
          if (!user) {
            user = await userRepo.create({
              email,
              fullName: profile.displayName,
              password: 'oauth',
              isVerified: true,
            });
          }
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth is disabled because GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are not configured.');
}

passport.serializeUser((user: any, done: (error: any, id?: string) => void) => done(null, user._id));
passport.deserializeUser(async (id: string, done: (error: any, user?: any) => void) => {
  try {
    const user = await userRepo.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
