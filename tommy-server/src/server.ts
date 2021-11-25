import express, { Request, Response, NextFunction } from 'express';
import http from "http";
import bodyParser from "body-parser";
import helmet from "helmet";
import session from "express-session";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { LehavaRouter } from "./lehava.router";
import HichatRouter from './hichat/hichat.router'
import LehavaDataRouter from "./lehava-data/lehavaData.router";
import {
  userErrorHandler,
  serverErrorHandler,
  rabbitmqErrorHandler,
  unknownErrorHandler,
} from "./utils/errors/handler";
import { AuthenticationHandler } from "./authentication/handler";
import { AuthenticationRouter } from "./authentication/router";
import { AuthenticationMiddleware } from "./authentication/middleware";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import * as redis from "redis";
import connectRedis from "connect-redis";
import { logger } from "./utils/logger-client";
import axios from "axios";
import amqp from "amqplib/callback_api";
import { AccessTokenProvider } from "./access-token/access-token-service";
import { healthCheck } from './utils/middlewares/health'
import HealthRouter from './health/health.router';

export class Server {
  public app: express.Application;
  private server: http.Server;


  public static bootstrap(): Server {
    return new Server();
  }

  private constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.initializeAuthenticator();
    this.app.use(function (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      logger({
        message: "Upcoming request",
        info: {
          method: req.method,
          url: req.url,
          query: req.query,
          headers: req.headers,
          body: req.body,
          user: req.user,
        }
      });
      next();
    });
    this.app.get("/openconf", AuthenticationMiddleware.requireAuth, (_req: express.Request, res: express.Response) => res.json(config.openConf));
    this.app.use("/api", AuthenticationMiddleware.requireAuth, LehavaRouter);
    this.app.use("/hichat", AuthenticationMiddleware.requireAuth, HichatRouter);
    this.app.use("/lehavadata", AuthenticationMiddleware.requireAuth, LehavaDataRouter);
    this.app.use("/thirdpartyhealth", AuthenticationMiddleware.requireAuth, HealthRouter);

    this.initializeErrorHandler();
    this.app.get(
      "/user",
      AuthenticationMiddleware.requireAuth,
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => res.send(req.user)
    );
    this.app.all(
      "/*",
      AuthenticationMiddleware.requireAuth,
      createProxyMiddleware({ target: config.client.url, changeOrigin: false })
    );
    this.server = http.createServer(this.app);
    this.server.listen(config.server.port, () => {
      logger({
        message:
          `Server running in ${process.env.NODE_ENV || "development"
          } environment on port ${config.server.port}`
      });
    });
  }

  public close() {
    this.server.close();
  }

  private configureMiddlewares() {
    this.app.use(helmet());

    this.app.get("/isalive", function (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      res.status(200).send("Server Is Up");
    });


    this.app.get('/health', (req: Request, res: Response, next: NextFunction) => {
      console.log('health check')
      healthCheck(req, res, next, redisClient, AccessTokenProvider)
    })

    this.app.use(cors());

    this.app.use(function (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, Origin, X-Requested-With, Content-Type"
      );
      res.setHeader("Access-Control-Allow-Origin", "*");

      return next();
    });

    const RedisStore = connectRedis(session);
    const redisClient: redis.RedisClient = redis.createClient(config.redis.host);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(
      session({
        store: new RedisStore({ client: redisClient }),
        secret: config.auth.secret,
        resave: false,
        saveUninitialized: true,
      })
    );

    this.app.set("trust proxy", true);

    this.app.all(
      "*",
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        res.setHeader("Last-Modified", new Date().toUTCString());
        next();
      }
    );
  }

  private initializeErrorHandler() {
    this.app.use(function (
      error: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      logger(error);
      next();
    });

    this.app.use(userErrorHandler);
    this.app.use(serverErrorHandler);
    this.app.use(rabbitmqErrorHandler);
    this.app.use(unknownErrorHandler);
  }

  private initializeAuthenticator() {
    AuthenticationHandler.initialize(this.app);
    this.app.use("/auth/", AuthenticationRouter);
  }
}
