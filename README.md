# Dr. Clean Exterior Services — Website

A static site (plain HTML/CSS/JS, no build tools) for Dr. Clean Exterior Services, rebuilt from the content on the current GoDaddy site (drcleanexterior.com).

## Structure

- `index.html` — Home
- `services.html` — Service details (House Soft Wash, Driveway Cleaning, Window Cleaning, Roof Washing, Limestone Soft Washing)
- `gallery.html` — Before/after photo gallery ("The Operating Room" case files)
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

Hosted on **Vercel**, connected to this GitHub repo for auto-deploys:

- `main` → production deployment (this is the live theme)
- `dark-theme` → gets its own automatic preview deployment
- `light-theme` → the original white-background theme, kept as a backup branch (not deployed)

Push to `main` and Vercel redeploys automatically. To point `drcleanexterior.com` at it: in Vercel, Project → Settings → Domains, add the domain, then in GoDaddy DNS management add an `A` record (`@` → `76.76.21.21`) and a `CNAME` record (`www` → `cname.vercel-dns.com`), replacing GoDaddy's default parking records.

## Address autocomplete (Google Places)

The address box on the estimate form (homepage and `free-estimate.html`) suggests addresses as the customer types, using Google's **Places API (New)** via the Maps JavaScript API. Suggestions are biased toward San Antonio / Stone Oak / Helotes / Boerne / Fair Oaks Ranch (a bias, not a restriction: any US address still works). Choosing one fills the address as `123 Main St, Boerne, TX 78006` and also sends hidden `address_city`, `address_state`, `address_zip` fields with the form.

It is **off until a key is added**. With no key (or if Google is unreachable or rejects the key) the box is a normal text field and the form works exactly as before. Code: `js/address-autocomplete.js`; styles: the "Address autocomplete dropdown" block at the end of `css/style.css`.

### One-time setup

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project and **link a billing account** (required for Places API (New)).
2. **APIs & Services > Library**: enable **Places API (New)** and **Maps JavaScript API**.
3. **APIs & Services > Credentials > Create credentials > API key**, then edit the key:
   - **Application restrictions: Websites (HTTP referrers)**, add `https://www.drcleanexterior.com/*` and `https://drcleanexterior.com/*` (add `http://localhost:5180/*` only while testing, then remove it).
   - **API restrictions: Restrict key**, select only *Maps JavaScript API* and *Places API (New)*.
4. **Quotas** (APIs & Services > Places API (New) > Quotas): set a daily cap on autocomplete requests. **Billing > Budgets & alerts**: add a budget alert so a surprise can't run up a bill.
5. Paste the key into `PLACES_API_KEY` at the top of `js/address-autocomplete.js`, commit, and push.

A browser key is public by design (anyone can view the page source), which is why the referrer and API restrictions in step 3 matter. Never use an unrestricted key.

### Billing and sessions

Each customer typing an address is one *session*: all keystroke lookups share one session token, and picking a suggestion ends the session with a single minimal Place Details request (address fields only). Google bills a session as one unit, and offers a monthly free allowance; check the current Places API (New) pricing page. The script only talks to Google after the customer clicks into the address field (so page views alone cost nothing) and waits for 3+ characters with a short pause between requests.

### Required attribution

The dropdown shows Google's "Powered by Google" logo (light or dark version to match the form). Don't remove it; it is required when showing Google suggestions outside a Google map.
