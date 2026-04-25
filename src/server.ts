import { globalErrorHandler } from "./middlewares/global-error.middleware";
import { assignSocketToReqIO } from "@/middlewares/socket.middleware";
import { guardBasic } from "./middlewares/guard-basic.middleware";
import { prepareMigration } from "./utils/preparemigration.util";
import { connAuthBridge } from "@/middlewares/socket.middleware";
import { throttle } from "./middlewares/throttle.middleware";
import { registerEvents } from "@/utils/registerevents.util";
import unknownRoutes from "@/routes/unknown.routes";
import { toNodeHandler } from "better-auth/node";
import { source } from "@/configs/docs.config";
import cors, { type CorsOptions } from "cors";
import { logger } from "@/utils/logger.util";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { env } from "./utils/env.util";
import { Server } from "socket.io";
import "@/types/declaration.types";
import { auth } from "./lib/auth";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT) || 3000;
prepareMigration(process.env.NODE_ENV === "production");

const corsOptions: CorsOptions = {
  origin: env.FRONTEND_DOMAIN,
  credentials: true,
};

const io = new Server(httpServer, { cors: corsOptions });

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false }));

app.get("/api/auth/reference", (_, __) => __.redirect("/api/docs"));
app.use("/api/docs", throttle("docs_", 10, 10, 10), guardBasic({ admin: "admin" }), source);
app.all("/api/auth/*splat", throttle("auth_", 50, 10, 10), toNodeHandler(auth));
app.get("/docs/auth", async (_, res) => {
  res.json(await auth.api.generateOpenAPISchema());
});

app.use(assignSocketToReqIO(io));
app.use(express.static("public"));
app.use(express.static("dist"));

io.use(connAuthBridge);
io.on("connection", (socket) => registerEvents(socket, io));

// *__REGULAR ROUTES GO HERE__*.
app.use(unknownRoutes);
app.use(globalErrorHandler);

httpServer.listen(port as number, () => {
  logger.info(`server: ${env.BACKEND_DOMAIN}`);
  logger.info(`Docs: ${env.BACKEND_DOMAIN}/api/docs`);
});
