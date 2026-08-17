# Eclipse SW360 Frontend
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/10706/badge)](https://www.bestpractices.dev/projects/10706)
[![Using Weblate](https://img.shields.io/badge/Using-Weblate-green?style=flat-square&logo=weblate&color=%231fa385)](https://hosted.weblate.org/projects/sw360-frontend/)

This is the main UI interface for SW360 project.

The current implementation is now in test stage and can be used in companion with SW360 20.0.0 beta release.

Please read our code [Code of Conduct](./CODE_OF_CONDUCT.md) before to help with the well being of the community.

For new contributors, please read the [contributing guideline](./CONTRIBUTING.md)

## Docker Deployment

For instructions on running SW360 Frontend with Docker or Podman, see
[README_DOCKER.md](README_DOCKER.md).


## SW360 Frontend — Playwright UI Tests

End-to-end UI tests for the SW360 Frontend, powered by [Playwright](https://playwright.dev/).
Tests live in [`tests/e2e/`](./e2e) and are organized by application module.

---

### Prerequisites

- **Node.js** and **pnpm** installed
- A running **SW360 Frontend** (default `http://localhost:3000`) and **backend API** (default `http://localhost:8080`).
  - In headless mode, the frontend dev server starts automatically if it is not already running.
  - For **UI mode** (`--ui`), start the dev server yourself first with `pnpm dev`.

---

### Setup

```bash
# 1. Install dependencies (if not already)
pnpm install

# 2. Install the Playwright browser (Chromium)
npx playwright install chromium

```

---

### Running tests

All commands use the `test:pw*` scripts defined in [`package.json`](../package.json),
which wrap `npx playwright test`.

#### Run everything (headless)

```bash
pnpm test:pw tests/e2e/ --project=chromium
```
For more detailed instructions on running SW360 Frontend testcases, see
[README](./tests/README.md).

---

### Translation
The project Eclipse SW360 supports internationalization. Found translation
missing? A bug? Or want to add your language? Checkout our Project at Weblate
[![Translation status](https://hosted.weblate.org/widget/sw360-frontend/sw360-frontend/open-graph.png)](https://hosted.weblate.org/engage/sw360-frontend/)

