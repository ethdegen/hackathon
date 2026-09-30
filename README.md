## Hackathon template

This template is intended for experimenting with agentic AI applications.
It permits starting simple yet with ample room to grow to production grade.

### FastAPI structure

The FastAPI server is in `/fastapi`. Its goal is to implement and expose the
primary backend of the application including LangChains via LangServe and/or
LlamaIndex and/or HuggingFaces. If beneficial, this FastAPI server can also
host secondary frontends such as Streamlit implementations for data analysis.

The Prisma Project is owned by the FastAPI server. Prisma Migrations must be
deployed along with the FastAPI server and the Prisma Schema resides within it.
However, for expediency, the Next App is _also_ able to read and write the
database via Prisma Models generated in TypeScript within the Next App.

The FastAPI server has this folder structure:

```txt {6-10,14-15}
fastapi
├── prisma (Prisma ORM Project)
│   ├── migrations (Prisma DB Migrations)
│   │   └── ...
│   └── schema.prisma (Prisma DB Schema)
├── src (Backend-focused Sources)
│   ├── app.py
│   └── ...
├── tests (Unit & Integration Tests)
│   ├── test_app.py
│   └── ...
└── pyproject.toml
```

### Next App structure

The Next.js App is in `/nextapp`. Its goal is to implement and expose the
primary frontend of the application as well as any backends-for-frontend
and/or secondary backends, such as NextAuth, where implementing them as part
of the Next App streamlines and accelerates development versus alternatives.

To help kickstart application development, the ShadCN UI CLI has been pre-configured.

For expediency, the Next App is able to read and write the database via generated
Prisma Models although it does _not_ own the Prisma Project. This provision permits
permit packages such as NextAuth to be adopted in an expedient fashion, by sharing
the pre-existing Prisma Project and database setup owned by the FastAPI server.

The Next App has this folder structure:

```txt {6-10,14-15}
nextapp
├── app (App Router)
│   ├── api (WebAPI Route Handlers)
│   │   └── ...
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── e2e (Playwright UX Tests)
│   └── ...
├── public (Public-facing Assets)
│   ├── favicon.ico (Favicon Branding)
│   └── ...
├── src (Backend-focused Sources)
│   ├── server (Server-side Sources)
│   |   ├── webapi (WebAPI-related Sources)
│   │   └── ...
│   └── ...
├── styles (CSS-Related Stuff)
│   ├── globals.css (CSS Globals)
│   └── ...
├── next.config.mjs
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Prisma

The Schema declares two generators, so each side of the stack gets its own client
from the single Schema owned by the FastAPI server:

| Generator   | Client                | Output                                |
| ----------- | --------------------- | ------------------------------------- |
| `client_py` | Prisma Client Python  | the installed `prisma` package        |
| `client_js` | Prisma Client (JS/TS) | `nextapp/node_modules/.prisma/client` |

```sh
cd fastapi && prisma migrate dev                    # author & apply a migration
cd fastapi && prisma migrate deploy                 # apply pending migrations
cd fastapi && prisma generate --generator client_py # Python client only
cd nextapp && npx prisma generate --schema ../fastapi/prisma/schema.prisma --generator client_js
```

Generating a single client at a time keeps each toolchain self-contained: the
Python container needs no NodeJS and the NodeJS container needs no Python.
Generating the JS client points Prisma at a Schema outside the Next App, so
Prisma auto-installs itself once at the repository root; those `node_modules`,
`package.json` and `package-lock.json` are gitignored.

`DATABASE_URL` is provided by the dev container. The database ships with pgvector,
which the Schema enables through `extensions = [vector]`.

### Playwright

Chromium, Firefox and WebKit are baked into the dev container image at
`/ms-playwright` (`$PLAYWRIGHT_BROWSERS_PATH`) together with their OS libraries,
so the NodeJS and Python bindings share one set of browser builds and no
download is needed on first run.

Versions must stay aligned across three files, otherwise Playwright reports
`Executable doesn't exist at /ms-playwright/...`:

| File                       | Pin                         |
| -------------------------- | --------------------------- |
| `.devcontainer/Dockerfile` | `PLAYWRIGHT_*_VERSION` args |
| `nextapp/package.json`     | `@playwright/test`          |
| `fastapi/pyproject.toml`   | `playwright`                |

After bumping a version, either rebuild the container or run
`npm run test:e2e:install` (Next App) and `python -m playwright install`
(FastAPI) to fetch the matching browsers.

`playwright.config.ts` starts `next dev` automatically (a production build in
CI), runs specs from `e2e/` against Chromium, Firefox, WebKit and a mobile
Chrome profile, and keeps traces, screenshots and video for failures.

```sh
npm run test:e2e                # headless run of every project
npm run test:e2e -- --project=chromium e2e/home.spec.ts
npm run test:e2e:ui             # UI mode, served on 0.0.0.0 for the host browser
npm run test:e2e:codegen        # record a new spec
npm run test:e2e:report         # open the last HTML report
```

Set `PLAYWRIGHT_BASE_URL` to test another target and
`PLAYWRIGHT_EXTERNAL_TARGET=1` to skip the managed dev server.

### Continuous Integration

`.github/workflows/ci.yaml` runs three jobs in parallel on every push and pull
request:

| Job           | Runs                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| `fastapi`     | Poetry install, Prisma validate/generate/migrate deploy, Pytest         |
| `nextapp`     | NPM install, Prisma generate, `tsc --noEmit`, ESLint, `next build`      |
| `nextapp_e2e` | NPM install, Prisma generate/migrate deploy, Playwright across browsers |

Both database-backed jobs use a `pgvector/pgvector:pg18-trixie` service so
Prisma Migrations, including `CREATE EXTENSION vector`, apply as they do locally.
The Playwright HTML report is uploaded as a build artifact.
