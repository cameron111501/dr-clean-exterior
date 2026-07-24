# Dr. Clean Exterior Services — Website

A static site (plain HTML/CSS/JS, no build tools) for Dr. Clean Exterior Services, rebuilt from the content on the current GoDaddy site (drcleanexterior.com).

## Structure

- `index.html` — Home
- `services.html` — Service details (House Soft Wash, Driveway Cleaning, Window Washing, Roof Washing, Limestone Soft Washing)
- `gallery.html` — Before/after photo gallery (placeholders)
- `about.html` — About the company
- `free-estimate.html` — Quote request form
- `css/style.css` — All styling
- `js/script.js` — Mobile nav toggle + form handling
- `images/` — Put real photos here

## To-do before launch

1. **Connect the quote form.** The form in `free-estimate.html` currently points to a placeholder Formspree URL (`https://formspree.io/f/your-form-id`). To make it actually send you emails:
   - Create a free account at [formspree.io](https://formspree.io), create a form, and copy your endpoint.
   - Replace the `action` attribute on the `<form id="quote-form">` element in `free-estimate.html` with your real endpoint.
   - Formspree handles spam protection; no reCAPTCHA setup needed unless you want extra filtering.
   - Alternative: any static-form backend works the same way (Netlify Forms if you host on Netlify, Basin, Getform, etc.).
2. **Write real About Us copy** — replace the bracketed placeholder text in `about.html` with your actual story.
3. **Double-check the domain in SEO tags if you host somewhere other than `drcleanexterior.com`.** Every page's `<link rel="canonical">`, `og:url`, and the JSON-LD `url`/`@id` fields are hardcoded to `https://drcleanexterior.com/...`. Also update `sitemap.xml` and `robots.txt` (which points at `https://drcleanexterior.com/sitemap.xml`) if the domain changes.

## SEO

Each page has been optimized for local search around Boerne, Fair Oaks Ranch, and Stone Oak, TX:

- Unique, location-forward `<title>` and meta description per page
- Open Graph + Twitter Card tags (using `images/logo-full.png` as the share image)
- `HomeAndConstructionBusiness` JSON-LD on every page with `areaServed` (Boerne, Fair Oaks Ranch, Stone Oak, San Antonio, Helotes) and a service catalog
- `BreadcrumbList` JSON-LD on the four interior pages, matching the visible breadcrumb UI
- `robots.txt` and `sitemap.xml` at the project root
- Fair Oaks Ranch and Stone Oak woven into visible page copy (not just meta tags), not only the existing service-area lists

After launch, submit `sitemap.xml` in Google Search Console and set up (or claim) a Google Business Profile — that matters more for local ranking than on-page tags alone.

## Local preview

No build step needed — just open `index.html` in a browser, or serve the folder locally:

```bash
npx serve .
```

## Deploying

Any static host works. Easiest options:

- **Netlify** — drag-and-drop the folder at app.netlify.com/drop, or connect a git repo for auto-deploys. Also gives you free form handling if you swap `action="https://formspree.io/..."` for Netlify's built-in form attributes.
- **GitHub Pages** — push this folder to a repo and enable Pages in repo settings.
- **Your current GoDaddy account** — GoDaddy also offers plain hosting/FTP if you want to keep the domain and hosting in one place.

Once you pick a host, point the `drcleanexterior.com` domain's DNS at it and this can fully replace the current GoDaddy Website Builder site.
