import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

const BRANDING_PATH = path.resolve("client/config/branding.ts");
const UPLOADS_DIR = path.resolve("public/uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export const getBranding: RequestHandler = (_req, res) => {
  try {
    const src = fs.readFileSync(BRANDING_PATH, "utf-8");

    // Parse MANUFACTURER block
    const mName = extract(src, "name", "MANUFACTURER");
    const mTagline = extract(src, "tagline", "MANUFACTURER");
    const mLogoColors = extractNested(src, "logo", "colors", "MANUFACTURER");
    const mLogoWhite = extractNested(src, "logo", "white", "MANUFACTURER");
    const mRequiresFilter = extractNestedBool(src, "logo", "requiresFilter", "MANUFACTURER");
    const mPhone = extractNested(src, "support", "phone", "MANUFACTURER");
    const mLabel = extractNested(src, "support", "label", "MANUFACTURER");
    const mCopyright = extract(src, "copyright", "MANUFACTURER");

    // Parse PROGRAM block
    const pName = extract(src, "name", "PROGRAM");
    const pDrugDisplayName = extract(src, "drugDisplayName", "PROGRAM");
    const pDescription = extract(src, "description", "PROGRAM");
    const pLogoColors = extractNested(src, "logo", "colors", "PROGRAM");
    const pLogoWhite = extractNested(src, "logo", "white", "PROGRAM");
    const pRequiresFilter = extractNestedBool(src, "logo", "requiresFilter", "PROGRAM");
    const pPrimary = extractNested(src, "colors", "primary", "PROGRAM");
    const pPrimaryDark = extractNested(src, "colors", "primaryDark", "PROGRAM");
    const pPrimaryLight = extractNested(src, "colors", "primaryLight", "PROGRAM");

    const chatbotIcon = extractTopLevel(src, "CHATBOT_ICON");

    res.json({
      manufacturer: {
        name: mName,
        tagline: mTagline,
        logo: { colors: mLogoColors, white: mLogoWhite, requiresFilter: mRequiresFilter },
        support: { label: mLabel, phone: mPhone },
        copyright: mCopyright,
      },
      program: {
        name: pName,
        drugDisplayName: pDrugDisplayName,
        description: pDescription,
        logo: { colors: pLogoColors, white: pLogoWhite, requiresFilter: pRequiresFilter },
        colors: { primary: pPrimary, primaryDark: pPrimaryDark, primaryLight: pPrimaryLight },
      },
      chatbotIcon,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to read branding file" });
  }
};

export const saveBranding: RequestHandler = (req, res) => {
  try {
    const { manufacturer: m, program: p, chatbotIcon } = req.body;

    const content = `/**
 * BRANDING CONFIGURATION
 *
 * There are two distinct branding layers:
 *
 *   MANUFACTURER — displayed only in the Header and Footer
 *                  (platform name, logo, tagline, support, legal)
 *
 *   PROGRAM      — displayed throughout the workflow pages
 *                  (drug name, drug logo, description, brand colors)
 *
 * To rebrand say "rebrand [Program Name]" and the assistant will prompt
 * you for all the info below and update this file + global.css automatically.
 *
 * Logo variants:
 *   colors — transparent background, brand-colored (use on white/light bg)
 *   white  — transparent background, all white    (use on teal/dark bg)
 */

export const MANUFACTURER = {
  name: ${JSON.stringify(m.name)},
  tagline: ${JSON.stringify(m.tagline)},
  logo: {
    colors: ${JSON.stringify(m.logo.colors)},
    requiresFilter: ${m.logo.requiresFilter ? "true" : "false"},
    white: ${JSON.stringify(m.logo.white)},
  },
  support: {
    label: ${JSON.stringify(m.support.label)},
    phone: ${JSON.stringify(m.support.phone)},
  },
  legal: {
    privacyUrl: "#",
    termsUrl: "#",
    safetyUrl: "#",
    prescribingUrl: "#",
  },
  copyright: ${JSON.stringify(m.copyright)},
};

export const PROGRAM = {
  name: ${JSON.stringify(p.name)},
  drugDisplayName: ${JSON.stringify(p.drugDisplayName)},
  description: ${JSON.stringify(p.description)},
  logo: {
    // Transparent background, brand-colored — use on white/light backgrounds
    colors: ${JSON.stringify(p.logo.colors)},
    // Transparent background, all white — use on teal/dark backgrounds
    white: ${JSON.stringify(p.logo.white)},
    requiresFilter: ${p.logo.requiresFilter ? "true" : "false"},
  },
  colors: {
    // Applied to --arx-primary, --arx-primary-dark, --arx-primary-80 in global.css
    primary: ${JSON.stringify(p.colors.primary)},
    primaryDark: ${JSON.stringify(p.colors.primaryDark)},
    primaryLight: ${JSON.stringify(p.colors.primaryLight)},
  },
};

export const CHATBOT_ICON = ${JSON.stringify(chatbotIcon)};
`;

    fs.writeFileSync(BRANDING_PATH, content, "utf-8");

    // Also update global.css CSS variables
    updateCssVariables(p.colors.primary, p.colors.primaryDark, p.colors.primaryLight);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to save branding" });
  }
};

export const uploadAsset: RequestHandler = (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
};

export const listAssets: RequestHandler = (_req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR)
      .filter(f => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f))
      .map(f => ({ url: `/uploads/${f}`, filename: f }));
    res.json(files);
  } catch {
    res.json([]);
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function extract(src: string, key: string, block: string): string {
  // Find block export and extract key's string value
  const blockStart = src.indexOf(`export const ${block}`);
  if (blockStart === -1) return "";
  const slice = src.slice(blockStart);
  const re = new RegExp(`\\b${key}:\\s*"([^"]*)"`, "m");
  const m = re.exec(slice);
  return m ? m[1] : "";
}

function extractNested(src: string, parent: string, key: string, block: string): string {
  const blockStart = src.indexOf(`export const ${block}`);
  if (blockStart === -1) return "";
  // Find end of block by counting braces
  let depth = 0;
  let blockEnd = blockStart;
  let started = false;
  for (let i = blockStart; i < src.length; i++) {
    if (src[i] === "{") { depth++; started = true; }
    if (src[i] === "}") { depth--; }
    if (started && depth === 0) { blockEnd = i; break; }
  }
  const slice = src.slice(blockStart, blockEnd + 1);

  // Find parent key block
  const parentIdx = slice.indexOf(`${parent}:`);
  if (parentIdx === -1) return "";
  const parentSlice = slice.slice(parentIdx);
  const re = new RegExp(`\\b${key}:\\s*"([^"]*)"`, "m");
  const m = re.exec(parentSlice);
  return m ? m[1] : "";
}

function extractNestedBool(src: string, parent: string, key: string, block: string): boolean {
  const blockStart = src.indexOf(`export const ${block}`);
  if (blockStart === -1) return false;
  let depth = 0, blockEnd = blockStart, started = false;
  for (let i = blockStart; i < src.length; i++) {
    if (src[i] === "{") { depth++; started = true; }
    if (src[i] === "}") { depth--; }
    if (started && depth === 0) { blockEnd = i; break; }
  }
  const slice = src.slice(blockStart, blockEnd + 1);
  const parentIdx = slice.indexOf(`${parent}:`);
  if (parentIdx === -1) return false;
  const parentSlice = slice.slice(parentIdx);
  const re = new RegExp(`\\b${key}:\\s*(true|false)`, "m");
  const m = re.exec(parentSlice);
  return m ? m[1] === "true" : false;
}

function extractTopLevel(src: string, varName: string): string {
  const re = new RegExp(`export const ${varName}\\s*=\\s*"([^"]*)"`, "m");
  const m = re.exec(src);
  return m ? m[1] : "";
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function updateCssVariables(primary: string, primaryDark: string, primaryLight: string) {
  const cssPath = path.resolve("client/global.css");
  let css = fs.readFileSync(cssPath, "utf-8");

  const pHsl = hexToHsl(primary);
  const dHsl = hexToHsl(primaryDark);
  const lHsl = hexToHsl(primaryLight);

  css = css.replace(
    /(--arx-primary:\s*)[^;]+(;.*\/\*.*\*\/)?/,
    `$1${pHsl};        /* ${primary} */`
  );
  css = css.replace(
    /(--arx-primary-80:\s*)[^;]+(;.*\/\*.*\*\/)?/,
    `$1${lHsl};      /* ${primaryLight} - 80% tint */`
  );
  css = css.replace(
    /(--arx-primary-dark:\s*)[^;]+(;.*\/\*.*\*\/)?/,
    `$1${dHsl};   /* ${primaryDark} - Darker teal for accessible hover states */`
  );
  css = css.replace(
    /(--primary:\s*)[^;]+;(\s*$)/m,
    `$1${pHsl};$2`
  );

  fs.writeFileSync(cssPath, css, "utf-8");
}
