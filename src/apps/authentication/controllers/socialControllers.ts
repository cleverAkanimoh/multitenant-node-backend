import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as InstagramStrategy } from "passport-instagram";
import dotenv from "dotenv";
import { prisma } from "../../../core/prisma";
import { designerType, userType } from "../../../core/constants";
import { NextFunction, Response, Request } from "express";
import { generateToken } from "../services";
import { frontendUrl } from "../../../core/configs";
import Joi from "joi";
import { generateDefaultUsername } from "../../../utils/generateDefaultUsername";

dotenv.config();

const createOrFindUser = async (
  profile: any,
  provider: string,
  designerId: string
) => {
  let user = await prisma.user.findUnique({
    where: { email: profile.emails[0].value },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        password: "",
        isActive: new Date(),
        provider: provider,
        designerId,
        username: generateDefaultUsername(profile.name.givenName),
      },
    });
  }

  return user;
};

const createOrFindDesigner = async (profile: any, provider: string) => {
  let company = await prisma.company.findUnique({
    where: { email: profile.emails[0].value },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        email: profile.emails[0].value,
        password: "",
        isActive: new Date(),
        provider: provider,
      },
    });
  }

  return company;
};

const authenticateUserOrDesigner = async (
  req: any,
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: any
) => {
  try {
    const { role, designerId } = req.query;

    if (role === designerType) {
      const company = await createOrFindDesigner(profile, profile.provider);
      return done(null, company);
    } else if (role === userType && designerId) {
      const user = await createOrFindUser(
        profile,
        profile.provider,
        designerId
      );
      return done(null, user);
    }

    return done(new Error("Invalid role or missing company"), null);
  } catch (error) {
    return done(error, null);
  }
};

const setupStrategy = (Strategy: any, name: string, options: any) => {
  passport.use(
    new Strategy(
      {
        ...options,
        passReqToCallback: true,
      },
      authenticateUserOrDesigner
    )
  );
};

setupStrategy(GoogleStrategy, "google", {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/auth/google/callback",
});

setupStrategy(FacebookStrategy, "facebook", {
  clientID: process.env.FACEBOOK_CLIENT_ID!,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  callbackURL: "/auth/facebook/callback",
  profileFields: ["id", "emails", "name"],
});

setupStrategy(InstagramStrategy, "instagram", {
  clientID: process.env.INSTAGRAM_CLIENT_ID!,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
  callbackURL: "/auth/instagram/callback",
});

const querySchema = Joi.object({
  role: Joi.string().valid(designerType, userType).required(),
  designerId: Joi.string().optional(),
});

const validateQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error } = querySchema.validate(req.query);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  next();
};

const socialAuthHandler = (provider: string) => [
  validateQuery,
  (req: Request, res: Response, next: NextFunction) => {
    const { role, designerId } = req.query;
    passport.authenticate(provider, {
      scope: ["profile", "email"],
      state: JSON.stringify({ role, designerId }),
    })(req, res, next);
  },
];

const socialAuthCallbackHandler = (provider: string) => [
  validateQuery,
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      provider,
      (err: any, userOrDesigner: { id: string; designerId: string }, info: any) => {
        if (err || !userOrDesigner) {
          return res.redirect(`${frontendUrl}/auth/login?error=authentication_failed`);
        }

        const token = generateToken(userOrDesigner.id, userOrDesigner.designerId);
        res.redirect(`${frontendUrl}/auth/success?token=${token}`);
      }
    )(req, res, next);
  },
];

export const googleAuth = socialAuthHandler("google");
export const googleAuthCallback = socialAuthCallbackHandler("google");

export const facebookAuth = socialAuthHandler("facebook");
export const facebookAuthCallback = socialAuthCallbackHandler("facebook");

export const instagramAuth = socialAuthHandler("instagram");
export const instagramAuthCallback = socialAuthCallbackHandler("instagram");

export default passport;
