// --- Configuration ---
let apiKey = localStorage.getItem('skycast_api_key');
const defaultCity = 'Johannesburg'; // Default location changed to JHB

// --- DOM Elements ---
const modal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('userApiKey');
const saveKeyBtn = document.getElementById('saveApiKeyBtn');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const body = document.body;

// --- Map Initialization ---
// Initialize map centered on Johannesburg
let map = L.map('map').setView([-26.2041, 28.0473], 10); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// --- Map Click Event (Reverse Geocoding) ---
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    getWeatherDataByCoords(lat, lng);
});

// --- Event Listeners ---
saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('skycast_api_key', key);
        apiKey = key;
        modal.classList.add('hidden');
        getWeatherData(defaultCity);
    } else {
        alert('Please enter a valid key');
    }
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) getWeatherData(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value;
        if (city) getWeatherData(city);
    }
});

// --- API Functions ---

function checkKey() {
    if (!apiKey) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
        getWeatherData(defaultCity);
    }
}

function clearKey() {
    localStorage.removeItem('skycast_api_key');
    location.reload();
}

// Fetch by City Name
async function getWeatherData(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        await fetchData(url);
    } catch (error) {
        handleError(error);
    }
}

// Fetch by Coordinates (Map Click)
async function getWeatherDataByCoords(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        await fetchData(url);
    } catch (error) {
        handleError(error);
    }
}

// Common Fetch Logic
async function fetchData(weatherUrl) {
    const weatherRes = await fetch(weatherUrl);
    
    if (!weatherRes.ok) {
        if (weatherRes.status === 401) throw new Error('Invalid API Key.');
        if (weatherRes.status === 404) throw new Error('Location not found.');
        throw new Error('Error fetching data.');
    }

    const weatherData = await weatherRes.json();
    
    // Get Forecast using coordinates from the first result
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&units=metric&appid=${apiKey}`);
    const forecastData = await forecastRes.json();

    updateUI(weatherData);
    updateForecast(forecastData.list);
    updateMap(weatherData.coord.lat, weatherData.coord.lon);
    
    // Pass timestamp (dt) and timezone to calculate local time for night theme
    updateTheme(weatherData.weather[0].main, weatherData.dt, weatherData.timezone);
}

function handleError(error) {
    alert(error.message);
    if (error.message.includes('Invalid API Key')) clearKey();
}

// --- UI Update Functions ---

function updateUI(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    cityInput.value = data.name; // Update search bar with found name
    
    document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' });
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°`;
    document.getElementById('weatherDescription').textContent = data.weather[0].description;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    document.getElementById('windSpeed').textContent = `${data.wind.speed} km/h`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
}

function updateForecast(list) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = ''; 

    // Filter for noon readings
    const dailyData = list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const card = document.createElement('div');
        card.className = 'forecast-item';
        card.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
            <h3>${Math.round(day.main.temp)}°</h3>
            <p style="font-size: 0.8rem">${day.weather[0].main}</p>
        `;
        container.appendChild(card);
    });
}

function updateMap(lat, lon) {
    if(!map) return;
    map.setView([lat, lon], 10);
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    L.marker([lat, lon]).addTo(map)
        .bindPopup("Selected Location")
        .openPopup();
}

function updateTheme(condition, timestamp, timezoneOffset) {
    // Calculate local time of the searched city
    const localTime = new Date((timestamp + timezoneOffset) * 1000);
    const hours = localTime.getUTCHours();
    const isNight = hours >= 19 || hours <= 6;

    // Reset Classes
    body.className = '';

    if (isNight) {
        body.classList.add('theme-night');
    } else if (['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(condition)) {
        body.classList.add('theme-rainy');
    } else if (['Clouds', 'Mist', 'Fog', 'Haze'].includes(condition)) {
        body.classList.add('theme-cloudy');
    } else {
        // Default (Clear/Sunny)
        body.classList.remove('theme-night', 'theme-rainy', 'theme-cloudy');
    }
// Fix Leaflet map sizing on resize (Mobile/Desktop switch)
window.addEventListener('resize', () => {
    if(map) map.invalidateSize();
});
}

// Start App
checkKey();