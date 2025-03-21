import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { AppRouter } from "../routes/router.js";
import "../utils/response.js";
import auth from "../middlewares/auth/auth.js";
import handleBody from "../middlewares/body.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.static("./public"));

app.use(auth);
app.use(handleBody);

app.use("/", AppRouter);

export default app;
