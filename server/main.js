import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { AppRouter } from "../routes/router.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.static("./public"));

app.use("/", AppRouter);

export default app;
