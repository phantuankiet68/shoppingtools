const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const basePath = path.join(ROOT, "prisma", "base.prisma");
const modelsDir = path.join(ROOT, "prisma", "models");
const outPath = path.join(ROOT, "prisma", "schema.merged.prisma");

if (!fs.existsSync(basePath)) {
  throw new Error(`Missing ${basePath}. Create prisma/base.prisma first.`);
}
if (!fs.existsSync(modelsDir)) {
  throw new Error(`Missing ${modelsDir}. Create prisma/models and add *.prisma models.`);
}

const parts = [];
parts.push("// ==== base ====\n" + fs.readFileSync(basePath, "utf8"));

const modelFiles = fs
  .readdirSync(modelsDir)
  .filter((n) => n.endsWith(".prisma"))
  .sort();

for (const f of modelFiles) {
  const p = path.join(modelsDir, f);
  parts.push(`\n// ==== part: ${f} ====\n` + fs.readFileSync(p, "utf8"));
}

fs.writeFileSync(outPath, parts.join("\n"), "utf8");
console.log("✅ Merged -> prisma/schema.merged.prisma");
