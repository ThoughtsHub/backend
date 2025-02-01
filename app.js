import express from "express";
import helmet from "helmet";
import _env from "./constants/env.js"; // env variables
import cookieParser from "cookie-parser";
import _connect from "./db/connect.js";
import r from "./routes/router.js";
import _close from "./db/close.js";
import initAssociation from "./assciations/association.js";

const app = express();
const port = _env.app.PORT;

// application can use cookies
app.use(cookieParser());
app.use(helmet()); // many middleware functions

// public folder
app.use(express.static(_env.app.PUBLIC));

// reduce fingerprinting
app.disable("x-powered-by");

// Connect to databases
// _connect.nosql();
// _connect.sql();
// initAssociation(); // link all the tables

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

// use of _routes
// app.use("/custom_route", r.customRouter)

const server = app.listen(port, () => {
  console.log(`Application started on http://${_env.app.HOST}:${port}`);
});

// shutdown of the application
{
  const shutDown = () => {
    // Close running services here
    server.close();
    // _close.nosql();
    // _close.sql();

    console.debug("Gracefully closing the application");
  };

  process.on("SIGINT", () => {
    console.debug("Recieved SIGINT");
    shutDown();
  });

  process.on("SIGTERM", () => {
    console.debug("Recieved SIGTERM/(nodemon restarts)");
    shutDown();
  });
}
