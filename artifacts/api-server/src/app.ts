import path from "path";
import { fileURLToPath } from "url";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getSecurityConfig } from './lib/securityConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

getSecurityConfig();
app.set('trust proxy', 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: false }));
app.use(cookieParser());
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

app.use("/api", router);

// In production, serve the built React web app from the same process.
// The Vite build outputs to artifacts/web/dist/public/ which is two directories
// up from this file's location at artifacts/api-server/dist/.
if (process.env["NODE_ENV"] === "production") {
  const webDistPath = path.resolve(__dirname, "../../web/dist/public");

  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(webDistPath));

  // SPA fallback: any route that isn't an API route gets index.html
  // so client-side routing works correctly.
  app.get("/{*splat}", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(webDistPath, "index.html"));
  });
}

export default app;
