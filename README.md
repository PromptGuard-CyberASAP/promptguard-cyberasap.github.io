# PromptGuard — landing page

A static one-page site. No build step and no framework: plain HTML, one stylesheet and one small script.

## Files

```
index.html     the page
styles.css     all styles
script.js      sticky header, mobile menu, scroll reveal
favicon.svg    brand mark
robots.txt
```

## Preview locally

Open `index.html` in a browser, or serve the folder so relative paths work:

```
python -m http.server 8080
```

Then visit http://localhost:8080.

## Deploy

It is a static folder, so it works on any static host.

- **Netlify / Vercel / Cloudflare Pages:** drag the folder in, or point the project at it. No build command, output directory is this folder.
- **GitHub Pages:** push these files to a repo and enable Pages on the branch.
- **Any web server / S3 bucket:** upload the files as they are.

## Before you go live

- **Contact email.** In `index.html`, replace the two placeholders in the contact section: the `mailto:[your email]` link and the visible `[add your address]` text.
- **Fonts.** The page loads Newsreader, Geist and JetBrains Mono from Google Fonts, so it needs internet. To self-host, download the three families, drop them in a `fonts/` folder, and swap the `<link>` in `index.html` for `@font-face` rules.
- **Domain.** Set your final URL in the `og:` meta tags in `index.html` if you want richer link previews.

## Figures

Market and adoption numbers are estimates from public sources (Microsoft and LinkedIn 2024, Cisco 2025, IBM 2025, and our own market sizing). Update them as the project moves on.
