const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const csvPath = path.join(root, "world_cup_player_tables_collected.csv");
const manifestPath = path.join(root, "assets/flags/manifest.json");
const dataDir = path.join(root, "data");
const teamsDir = path.join(dataDir, "teams");

const teamDetails = {
  Mexico: { code: "MEX", colors: ["#006847", "#ce1126"] },
  "South Africa": { code: "RSA", colors: ["#007a4d", "#de3831"] },
  "South Korea": { code: "KOR", colors: ["#ffffff", "#c60c30"] },
  "Czech Republic": { code: "CZE", colors: ["#11457e", "#d7141a"] },
  Canada: { code: "CAN", colors: ["#ff0000", "#ffffff"] },
  "Bosnia and Herzegovina": { code: "BIH", colors: ["#002395", "#fecb00"] },
  Qatar: { code: "QAT", colors: ["#8a1538", "#ffffff"] },
  Switzerland: { code: "SUI", colors: ["#ff0000", "#ffffff"] },
  Brazil: { code: "BRA", colors: ["#009b3a", "#002776"] },
  Morocco: { code: "MAR", colors: ["#c1272d", "#006233"] },
  Haiti: { code: "HAI", colors: ["#00209f", "#d21034"] },
  Scotland: { code: "SCO", colors: ["#005eb8", "#ffffff"] },
  "United States": { code: "USA", colors: ["#3c3b6e", "#b22234"] },
  Paraguay: { code: "PAR", colors: ["#0038a8", "#d52b1e"] },
  Australia: { code: "AUS", colors: ["#012169", "#e4002b"] },
  Türkiye: { code: "TUR", colors: ["#e30a17", "#ffffff"] },
  Germany: { code: "GER", colors: ["#000000", "#dd0000"] },
  Curaçao: { code: "CUW", colors: ["#002b7f", "#f9e814"] },
  "Ivory Coast": { code: "CIV", colors: ["#ff8200", "#009a44"] },
  Ecuador: { code: "ECU", colors: ["#ffdd00", "#034ea2"] },
  Netherlands: { code: "NED", colors: ["#ae1c28", "#21468b"] },
  Japan: { code: "JPN", colors: ["#ffffff", "#bc002d"] },
  Sweden: { code: "SWE", colors: ["#006aa7", "#fecc00"] },
  Tunisia: { code: "TUN", colors: ["#e70013", "#ffffff"] },
  Belgium: { code: "BEL", colors: ["#000000", "#fae042"] },
  Egypt: { code: "EGY", colors: ["#ce1126", "#000000"] },
  Iran: { code: "IRN", colors: ["#239f40", "#da0000"] },
  "New Zealand": { code: "NZL", colors: ["#00247d", "#cc142b"] },
  Spain: { code: "ESP", colors: ["#aa151b", "#f1bf00"] },
  "Cape Verde": { code: "CPV", colors: ["#003893", "#cf2027"] },
  "Saudi Arabia": { code: "KSA", colors: ["#006c35", "#ffffff"] },
  Uruguay: { code: "URU", colors: ["#0ea5e9", "#ffffff"] },
  France: { code: "FRA", colors: ["#002654", "#ed2939"] },
  Senegal: { code: "SEN", colors: ["#00853f", "#e31b23"] },
  Iraq: { code: "IRQ", colors: ["#ce1126", "#000000"] },
  Norway: { code: "NOR", colors: ["#ba0c2f", "#00205b"] },
  Argentina: { code: "ARG", colors: ["#74acdf", "#ffffff"] },
  Algeria: { code: "ALG", colors: ["#006233", "#d21034"] },
  Austria: { code: "AUT", colors: ["#ed2939", "#ffffff"] },
  Jordan: { code: "JOR", colors: ["#007a3d", "#ce1126"] },
  Portugal: { code: "POR", colors: ["#006600", "#ff0000"] },
  "DR Congo": { code: "COD", colors: ["#007fff", "#ce1021"] },
  Uzbekistan: { code: "UZB", colors: ["#1eb53a", "#0099b5"] },
  Colombia: { code: "COL", colors: ["#fcd116", "#003893"] },
  England: { code: "ENG", colors: ["#ffffff", "#cf142b"] },
  Croatia: { code: "CRO", colors: ["#ff0000", "#171796"] },
  Ghana: { code: "GHA", colors: ["#ce1126", "#006b3f"] },
  Panama: { code: "PAN", colors: ["#005293", "#d21034"] }
};

const rowFields = [
  "team",
  "player",
  "club",
  "club_country",
  "club_with_country",
  "position",
  "age",
  "fc26_ovr",
  "notes",
  "headshot_url",
  "_id",
  "_ovr",
  "_position_group"
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);

  const headers = rows.shift().map((header) => header.trim().replace(/^\uFEFF/, ""));
  return rows.map((cells, index) => {
    const obj = {};
    headers.forEach((header, cellIndex) => {
      obj[header] = (cells[cellIndex] || "").trim();
    });
    obj._id = `${obj.team || "team"}-${obj.player || "player"}-${index}`;
    obj._ovr = parseRating(obj.fc26_ovr);
    obj._position_group = positionGroup(obj.position);
    return obj;
  });
}

function parseRating(value) {
  const parsed = Number.parseInt(String(value || "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function positionGroup(position) {
  const p = String(position || "").toUpperCase();
  if (p.includes("GK")) return "GK";
  if (p.includes("CB") || p.includes("LB") || p.includes("RB") || p.includes("RWB") || p.includes("DEF") || p.includes("FULLBACK")) return "DEF";
  if (p.includes("CM") || p.includes("CDM") || p.includes("DM") || p.includes("AM") || p.includes("CAM") || p.includes("MID")) return "MID";
  if (p.includes("LW") || p.includes("RW") || p.includes("ST") || p.includes("CF") || p.includes("WINGER") || p.includes("FORWARD") || p.includes("STRIKER")) return "ATT";
  return "OTHER";
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ratedRows(rows) {
  return rows.filter((row) => row._ovr !== null);
}

function averageRating(rows) {
  const rated = ratedRows(rows);
  if (!rated.length) return null;
  return rated.reduce((sum, row) => sum + row._ovr, 0) / rated.length;
}

function medianRating(rows) {
  const ratings = ratedRows(rows).map((row) => row._ovr).sort((a, b) => a - b);
  if (!ratings.length) return null;
  const middle = Math.floor(ratings.length / 2);
  return ratings.length % 2 ? ratings[middle] : (ratings[middle - 1] + ratings[middle]) / 2;
}

function topElevenRating(rows) {
  const ratings = ratedRows(rows)
    .map((row) => row._ovr)
    .sort((a, b) => b - a)
    .slice(0, 11);
  if (!ratings.length) return { score: null, ratedCount: 0, complete: false };
  return {
    score: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
    ratedCount: ratings.length,
    complete: ratings.length >= 11
  };
}

function topRated(rows) {
  const rated = ratedRows(rows);
  if (!rated.length) return null;
  return [...rated].sort((a, b) => b._ovr - a._ovr || a.player.localeCompare(b.player))[0];
}

function countsBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "Unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function compactRows(rows) {
  return rows.map((row) => rowFields.map((field) => row[field] ?? ""));
}

function compareTeamSummaries(a, b) {
  if (a.strengthComplete !== b.strengthComplete) return a.strengthComplete ? -1 : 1;
  if (a.strengthScore !== b.strengthScore) return (b.strengthScore || -1) - (a.strengthScore || -1);
  return a.name.localeCompare(b.name);
}

function teamSummary(team, rows, manifestEntry) {
  const rated = ratedRows(rows);
  const top = topRated(rows);
  const strength = topElevenRating(rows);
  const details = teamDetails[team] || { code: team.slice(0, 3).toUpperCase(), colors: ["#101828", "#667085"] };

  return {
    name: team,
    slug: slugify(team),
    group: manifestEntry?.group || "",
    code: details.code,
    flagUrl: manifestEntry?.file || "",
    colors: details.colors,
    count: rows.length,
    ratedCount: rated.length,
    average: averageRating(rows),
    median: medianRating(rows),
    strengthScore: strength.score,
    strengthRatedCount: strength.ratedCount,
    strengthComplete: strength.complete,
    top: top ? {
      player: top.player,
      age: top.age,
      fc26_ovr: top.fc26_ovr,
      _ovr: top._ovr
    } : null,
    stars85: rated.filter((row) => row._ovr >= 85).length,
    elite90: rated.filter((row) => row._ovr >= 90).length,
    positionCounts: countsBy(rows, "_position_group"),
    clubCountryCounts: countsBy(rows, "club_country")
  };
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`);
}

function main() {
  fs.mkdirSync(teamsDir, { recursive: true });

  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const manifestByTeam = new Map(manifest.map((entry) => [entry.team, entry]));
  const rowsByTeam = new Map();

  rows.forEach((row) => {
    if (!rowsByTeam.has(row.team)) rowsByTeam.set(row.team, []);
    rowsByTeam.get(row.team).push(row);
  });

  const summaries = manifest
    .map((entry) => {
      const teamRows = rowsByTeam.get(entry.team) || [];
      return teamRows.length ? teamSummary(entry.team, teamRows, manifestByTeam.get(entry.team)) : null;
    })
    .filter(Boolean)
    .sort(compareTeamSummaries);

  summaries.forEach((summary) => {
    const teamRows = rowsByTeam.get(summary.name) || [];
    writeJson(path.join(teamsDir, `${summary.slug}.json`), {
      fields: rowFields,
      rows: compactRows(teamRows)
    });
  });

  writeJson(path.join(dataDir, "teams-summary.json"), summaries);
  writeJson(path.join(dataDir, "players-lite.json"), {
    fields: rowFields,
    rows: compactRows(rows)
  });
}

main();
