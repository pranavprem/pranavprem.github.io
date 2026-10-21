# Agent guide

This repository is the live site at <https://pranavprem.github.io/>. It is a static resume page: `index.html` embeds `Pranav Prem - Resume.pdf` in a full-window frame.

Pranav's later site is [portfolio](https://github.com/pranavprem/portfolio) (`pranavprem.com`). Do not redesign this repository into that site, and do not rewrite the resume.

## Architecture

- GitHub Pages serves the committed files. There is no build output, bundler, or template step that produces `index.html`.
- Pages is configured as a legacy site: branch `master`, folder `/`. Publishing is "push to `master`". The workflow in `.github/workflows/ci.yml` only validates; it does not deploy.
- The resume content is the PDF. The HTML only frames it. Visible copy in the HTML is the document title and the meta description. The iframe's accessible name is `Pranav Prem resume`.
- `favicon.ico` exists so browsers do not log a 404 for `/favicon.ico`. It is empty of a mark on purpose.
- Dev tooling (`package.json`, Prettier, html-validate) is not part of the published page. `node_modules/` must stay untracked.

## Commands

```bash
npm ci
npm run validate   # format check, HTML lint, local asset check
npm run format     # write Prettier formatting
npm run serve      # http://127.0.0.1:8080/
```

Preview over HTTP. Opening `index.html` from disk can block the PDF frame.

## Deploy gotchas

- Do not move the site into `docs/`, add a `<base>` href, or change the Pages source. `docs/screenshot.png` is the README image. Pages will also publish it, which is harmless, but it is not the resume.
- Do not add a generator that replaces the committed `index.html`. Pages publishes the file in git, not a `dist/` folder.
- Legacy Pages runs Jekyll. This repo has no Jekyll site, and it should stay that way: no `Gemfile`, no `_config.yml`, no `.nojekyll` unless the Pages project itself is intentionally changed. Jekyll drops paths that start with `_`, `.`, or `#`. A Liquid syntax error in Markdown can fail the Pages build, so do not put Liquid output or tag delimiters in tracked Markdown.
- The PDF filename contains spaces and is the iframe `src`. Renaming it without updating `index.html` and `scripts/check-site.js` breaks the live page. Keep the filename; do not "clean it up".
- `meta name="viewport" content="width=1024"` is the historical layout width. Leave it. Replacing it with `device-width` changes how phones scale the frame.
- Keep `meta name="mobile-web-app-capable"` and do not add `apple-mobile-web-app-capable`. Chrome logs a deprecation warning for the Apple name even when the standard meta is present.
- The frame is `100vh` with the body margin removed so the PDF fits the window. Do not read `contentWindow` or `contentDocument` of the frame. That access is what the old resize helper did; it is unnecessary and throws in browsers where the PDF viewer is a different origin, which also skipped the height assignment.
- Do not restore `css/`, `js/`, or `img/`. Those were the 2018 impress.js class presentation. The live page stopped using them in July 2018.
- Do not add a license file.
- Do not commit secrets, analytics IDs, or tokens. There are none in this tree.

## What to leave alone

- The PDF bytes, unless Pranav supplies a new resume file.
- The page's job: one full-window PDF, not an HTML resume, not a portfolio, not a slide deck.
- The document title and description wording.
