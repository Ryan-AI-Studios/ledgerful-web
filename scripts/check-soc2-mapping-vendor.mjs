import { readFileSync } from "node:fs";
import path from "node:path";

const VENDOR_MAPPINGS_PATH = path.join(process.cwd(), "src", "lib", "content", "soc2-mapping.toml");
const ENGINE_MAPPINGS_PATH = "C:\\dev\\ledgerful\\mappings\\soc2.toml";

let engineRaw;
try {
  engineRaw = readFileSync(ENGINE_MAPPINGS_PATH);
} catch {
  console.log("Vendored soc2-mapping.toml is the source of truth (engine source not available).");
  process.exit(0);
}

const vendorRaw = readFileSync(VENDOR_MAPPINGS_PATH);
if (Buffer.compare(engineRaw, vendorRaw) !== 0) {
  console.error(
    `Vendored soc2-mapping.toml differs from engine source ${ENGINE_MAPPINGS_PATH} — re-vendor it.`,
  );
  process.exit(1);
}

console.log("Vendored soc2-mapping.toml matches engine source.");
