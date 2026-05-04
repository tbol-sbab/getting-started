const API_URL = "https://wttr.in";
const LAST_CITY_KEY = "weather.lastCity";

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

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${tone}`.trim();
}

function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "Loading..." : "Get Weather";
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

function formatWeather(data) {
  const current = data.current_condition?.[0] ?? {};
  const area = data.nearest_area?.[0] ?? {};
  const areaName = area.areaName?.[0]?.value ?? "Unknown city";
  const country = area.country?.[0]?.value ?? "";
  const cityLabel = country ? `${areaName}, ${country}` : areaName;
  const windKmph = Number(current.windspeedKmph ?? 0);

  return {
    city: cityLabel,
    description: current.weatherDesc?.[0]?.value ?? "Unknown",
    iconUrl: current.weatherIconUrl?.[0]?.value ?? "",
    temp: `${Math.round(Number(current.temp_C ?? 0))} C`,
    feelsLike: `${Math.round(Number(current.FeelsLikeC ?? 0))} C`,
    humidity: `${current.humidity ?? "-"}%`,
    wind: `${Math.round(windKmph / 3.6)} m/s`,
  };
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

  showCard();
  setStatus(`Updated weather for ${weather.city}.`, "ok");
}

async function fetchWeather(city) {
  const response = await fetch(`${API_URL}/${encodeURIComponent(city)}?format=j1`);

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

async function onSubmit(event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please enter a city name.", "warn");
    hideCard();
    return;
  }

  setLoading(true);
  setStatus(`Looking up weather for ${city}...`);

  try {
    const raw = await fetchWeather(city);
    const weather = formatWeather(raw);
    localStorage.setItem(LAST_CITY_KEY, city);
    renderWeather(weather);
  } catch (error) {
    hideCard();

    if (error.message === "not_found") {
      setStatus("City not found. Try a larger city or include proper spelling.", "warn");
      return;
    }

    setStatus("Could not load weather data. Check your connection and try again.", "error");
  } finally {
    setLoading(false);
  }
}

function init() {
  form.addEventListener("submit", onSubmit);

  const lastCity = localStorage.getItem(LAST_CITY_KEY);
  if (lastCity) {
    cityInput.value = lastCity;
    setStatus(`Press Get Weather to refresh ${lastCity}.`);
  }
}

init();
