import pandas as pd


base_xlsx_path = "./data/xlsx/college and universities/"
base_csv_path = "./data/csv/college and universities/"


def convert(xlsx_path, csv_name):
    inputExcelFile = base_xlsx_path + xlsx_path
    outputCsvFile = base_csv_path + csv_name
    excelFile = pd.read_excel(inputExcelFile)
    excelFile.to_csv(outputCsvFile, sep=";", index=None, header=True)
    print(f"Converted {inputExcelFile} to {outputCsvFile}")


convert("College-ALL COLLEGE.xlsx", "colleges.csv")
convert("R & D Institutes.xlsx", "r_d_institutes.csv")
convert("Standalone-ALL STANDALONE.xlsx", "standalone.csv")
convert("University-ALL UNIVERSITIES.xlsx", "universities.csv")
convert("vidya_lakshmiAll.xlsx", "vidya_lakshmi.csv")
