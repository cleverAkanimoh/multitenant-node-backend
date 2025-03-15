import { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { globalErrorResolver } from "./globalErrorResolver";

import session from "express-session";
import passport from "../apps/authentication/controllers/socialControllers";
import { cacheMiddleware } from "./cachedMiddleware";

export const configureMiddleware = (app: Express) => {
  app.use(helmet());

  app.use(morgan("dev"));

  app.use(cacheMiddleware);

  app.use(globalErrorResolver);

  app.use(
    session({
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  console.log("Middlewares loaded successfully");
};
