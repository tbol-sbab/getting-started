const API_URL = "https://wttr.in";
const LAST_CITY_KEY = "weather.lastCity";
const GEO_PROMPTED_KEY = "weather.geoPrompted";
const LANG_KEY = "weather.lang";

const TRANSLATIONS = {
  sv: {
    title: "Väder Nu",
    kicker: "Liveläge",
    appTitle: "Väder Nu",
    subtitle: "Ange en stad för att se aktuellt väder och ikon.",
    cityLabel: "Stad",
    cityPlaceholder: "t.ex. Stockholm",
    searchBtn: "Hämta väder",
    searchBtnLoading: "Laddar...",
    statusInit: "Ange en stad för att börja.",
    statusLastCity: "Tryck på Hämta väder för att uppdatera {city}.",
    statusLooking: "Söker väder för {city}...",
    statusLocation: "Hämtar väder för din plats...",
    statusAllowLocation: "Tillåt platsdelning för att automatiskt hämta väder.",
    statusUpdated: "Väder uppdaterat för {city}.",
    statusUpdatedLocation: "Väder uppdaterat för {city} via din plats.",
    statusNotFound: "Staden hittades inte. Försök med en större stad eller kontrollera stavningen.",
    statusLocationDenied: "Platsdelning nekades. Sök efter stad istället.",
    statusLocationFail: "Kunde inte hämta din plats. Sök efter stad istället.",
    statusLocationError: "Kunde inte hämta väder för din plats. Sök efter stad istället.",
    statusNetworkError: "Kunde inte hämta väderdata. Kontrollera din anslutning och försök igen.",
    temperature: "Temperatur",
    feelsLike: "Känns som",
    humidity: "Luftfuktighet",
    wind: "Vind",
    forecastTitle: "3-dagarsprognos",
    forecastHigh: "H",
    forecastLow: "L",
    forecastDay: "Dag",
  },
  en: {
    title: "City Weather Now",
    kicker: "Live Conditions",
    appTitle: "City Weather Now",
    subtitle: "Type a city to view current weather and icon.",
    cityLabel: "City",
    cityPlaceholder: "e.g. Stockholm",
    searchBtn: "Get Weather",
    searchBtnLoading: "Loading...",
    statusInit: "Enter a city to begin.",
    statusLastCity: "Press Get Weather to refresh {city}.",
    statusLooking: "Looking up weather for {city}...",
    statusLocation: "Checking weather for your location...",
    statusAllowLocation: "Allow location access to fetch weather automatically.",
    statusUpdated: "Updated weather for {city}.",
    statusUpdatedLocation: "Updated weather for {city} from your location.",
    statusNotFound: "City not found. Try a larger city or include proper spelling.",
    statusLocationDenied: "Location access denied. Search by city instead.",
    statusLocationFail: "Could not access your location. Search by city instead.",
    statusLocationError: "Could not load weather for your location. Search by city instead.",
    statusNetworkError: "Could not load weather data. Check your connection and try again.",
    temperature: "Temperature",
    feelsLike: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    forecastTitle: "3-Day Forecast",
    forecastHigh: "H",
    forecastLow: "L",
    forecastDay: "Day",
  },
};

let currentLang = localStorage.getItem(LANG_KEY) || "sv";

function t(key, vars = {}) {
  let str = TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function applyLang() {
  document.documentElement.lang = currentLang;
  document.title = t("title");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const active = btn.dataset.lang === currentLang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const cardEl = document.getElementById("weather-card");
const iconEl = document.getElementById("weather-icon");
const cityNameEl = document.getElementById("city-name");
const descEl = document.getElementById("weather-desc");
const tempEl = document.getElementById("temp");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const forecastEl = document.getElementById("forecast");
const forecastListEl = document.getElementById("forecast-list");

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${tone}`.trim();
}

function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? t("searchBtnLoading") : t("searchBtn");
}

function hideCard() {
  cardEl.classList.add("hidden");
}

function showCard() {
  cardEl.classList.remove("hidden");
}

function getIconUrl(iconUrl) {
  if (!iconUrl) {
    return "";
  }
  return iconUrl.replace("http://", "https://");
}

function formatForecastDay(day, index) {
  const date = new Date(`${day.date}T12:00:00`);
  const dayLabel = Number.isNaN(date.getTime())
    ? `${t("forecastDay")} ${index + 1}`
    : date.toLocaleDateString(currentLang === "sv" ? "sv-SE" : "en-GB", { weekday: "short" });

  const hourly = Array.isArray(day.hourly) && day.hourly.length > 0 ? day.hourly[0] : {};
  const description = hourly.weatherDesc?.[0]?.value ?? "Unknown";

  return {
    dayLabel,
    description,
    iconUrl: getIconUrl(hourly.weatherIconUrl?.[0]?.value ?? ""),
    high: `${Math.round(Number(day.maxtempC ?? 0))} C`,
    low: `${Math.round(Number(day.mintempC ?? 0))} C`,
  };
}

function formatWeather(data) {
  const current = data.current_condition?.[0] ?? {};
  const area = data.nearest_area?.[0] ?? {};
  const areaName = area.areaName?.[0]?.value ?? "Unknown city";
  const country = area.country?.[0]?.value ?? "";
  const cityLabel = country ? `${areaName}, ${country}` : areaName;
  const windKmph = Number(current.windspeedKmph ?? 0);
  const forecast = Array.isArray(data.weather)
    ? data.weather.slice(0, 3).map((day, index) => formatForecastDay(day, index))
    : [];

  return {
    city: cityLabel,
    description: current.weatherDesc?.[0]?.value ?? "Unknown",
    iconUrl: current.weatherIconUrl?.[0]?.value ?? "",
    temp: `${Math.round(Number(current.temp_C ?? 0))} C`,
    feelsLike: `${Math.round(Number(current.FeelsLikeC ?? 0))} C`,
    humidity: `${current.humidity ?? "-"}%`,
    wind: `${Math.round(windKmph / 3.6)} m/s`,
    forecast,
  };
}

function renderForecast(forecastDays) {
  forecastListEl.textContent = "";

  if (!forecastDays.length) {
    forecastEl.classList.add("hidden");
    return;
  }

  forecastDays.forEach((day) => {
    const item = document.createElement("article");
    item.className = "forecast-item";

    const title = document.createElement("h4");
    title.textContent = day.dayLabel;

    const icon = document.createElement("img");
    icon.alt = `${day.description} icon`;
    if (day.iconUrl) {
      icon.src = day.iconUrl;
    }

    const desc = document.createElement("p");
    desc.className = "forecast-desc";
    desc.textContent = day.description;

    const temp = document.createElement("p");
    temp.className = "forecast-temp";
    temp.textContent = `${t("forecastHigh")} ${day.high} / ${t("forecastLow")} ${day.low}`;

    item.append(title, icon, desc, temp);
    forecastListEl.appendChild(item);
  });

  forecastEl.classList.remove("hidden");
}

function renderWeather(weather) {
  cityNameEl.textContent = weather.city;
  descEl.textContent = weather.description;
  tempEl.textContent = weather.temp;
  feelsLikeEl.textContent = weather.feelsLike;
  humidityEl.textContent = weather.humidity;
  windEl.textContent = weather.wind;

  const iconUrl = getIconUrl(weather.iconUrl);
  if (iconUrl) {
    iconEl.src = iconUrl;
    iconEl.alt = `${weather.description} icon`;
    iconEl.classList.remove("hidden");
  } else {
    iconEl.removeAttribute("src");
    iconEl.alt = "No icon available";
    iconEl.classList.add("hidden");
  }

  renderForecast(weather.forecast);
  showCard();
  setStatus(t("statusUpdated", { city: weather.city }), "ok");
}

async function fetchWeather(query) {
  const response = await fetch(`${API_URL}/${encodeURIComponent(query)}?format=j1`);

  if (!response.ok) {
    throw new Error("api_error");
  }

  const data = await response.json();
  const hasError = Array.isArray(data?.data?.error) && data.data.error.length > 0;
  const hasCurrent = Array.isArray(data?.current_condition) && data.current_condition.length > 0;

  if (hasError || !hasCurrent) {
    throw new Error("not_found");
  }

  return data;
}

function setCityInputFromLabel(cityLabel) {
  const cityOnly = cityLabel.split(",")[0]?.trim();
  if (cityOnly) {
    cityInput.value = cityOnly;
  }
}

function handleLookupError(error, lookupType = "city") {
  hideCard();

  if (error.message === "not_found") {
    setStatus(t("statusNotFound"), "warn");
    return;
  }

  if (lookupType === "location") {
    setStatus(t("statusLocationError"), "error");
    return;
  }

  setStatus(t("statusNetworkError"), "error");
}

async function lookupWeather(query, options = {}) {
  const { saveSearch = true, lookupType = "city", sourceStatus = "" } = options;

  setLoading(true);
  setStatus(lookupType === "location" ? t("statusLocation") : t("statusLooking", { city: query }));

  try {
    const raw = await fetchWeather(query);
    const weather = formatWeather(raw);
    renderWeather(weather);

    if (saveSearch) {
      localStorage.setItem(LAST_CITY_KEY, query);
    }

    setCityInputFromLabel(weather.city);

    if (sourceStatus) {
      setStatus(t(sourceStatus, { city: weather.city }), "ok");
    }

    return true;
  } catch (error) {
    handleLookupError(error, lookupType);
    return false;
  } finally {
    setLoading(false);
  }
}

function requestLocationWeather() {
  if (!("geolocation" in navigator)) {
    return;
  }

  setStatus(t("statusAllowLocation"));

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const locationQuery = `${coords.latitude},${coords.longitude}`;
      void lookupWeather(locationQuery, {
        saveSearch: false,
        lookupType: "location",
        sourceStatus: "statusUpdatedLocation",
      });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        setStatus(t("statusLocationDenied"), "warn");
        return;
      }
      setStatus(t("statusLocationFail"), "warn");
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 600000,
    }
  );
}

async function onSubmit(event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please enter a city name.", "warn");
    hideCard();
    return;
  }

  await lookupWeather(city, { saveSearch: true, lookupType: "city" });
}

function init() {
  applyLang();

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem(LANG_KEY, currentLang);
      applyLang();
      const lastCity = localStorage.getItem(LAST_CITY_KEY);
      if (lastCity && !cardEl.classList.contains("hidden")) {
        setStatus(t("statusUpdated", { city: cityInput.value || lastCity }), "ok");
      } else if (!lastCity) {
        setStatus(t("statusInit"));
      }
    });
  });

  form.addEventListener("submit", onSubmit);

  const lastCity = localStorage.getItem(LAST_CITY_KEY);
  if (lastCity) {
    cityInput.value = lastCity;
    setStatus(t("statusLastCity", { city: lastCity }));
  }

  const locationPrompted = localStorage.getItem(GEO_PROMPTED_KEY) === "1";
  if (!locationPrompted) {
    localStorage.setItem(GEO_PROMPTED_KEY, "1");
    requestLocationWeather();
  }
}

init();
