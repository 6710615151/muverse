import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const ROOT_DIR = join(__dirname, "..", "..");
export const PUBLIC_DIR = join(ROOT_DIR, "public");
export const PAGES_DIR = join(PUBLIC_DIR, "pages");
