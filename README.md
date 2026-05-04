# City Weather Now (HTML App)

A lightweight HTML/CSS/JavaScript app where a user enters a city and sees the current weather with icons.

## Features

- City search input with button and Enter-key submit
- First-visit geolocation prompt to auto-load local weather
- Current weather details (temperature, feels-like, humidity, wind)
- 3-day forecast panel with daily icons and high/low temperatures
- Weather condition icon from wttr.in response data
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

## Troubleshooting

- "City not found" means the query string is invalid or too specific.
- "Location access denied" means browser geolocation permission was declined.
- Generic network error can happen when offline or provider is unreachable.

## Notes

This app uses wttr.in directly from the browser and does not require an API key.
