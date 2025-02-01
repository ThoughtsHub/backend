import express from "express";
import helmet from "helmet";
import _env from "./constants/env.js"; // env variables
import cookieParser from "cookie-parser";
import _connect from "./db/connect.js";
import r from "./routes/router.js";
import _close from "./db/close.js";
import initAssociation from "./associations/association.js";
import auth from "./middlewares/auth.js";

const app = express();
const port = _env.app.PORT;

// application can use cookies
app.use(express.json()); // body parser
app.use(cookieParser()); // cookie parser
app.use(helmet()); // many middleware functions

// login should not be with verification
app.use("/login", r.login);

app.use(auth.verify); // session verification middleware

// public folder
app.use(express.static(_env.app.PUBLIC));

// reduce fingerprinting
app.disable("x-powered-by");

// Connect to databases
await _connect.nosql();
await _connect.sql();
initAssociation(); // link all the tables

app.get("/test", (req, res) => {
  res.json(req.user);
});

app.use("/logout", r.logout);

app.all("*", (_, res) => {
  res.sendStatus(404); // Not found
});

const server = app.listen(port, () => {
  console.log(`Application started on http://${_env.app.HOST}:${port}`);
});

// shutdown of the application
{
  const shutDown = async () => {
    // Close running services here
    server.close();
    await _close.nosql();
    await _close.sql();

    console.debug("Gracefully closing the application");
  };

  process.on("SIGINT", async () => {
    console.debug("Recieved SIGINT");
    await shutDown();
  });

  process.on("SIGTERM", async () => {
    console.debug("Recieved SIGTERM/(nodemon restarts)");
    await shutDown();
  });
}
