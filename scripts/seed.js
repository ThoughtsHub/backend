import { initLink } from "../associations/link.js";
import { connectToPg } from "../db/pg.js";
import WordleWord from "../models/Wordle_Word.js";

await connectToPg();
await initLink();

const todaysWord = async (word, values) => {
  const result = await WordleWord.create({
    day: "02-06-2025",
    word,
    ...values,
  });
  console.log(result);
};

await todaysWord("blaze", {
  hindiTranslation: "धधकना",
  englishMeaning:
    "To burn brightly or intensely; to shine with a strong light.",
  hindiMeaning: "तेज़ी से जलना या चमकना।",
});
