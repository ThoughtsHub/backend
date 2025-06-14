# write college data to db
python ./data/scripts/convert_to_csv.py
node ./data/scripts/load_college_csv_data.js
node ./data/scripts/load_data_to_db.js
