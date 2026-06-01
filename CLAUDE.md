# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML author portfolio for brianplescher.com, deployed directly to Netlify with no build step. The site showcases three books (*The Directed Author*, *Woundwise*, *Slickens*) and published essays.

## Local Development

There is no build system, package manager, or bundler. To preview locally, serve the root directory with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Netlify Forms (`data-netlify="true"`) only work on the deployed site — form submissions will 404 locally. The Netlify CLI can simulate this:

```bash
netlify dev
```

## Architecture

**No templating.** Every page is a standalone `.html` file. The nav and footer HTML are copy-pasted across all pages. When adding or changing nav items, update every page individually.

**Single stylesheet.** All styles live in `style.css`, organized with section comments. The design system is defined entirely via CSS custom properties in `:root` — use these variables rather than hardcoding values:
- Colors: `--bg`, `--surface`, `--cyan`, `--headline`, `--body`, `--muted`, `--border`
- Typography: IM Fell English (headings), Libre Baskerville (body), Montserrat (UI/labels/buttons)

**Inline scripts.** Each page handles its own JS at the bottom (hamburger nav, IntersectionObserver fade-ins, form validation). The same hamburger/nav pattern is duplicated on every page.

**Netlify Forms.** Contact, newsletter, and Slickens notify forms use `data-netlify="true"` with a hidden `form-name` input. Submissions redirect to `thankyou.html`. No backend code needed.

**Netlify Functions.** `Netlify/functions/` contains serverless functions (including `anthropic.js`) that back `editor.html` — an admin editing interface for site content.

**Concept graph.** `graph.html` renders an interactive visualization of thematic concepts from Woundwise. Node/link data is defined in `js/graph-data.js`.

## Deployments & Redirects

Deployment is automatic via Netlify on push. The publish directory is `.` (repo root).

Clean URL redirects (e.g. `/woundwise` → `/woundwise.html`) are defined in `netlify.toml`. When adding a new page, add a corresponding redirect entry.

When adding new pages, also update:
- `sitemap.xml` (add `<url>` entry with `<lastmod>`)
- `netlify.toml` (add clean-URL redirect)
- Nav and footer on all existing pages

## SEO Conventions

Each page includes: canonical URL, meta description, Open Graph tags, Twitter Card tags, and a `<script type="application/ld+json">` block with appropriate Schema.org type (`Person`, `Book`, `BlogPosting`, etc.). Follow the existing pattern when adding pages or essays.
