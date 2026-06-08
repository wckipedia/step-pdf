# step-pdf

**Oh no step-pdf, I'm stuck!**

Free PDF and file conversion tools. Drop a file, pick a tool, download the result. No accounts. No paywalls.

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **Browser conversions:** [pdf-lib](https://pdf-lib.js.org/), [PDF.js](https://mozilla.github.io/pdf.js/), [@pdfsmaller/pdf-encrypt](https://www.npmjs.com/package/@pdfsmaller/pdf-encrypt), [JSZip](https://stuk.github.io/jszip/)
- **Server conversions:** LibreOffice, Ghostscript, pdf2docx (Python)

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
| PDF to JPG | `.pdf` → zip of JPEGs |
| Protect PDF | `.pdf` (password) |

These work immediately after `pnpm dev` and deploy cleanly to **Vercel** or any static/Next.js host.

### Server — uploads to `/api/convert`, needs native binaries

| Tool | Input | Requires |
|------|-------|----------|
| Word to PDF | `.doc`, `.docx` | LibreOffice |
| PowerPoint to PDF | `.ppt`, `.pptx` | LibreOffice |
| Excel to PDF | `.xls`, `.xlsx` | LibreOffice |
| PDF to Word | `.pdf` | pdf2docx (LibreOffice fallback) |
| PDF to PowerPoint | `.pdf` | LibreOffice |
| Compress PDF | `.pdf` | Ghostscript |

Server uploads are stored in a **temporary directory only** and deleted when the request finishes. Nothing is saved permanently.

> **PDF → Word** uses pdf2docx (PyMuPDF) for better text fidelity, with LibreOffice as fallback. **PDF → PowerPoint** uses LibreOffice. Scanned, encrypted, or heavily designed PDFs may still fail or lose formatting.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Browser tools work out of the box. For server tools, install the native binaries first.

### Native binaries (server tools only)

**macOS:**

```bash
brew install --cask libreoffice
brew install ghostscript
pip3 install -r requirements.txt
```

**Linux (Debian/Ubuntu):**

```bash
sudo apt install libreoffice ghostscript python3-pip
pip3 install -r requirements.txt
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |

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

### Vercel (browser + 9 tools)

Connect the repo to Vercel and deploy with the default Next.js preset. All browser tools work with no extra setup.

Server tools **will not work on Vercel** — the platform cannot run LibreOffice, Ghostscript, or Python. Users will see a clear error if they try those tools.

### Self-hosted

For all browser + server tools, deploy to a Node.js host where you can install the native binaries (Railway, Render, Fly.io, a VPS, etc.):

```bash
pnpm build
pnpm start
```

Install the same `brew` / `apt` packages on the server as you would locally.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_FILE_SIZE_MB` | `50` | Max upload size per file (server tools only) |

## API

### `GET /api/health`

Returns binary availability and which server tools are operational.

### `POST /api/convert`

Used by server-side tools only. Browser tools never call this endpoint.

**Multipart form data:**

- `toolId` — e.g. `word-to-pdf`, `pdf-to-word`, `compress-pdf`
- `files` — one or more files
- `options` — optional JSON

**Response:** converted file as a download, or JSON `{ "error": "..." }` on failure.

## Project structure

```
app/
  page.tsx                  # Homepage (Server Component)
  layout.tsx                # Root layout & metadata
  globals.css               # Tailwind + brand styles
  api/convert/route.ts      # Server conversion endpoint
  api/health/route.ts       # Binary health check
components/
  ConversionFlow.tsx        # Client upload + conversion UI
  Navbar.tsx
  Hero.tsx
  FileDropzone.tsx
  ConversionSuggestions.tsx
  ToolGrid.tsx
  HowItWorks.tsx
  Ticker.tsx
  Footer.tsx
lib/
  conversionRules.ts        # Tool definitions & file-type mapping
  clientConverters.ts       # Browser PDF tools
  serverConverters.ts       # pdf2docx, LibreOffice, Ghostscript
  pdfjsClient.ts            # PDF.js worker setup
  binaries.ts               # Native binary detection
  tempFiles.ts              # Temp storage & cleanup
  fileUtils.ts              # File helpers
scripts/
  pdf_to_docx.py            # PDF → Word via pdf2docx
requirements.txt            # Python deps (pdf2docx)
types/
  conversion.ts             # Shared types
.github/workflows/ci.yml    # Lint + build on push/PR
public/
  step-pdf.png              # Brand asset
```

## License

MIT
