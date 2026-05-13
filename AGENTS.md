# Fusion Starter

A production-ready full-stack React application template with integrated Express server, featuring React Router 6 SPA mode, TypeScript, Vitest, Zod and modern tooling.

While the starter comes with a express server, only create endpoint when strictly neccesary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **PNPM**: Prefer pnpm
- **Frontend**: React 18 + React Router 6 (spa) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## Key Features

## SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.tsx` represents the home page.
- Routes are defined in `client/App.tsx` using the `react-router-dom` import
- Route files are located in the `client/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css` 
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Express Server Integration

- **Development**: Single port (8080) for both frontend/backend
- **Hot reload**: Both client and server code
- **API endpoints**: Prefixed with `/api/`

#### Example API Routes
- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint  

### Shared Types
Import consistent types in both client and server:
```typescript
import { DemoResponse } from '@shared/api';
```

Path aliases:
- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
pnpm dev        # Start dev server (client + server)
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # TypeScript validation
pnpm test          # Run Vitest tests
```

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route
1. **Optional**: Create a shared interface in `shared/api.ts`:
```typescript
export interface MyRouteResponse {
  message: string;
  // Add other response properties here
}
```

2. Create a new route handler in `server/routes/my-route.ts`:
```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: 'Hello from my endpoint!'
  };
  res.json(response);
};
```

3. Register the route in `server/index.ts`:
```typescript
import { handleMyRoute } from "./routes/my-route";

// Add to the createServer function:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Use in React components with type safety:
```typescript
import { MyRouteResponse } from '@shared/api'; // Optional: for type safety

const response = await fetch('/api/my-endpoint');
const data: MyRouteResponse = await response.json();
```

### New Page Route
1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- Single-port development with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces

---

## Branding Architecture

There are **two distinct branding layers**:

1. **Manufacturer** — Header + Footer only (platform name, logo, tagline, support info, legal)
2. **Program** — Workflow pages (drug name, drug logo, description, brand colors)

All branding values live in **`client/config/branding.ts`** (`MANUFACTURER` and `PROGRAM` exports).
Logo components live in **`client/components/brand/`**:
- `ManufacturerLogo` — renders the manufacturer logo (Header/Footer)
- `ProgramLogo` — renders the program/drug logo (workflow pages)

Each logo has two variants:
- `colors` — brand-colored, transparent background → use on white/light backgrounds
- `white` — all-white, transparent background → use on teal/dark backgrounds

Brand colors (`--arx-primary`, `--arx-primary-dark`, `--arx-primary-80`) are defined in `client/global.css`.

---

## Skill: rebrand

**Trigger:** any message starting with `rebrand` (e.g. `rebrand Lilly Direct`, `rebrand`)

**Action:** Ask the user for the two groups of information below, then update `client/config/branding.ts` and `client/global.css`. All components update automatically — no other files need changing.

### Information to collect

**Manufacturer (Header + Footer)**
1. Platform / manufacturer name (e.g. "CoAssist")
2. Logo — colors version URL (transparent background, brand-colored; for white backgrounds)
3. Logo — white version URL (transparent background, all-white; for dark/teal backgrounds)
4. Tagline (e.g. "Patient assistance & medication access program")
5. Support phone number
6. Copyright line (e.g. "©2026 AssistRx. All Rights Reserved. Intended for US residents only.")

**Program (Workflow Pages)**
1. Program / drug name (used in headings + UI copy)
2. Logo — colors version URL (transparent background, brand-colored)
3. Logo — white version URL (transparent background, all-white)
4. Short drug description (e.g. "0.8 mg · 30-day supply")
5. Primary brand color — either paste a color swatch PNG (the assistant will read the hex values from it) or type a hex value directly (e.g. `#007178`)

### What gets updated

| File | Change |
|---|---|
| `client/config/branding.ts` | All logo URLs, names, tagline, support, copyright, description |
| `client/global.css` | `--arx-primary`, `--arx-primary-dark`, `--arx-primary-80` CSS variables |

> Note: `--arx-primary-dark` is derived at ~15% darker than primary; `--arx-primary-80` is ~50% lighter.
