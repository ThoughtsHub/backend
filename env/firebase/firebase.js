import firebase from "firebase-admin";
import { firebaseConfigFile } from "../env.config.js";

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfigFile),
});

export default firebase;
