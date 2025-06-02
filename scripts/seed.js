import { initLink } from "../associations/link.js";
import { connectToPg } from "../db/pg.js";
import WordleWord from "../models/Wordle_Word.js";

await connectToPg();
await initLink();

const todaysWord = async (word) => {
  const result = await WordleWord.create({ day: "02-06-2025", word });
  console.log(result);
};

await todaysWord("racer");
