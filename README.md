# City Weather Now (HTML App)

A lightweight HTML/CSS/JavaScript app where a user enters a city and sees the current weather with icons.

## Features

- City search input with button and Enter-key submit
- First-visit geolocation prompt to auto-load local weather
- Current weather details (temperature, feels-like, humidity, wind)
- 3-day forecast panel with daily icons and high/low temperatures
- Weather condition icon from wttr.in response data
- Swedish and English UI, including localized validation and common weather descriptions
- Loading, success, warning, and error states
- Last searched city saved in localStorage
- Responsive layout for mobile and desktop

## Setup

1. Start a local static server in this folder (recommended):

```bash
python3 -m http.server 8080
```

2. Open:
   - http://localhost:8080

## Files

- `index.html` - app markup and weather card structure
- `style.css` - responsive styling and visual design
- `app.js` - API calls, state handling, and rendering logic
- `favicon.svg` - app favicon used by browsers and static hosts

## Publish

### GitHub Pages

This repo includes a GitHub Actions workflow in `.github/workflows/deploy-pages.yml`.

1. Push the repository to GitHub.
2. Open the repository on GitHub.
3. Go to **Settings > Pages**.
4. Set **Source** to **GitHub Actions**.
5. Push to `main` to publish the site.

The app is fully static, so there is no build step.

### Any Static Host

You can also publish it on Netlify, Cloudflare Pages, Vercel static hosting, or any basic web server by uploading these files directly:

- `index.html`
- `style.css`
- `app.js`
- `favicon.svg`

## Troubleshooting

- "City not found" means the query string is invalid or too specific.
- "Location access denied" means browser geolocation permission was declined.
- Generic network error can happen when offline or provider is unreachable.

## Notes

This app uses wttr.in directly from the browser and does not require an API key.
