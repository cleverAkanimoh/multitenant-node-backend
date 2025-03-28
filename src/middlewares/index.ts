import cookieParser from "cookie-parser";
import { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { globalErrorResolver } from "./globalErrorResolver";

// import passport from "../apps/authentication/controllers/socialControllers";
// import session from "express-session";

import { debugLog } from "../utils/debugLog";
import { cacheMiddleware } from "./cachedMiddleware";

export const configureMiddleware = (app: Express) => {
  app.use(helmet());

  app.use(morgan("dev"));

  app.use(cacheMiddleware);

  app.use(globalErrorResolver);

  app.use(cookieParser(process.env.SESSION_SECRET));

  // app.use(tenantMiddleware);

  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET as string,
  //     resave: false,
  //     saveUninitialized: true,
  //   })
  // );

  // app.use(passport.initialize());
  // app.use(passport.session());

  debugLog("Middlewares loaded successfully");
};
