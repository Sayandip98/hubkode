import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

// --- Route imports ---
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import commitRoutes from "./routes/commit.routes.js";
import fileRoutes from "./routes/file.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import pullRequestRoutes from "./routes/pullRequest.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import searchRoutes from "./routes/search.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
    errors: [],
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
    errors: [],
  },
});

app.use("/api/v1", globalLimiter);
app.use("/api/v1/auth", authLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const morganFormat = env.nodeEnv === "production" ? "combined" : "dev";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    skip: (req) => req.url === "/api/v1/health",
  }),
);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HubKode API is running",
    data: {
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

// API ROUTES

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/repositories", repositoryRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/commits", commitRoutes);
app.use("/api/v1/repositories/:owner/:repoName", fileRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/pull-requests", pullRequestRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/ai", aiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
