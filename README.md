# step-pdf

**Oh no step-pdf, I'm stuck!**

Free PDF and file conversion tools. Drop a file, pick a tool, download the result. No accounts. No paywalls.

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **Browser conversions:** [pdf-lib](https://pdf-lib.js.org/), [JSZip](https://stuk.github.io/jszip/)
- **Server conversions:** LibreOffice, Ghostscript, Poppler, qpdf (optional, for advanced tools)

## Tools

### Browser — runs on your device, no upload

| Tool | Input |
|------|-------|
| Image to PDF | `.jpg`, `.jpeg`, `.png`, `.webp` |
| JPG to PDF | `.jpg`, `.jpeg` |
| PNG to PDF | `.png` |
| TXT to PDF | `.txt` |
| Merge PDF | multiple `.pdf` |
| Split PDF | `.pdf` → zip of pages |
| Rotate PDF | `.pdf` |

These work immediately after `npm run dev` and deploy cleanly to **Vercel** or any static/Next.js host.

### Server — uploads to `/api/convert`, needs native binaries

| Tool | Input | Requires |
|------|-------|----------|
| Word to PDF | `.doc`, `.docx` | LibreOffice |
| PowerPoint to PDF | `.ppt`, `.pptx` | LibreOffice |
| Excel to PDF | `.xls`, `.xlsx` | LibreOffice |
| PDF to Word | `.pdf` | LibreOffice |
| PDF to PowerPoint | `.pdf` | LibreOffice |
| Compress PDF | `.pdf` | Ghostscript |
| PDF to JPG | `.pdf` | Poppler |
| Protect PDF | `.pdf` | qpdf |

Server uploads are stored in a **temporary directory only** and deleted when the request finishes. Nothing is saved permanently.

> **PDF → Word / PowerPoint** uses LibreOffice and works best on simple text-based PDFs. Scanned, encrypted, or heavily designed PDFs may fail or lose formatting.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Browser tools work out of the box. For server tools, install the native binaries first.

### Native binaries (server tools only)

**macOS:**

```bash
brew install --cask libreoffice
brew install ghostscript poppler qpdf
```

**Linux (Debian/Ubuntu):**

```bash
sudo apt install libreoffice ghostscript poppler-utils qpdf
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

## CI

GitHub Actions runs on every push and PR to `main` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

| Job | What it checks |
|-----|----------------|
| **ESLint** | Code style and Next.js lint rules |
| **TypeScript** | `tsc --noEmit` |
| **Project validation** | Tool registry consistency + Python script syntax |
| **Production build** | `next build` succeeds; uploads `.next` artifact |
| **Security audit** | `pnpm audit` fails on high-severity vulnerabilities |

[Dependabot](.github/dependabot.yml) opens weekly PRs for npm packages and GitHub Actions updates.

> CI expects `pnpm`, plus `typecheck`, `validate`, and `check` scripts in `package.json`. Those are added in other feature branches (e.g. SP-3/SP-4) before the pipeline passes on `main`.

## Deployment

### Vercel (recommended for browser tools)

Connect the repo to Vercel and deploy with the default Next.js preset. Browser tools work with no extra setup.

Server tools **will not work on Vercel** — the platform cannot run LibreOffice, Ghostscript, or similar binaries. Users will see a clear error if they try those tools.

### Self-hosted (full tool support)

For all browser + server tools, deploy to a Node.js host where you can install the native binaries (Railway, Render, Fly.io, a VPS, etc.):

```bash
npm run build
npm start
```

Install the same `brew` / `apt` packages on the server as you would locally.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_FILE_SIZE_MB` | `50` | Max upload size per file (server tools only) |

## API

### `POST /api/convert`

Used by server-side tools only. Browser tools never call this endpoint.

**Multipart form data:**

- `toolId` — e.g. `word-to-pdf`, `pdf-to-word`, `compress-pdf`
- `files` — one or more files
- `options` — optional JSON, e.g. `{"password":"secret"}` for Protect PDF

**Response:** converted file as a download, or JSON `{ "error": "..." }` on failure.

## Project structure

```
app/
  page.tsx                  # Homepage & conversion flow
  layout.tsx                # Root layout & metadata
  globals.css               # Tailwind + brand styles
  icon.png                  # Favicon
  api/convert/route.ts      # Server conversion endpoint
.github/
  workflows/ci.yml          # CI pipeline
  dependabot.yml            # Weekly dependency updates
components/
  Navbar.tsx                # Logo + section links (smooth scroll)
  Hero.tsx
  FileDropzone.tsx
  ConversionSuggestions.tsx
  ToolGrid.tsx              # Tabbed tools browser
  HowItWorks.tsx
  Ticker.tsx
  Footer.tsx                # Vision & FAQ
lib/
  conversionRules.ts        # Tool definitions & file-type mapping
  clientConverters.ts       # Browser PDF tools
  serverConverters.ts       # LibreOffice, Ghostscript, etc.
  binaries.ts               # Native binary detection
  tempFiles.ts              # Temp storage & cleanup
  fileUtils.ts              # File helpers
types/
  conversion.ts             # Shared types
public/
  step-pdf.png              # Brand asset
```

## License

MIT
