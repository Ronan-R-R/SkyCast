# SkyCast - Weather Dashboard

SkyCast is a responsive, real-time weather dashboard built with vanilla JavaScript. It features interactive mapping, dynamic UI themes based on weather conditions, and a secure client-side API key management system.

## Live Demo

View the hosted application here: https://ronan-r-r.github.io/SkyCast/

## Features

- **Real-Time Weather Data:** Fetches current conditions, humidity, wind speed, visibility, and pressure via the OpenWeatherMap API.
- **5-Day Forecast:** Displays upcoming weather trends.
- **Interactive Map:** Integrated Leaflet.js map allowing users to click any location to view local weather.
- **Dynamic Themes:** The application interface changes automatically based on time of day (Day/Night) and weather conditions (Sunny, Cloudy, Rainy).
- **Secure Key Management:** API keys are input by the user via a setup modal and stored in the browser's Local Storage. No keys are hardcoded in the repository.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices.

## Technologies Used

- HTML5
- CSS3 (CSS Variables for theming)
- JavaScript (ES6+, Async/Await)
- OpenWeatherMap API
- Leaflet.js (Mapping)
- FontAwesome (Icons)

## Setup and Installation

1. Clone the repository:
   git clone https://github.com/Ronan-R-R/SkyCast.git

2. Open the project directory.

3. Open `index.html` in your web browser.

## API Key Configuration

To use this application, an OpenWeatherMap API key is required. This ensures the project remains free and secure.

1. Sign up for a free account at OpenWeatherMap.org.
2. Navigate to "My API Keys" and generate a key.
3. Open SkyCast.
4. Enter your key in the popup modal.
5. The key is saved locally to your device. You can reset it at any time via the sidebar menu.

## Project Structure

- **index.html:** Main application structure and layout.
- **style.css:** All styling, including specific theme classes (theme-rainy, theme-night, etc.).
- **script.js:** Handles API calls, map logic, DOM manipulation, and theme switching logic.
