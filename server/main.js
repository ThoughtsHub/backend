import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { AppRouter } from "../routes/router.js";
import "../utils/response.js";
import auth from "../middlewares/auth/auth.js";
import handleBody from "../middlewares/body.js";
import cors from "cors";

const app = express();

// Ensure consistent headers
app.use((req, res, next) => {
  res.setHeader("Origin-Agent-Cluster", "?0");
  next();
});

app.use(cors()); // development purposes

app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false, // for development
  })
);

app.use(express.static("./public"));

app.use(auth);
app.use(handleBody);

app.use("/", AppRouter);

export default app;
