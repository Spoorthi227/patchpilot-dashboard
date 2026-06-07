import express from "express";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const EXCEL_PATH =
"C:/Users/Spoorthi R/OneDrive/Documents/updates_data.xlsx";

// In-memory persistence for approvals and schedules (demo only)
const statuses = {};
const schedules = {};
let currentPatch = null;
let currentPatchDone = false;

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

            // read numeric priority if present
            priority:
                row.Priority != null ? Number(row.Priority) : (row.priority != null ? Number(row.priority) : (row.PriorityLevel != null ? Number(row.PriorityLevel) : undefined)),

            affectedOs:
                "Ubuntu 24.04 LTS",

            date:
                new Date().toLocaleDateString(),

            status:
                "Pending",

            action:
                "Approval Needed"
        }));

        // apply in-memory overrides (status/schedule)
        data.forEach(item => {
            if (statuses[item.package]) {
                item.status = statuses[item.package].status;
                item.action = statuses[item.package].action || item.action;
            }
            if (schedules[item.package]) {
                item.scheduled = schedules[item.package];
                item.action = 'Update Scheduled';
            }
        });

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

app.post('/api/next-patchupdate', (req, res) => {
    const pkg = req.body?.packageName;
    if (!pkg) {
        return res.status(400).json({ error: 'packageName is required' });
    }
    currentPatch = pkg;
    currentPatchDone = false;
    res.json({ ok: true, packageName: pkg, done: 0 });
});

app.get('/api/next-patchupdate', (req, res) => {
    res.json({ ok: true, packageName: currentPatch, done: currentPatchDone ? 1 : 0 });
});

app.post('/api/next-patchupdate/complete', (req, res) => {
    const pkg = req.body?.packageName;
    if (pkg && currentPatch === pkg) {
        currentPatchDone = true;
    }
    res.json({ ok: true, packageName: currentPatch, done: currentPatchDone ? 1 : 0 });
});

// Approve a package
app.post('/api/patches/:pkg/approve', (req, res) => {
    const pkg = decodeURIComponent(req.params.pkg);
    statuses[pkg] = { status: 'Approved', action: 'Approved', by: req.body?.by || 'unknown', at: new Date().toISOString() };
    res.json({ ok: true, package: pkg, status: 'Approved' });
});

// Reject a package
app.post('/api/patches/:pkg/reject', (req, res) => {
    const pkg = decodeURIComponent(req.params.pkg);
    statuses[pkg] = { status: 'Rejected', action: 'Rejected', by: req.body?.by || 'unknown', at: new Date().toISOString() };
    res.json({ ok: true, package: pkg, status: 'Rejected' });
});

// Schedule a package update
app.post('/api/patches/:pkg/schedule', (req, res) => {
    const pkg = decodeURIComponent(req.params.pkg);
    const { startDay, durationDays } = req.body || {};
    schedules[pkg] = { startDay: Number(startDay) || 0, durationDays: Number(durationDays) || 1, at: new Date().toISOString() };
    res.json({ ok: true, package: pkg, scheduled: schedules[pkg] });
});