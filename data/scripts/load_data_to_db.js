import { initLink } from "../../associations/link.js";
import { connectToPg, closePg } from "../../db/pg.js";
import fs from "fs";
import Institute from "../../models/Institute.js";
import { Op } from "sequelize";
import updateLoader from "../../utils/loader.js";

const loadData = async () => {
  // Load the data
  const stringified_loaded_data = fs
    .readFileSync("./data/loaded_data/college_and_universities.json")
    .toString();
  const data = JSON.parse(stringified_loaded_data);
  console.log(`\nData loaded, ${data.length} rows`);

  // Loading data in db
  console.log("Loading data in database...");
  let total_loaded = 0;
  for (let i = 0; i < data.length; i++) {
    const obj = data[i];
    const institute = await Institute.findOne({
      where: { aisheCode: obj.aisheCode },
    });
    if (institute === null) await Institute.create(obj);
    else
      await Institute.update(obj, {
        where: { id: institute.id },
        individualHooks: true,
      });
    total_loaded++;
    updateLoader(total_loaded, data.length);
  }
  console.log(`\nTotal data loaded: ${total_loaded} rows`);

  total_loaded = await Institute.count();
  console.log(`Total rows in Institutes : ${total_loaded}`);
};

const connectData = async () => {
  let data = await Institute.findAll({
    where: { universityName: { [Op.not]: null } },
  });
  data = data.map((d) => d.get({ plain: true }));

  let total_loaded = 0;
  for (const d of data) {
    const inst = await Institute.findOne({ where: { name: d.universityName } });
    if (inst !== null)
      await Institute.update(
        { universityId: inst.id },
        { where: { id: d.id } }
      );
    total_loaded++;
    updateLoader(total_loaded, data.length);
  }

  data = await Institute.count({ where: { universityId: { [Op.not]: null } } });
  console.log(`\nData with university Ids : ${data}`);
};

await connectToPg();
await initLink();
console.log("Connected to Postgresql Database");

await Institute.sync({ force: true });
await loadData();
await connectData();

console.log("\n");
await closePg();
