import firebase from "firebase-admin";
import { firebaseConfigFile } from "../env.config.js";
import fs from "fs";

const firebaseConfig = JSON.parse(
  fs.readFileSync(firebaseConfigFile).toString()
);

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
});

export default firebase;
