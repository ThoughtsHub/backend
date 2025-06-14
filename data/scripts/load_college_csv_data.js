import fs from "fs";

// remove an index from an array
const remove_index = (list, index = 0) => {
  list = [...list.slice(0, index), ...list.slice(index + 1)];
  return list;
};

// Convert a spaced string to camel case
const convert_to_camel = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index === 0 ? word : word[0].toUpperCase() + word.slice(1)
    )
    .join("");
};

// Load data from Csv file object
const load_csv_data = (csv, sep = ";") => {
  const base_loc = "./data/csv/college and universities/";
  const data = fs
    .readFileSync(base_loc + csv.loc)
    .toString()
    .split("\n");

  let fields = data[2].split(sep).map((f) => {
    f = f.replace("\r", "").trim().toLowerCase();
    if (f === "manegement") f = "management";
    return f;
  });

  const SNo = fields.findIndex((f) => f === "s. no.");
  if (SNo !== -1) fields = remove_index(fields, SNo);

  const data_rows = data
    .slice(3)
    .filter((r) => !["\n", "-", ""].includes(r.trim()))
    .map((row) => {
      row = row.split(sep);

      for (let i = 0; i < row.length; i++) {
        row[i] = row[i].replace("\r", "").trim();
        if (["", "-"].includes(row[i])) row[i] = null;
      }

      if (SNo !== -1) row = remove_index(row, SNo);

      return row;
    });

  return { category: csv.name, fields, data: data_rows };
};

// All csv locations and names
const csvs = {
  colleges: { name: "College", loc: "colleges.csv" },
  rd_institutes: { name: "R & D Institute", loc: "r_d_institutes.csv" },
  standalone: { name: "Standalone", loc: "standalone.csv" },
  universities: { name: "University", loc: "universities.csv" },
  vidya_lakshmi: { name: "PM Vidyalaxmi", loc: "vidya_lakshmi.csv" },
};

// Loading the csv data
const data = {
  c: load_csv_data(csvs.colleges), // College
  rd: load_csv_data(csvs.rd_institutes), // R & D Institutes
  s: load_csv_data(csvs.standalone), // Standalone
  u: load_csv_data(csvs.universities), // University
  vl: load_csv_data(csvs.vidya_lakshmi), // PM Vidyalaxmi
};

// Convert field names
{
  data.rd.fields = data.rd.fields.map((x) => {
    if (x === "institute name") x = "name";
    else if (x === "district name") x = "district";
    else if (x === "state name") x = "state";
    return x;
  });
  data.vl.fields = data.vl.fields.map((x) => {
    if (x === "institute name") x = "name";
    else if (x === "district name") x = "district";
    else if (x === "state name") x = "state";
    else if (x === "management type") x = "management";
    return x;
  });
  data.c.fields = data.c.fields.map((x) => {
    if (x === "college type") x = "type";
    return x;
  });
  data.s.fields = data.s.fields.map((x) => {
    if (x === "standalone type") x = "type";
    return x;
  });
}

// Get all the field names
const fields = [];
for (const key in data)
  data[key].fields.forEach((f) => {
    if (!fields.includes(f)) fields.push(f);
  });
const fields_cameled = fields.map((f) => convert_to_camel(f));

// Convert all the rows to objects with fields
for (const key in data) {
  let { data: rows, fields, category } = data[key];

  let rows_obj = [];
  // convert list to an object
  for (const row of rows) {
    let row_obj = {};
    for (let i = 0; i < row.length; i++) row_obj[fields[i]] = row[i];
    row_obj.category = category;
    rows_obj.push(row_obj);
  }

  data[key].data_obj = rows_obj;
}

// Create a centralized data
const loaded_data = [];
for (const key in data)
  data[key].data_obj.forEach((obj) => {
    let obj_n = {};
    for (let i = 0; i < fields.length; i++)
      obj_n[fields_cameled[i]] = obj[fields[i]] ?? null;
    loaded_data.push(obj_n);
  });

// Convert data to json file
let file_path = "./data/loaded_data/college_and_universities.json";
let stringified_loaded_data = JSON.stringify(loaded_data);
fs.writeFileSync(file_path, stringified_loaded_data);
console.log(`Data written to ${file_path}`);

// Convert fields to json file
file_path = "./data/loaded_data/cu_fields.json";
stringified_loaded_data = JSON.stringify(fields_cameled);
fs.writeFileSync(file_path, stringified_loaded_data);
console.log(`Data (fields) written to ${file_path}`);

// Checking
console.log(loaded_data[70000]);
console.log(fields_cameled);
