import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserRepo from '../modules/auth/user.repo';

const userRepo = new UserRepo();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
      try {
        let user = await userRepo.findOne({ email: profile.emails![0].value });
        if (!user) {
          user = await userRepo.create({
            email: profile.emails![0].value,
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