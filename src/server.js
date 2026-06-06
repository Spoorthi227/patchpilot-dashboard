import express from "express";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import cors from "cors";

const app = express();

app.use(cors());

const EXCEL_PATH =
"C:/Users/Spoorthi R/OneDrive/Documents/updates_data.xlsx";

function getSeverity(risk) {
    const r = (risk || "").toLowerCase();

    if (r === "high") return "High";
    if (r === "medium") return "Medium";
    return "Low";
}

app.get("/api/patches", (req, res) => {
    try {

        const workbook = XLSX.readFile(EXCEL_PATH);

        const sheetName = workbook.SheetNames.find(name => {
            const sheet = workbook.Sheets[name];
            return XLSX.utils.sheet_to_json(sheet).length > 0;
        }) || workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
            .filter(row => Object.values(row).some(value => String(value).trim() !== ''));

        const data = rows.map(row => ({

            package:
                row.packageName ||
                row.PackageNo ||
                "N/A",

            category:
                row.category && String(row.category).trim().toLowerCase() === 'unknown'
                    ? 'System'
                    : row.category || 'System',

            risk:
                row.risk || "SAFE",

            cve:
                row.cveId || "N/A",

            epss:
                row.epss || row["epss score"] || "0",

            severity:
                getSeverity(row.risk),

            description:
                row.Description ||
                "Security package update",

            affectedDependencies:
                row.affectedDependencies || row.AffectedDependencies || 'None',

            affectedOs:
                "Ubuntu 24.04 LTS",

            date:
                new Date().toLocaleDateString(),

            status:
                "Pending",

            action:
                "Approval Needed"
        }));

        res.json(data);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});