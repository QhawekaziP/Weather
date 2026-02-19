
// Weather code to icon mapping (WMO Weather interpretation codes)
const weatherIcons = {
    // Clear/Sunny
    0: { icon: 'icon-sunny.webp', label: 'Clear sky' },
    
    // Partly cloudy
    1: { icon: 'icon-partly-cloudy.webp', label: 'Mainly clear' },
    2: { icon: 'icon-partly-cloudy.webp', label: 'Partly cloudy' },
    3: { icon: 'icon-overcast.webp', label: 'Overcast' },
    
    // Fog
    45: { icon: 'icon-fog.webp', label: 'Fog' },
    48: { icon: 'icon-fog.webp', label: 'Rime fog' },
    
    // Drizzle
    51: { icon: 'icon-drizzle.webp', label: 'Light drizzle' },
    53: { icon: 'icon-drizzle.webp', label: 'Moderate drizzle' },
    55: { icon: 'icon-drizzle.webp', label: 'Dense drizzle' },
    56: { icon: 'icon-drizzle.webp', label: 'Freezing drizzle' },
    57: { icon: 'icon-drizzle.webp', label: 'Dense freezing drizzle' },
    
    // Rain
    61: { icon: 'icon-rain.webp', label: 'Slight rain' },
    63: { icon: 'icon-rain.webp', label: 'Moderate rain' },
    65: { icon: 'icon-rain.webp', label: 'Heavy rain' },
    66: { icon: 'icon-rain.webp', label: 'Freezing rain' },
    67: { icon: 'icon-rain.webp', label: 'Heavy freezing rain' },
    
    // Showers (using rain icon)
    80: { icon: 'icon-rain.webp', label: 'Slight showers' },
    81: { icon: 'icon-rain.webp', label: 'Moderate showers' },
    82: { icon: 'icon-rain.webp', label: 'Violent showers' },
    
    // Snow
    71: { icon: 'icon-snow.webp', label: 'Slight snow' },
    73: { icon: 'icon-snow.webp', label: 'Moderate snow' },
    75: { icon: 'icon-snow.webp', label: 'Heavy snow' },
    77: { icon: 'icon-snow.webp', label: 'Snow grains' },
    85: { icon: 'icon-snow.webp', label: 'Snow showers' },
    86: { icon: 'icon-snow.webp', label: 'Heavy snow showers' },
    
    // Thunderstorm
    95: { icon: 'icon-storm.webp', label: 'Thunderstorm' },
    96: { icon: 'icon-storm.webp', label: 'Thunderstorm with hail' },
    99: { icon: 'icon-storm.webp', label: 'Heavy thunderstorm with hail' }
};

// Get icon based on weather code
function getWeatherIcon(weatherCode) {
    const iconData = weatherIcons[weatherCode] || weatherIcons[0]; // Default to sunny
    return iconData.icon;
}

// Get icon HTML
function getIconHTML(iconName, size = '24', className = 'weather-icon', altText = 'Weather icon') {
    // Remove 'icon-' prefix for alt text if needed
    const readableAlt = iconName.replace('icon-', '').replace('.webp', '').replace(/-/g, ' ');
    return `<img src="assets/icons/${iconName}" class="${className}" width="${size}" height="${size}" alt="${readableAlt}" loading="lazy">`;
}

// Update the state object
const state = {
    currentLocation: { name: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
    weatherData: null,
    unit: 'celsius',
    windUnit: 'kmh',
    precipUnit: 'mm',
    selectedDay: 0,
    isLoading: false,
    searchResults: [],
    error: null
};

// Update the renderWeather function
function renderWeather() {
    if (!state.weatherData) return;

    const data = state.weatherData;
    const current = data.current_weather;
    const hourly = data.hourly;
    const daily = data.daily;
    const currentHour = new Date().getHours();

    // Get current weather icon
    const currentWeatherCode = current.weathercode || 0;
    const currentIcon = getWeatherIcon(currentWeatherCode);

    // Update location and date with icon
    elements.locationName.innerHTML = `
        <div class="location-with-icon">
            ${getIconHTML(currentIcon, '32', 'current-weather-icon', 'Current weather')}
            <span>${state.currentLocation.name}</span>
        </div>
    `;
    
    elements.currentDate.textContent = formatDate(new Date().toISOString().split('T')[0]);

    // Update current temperature with icon
    const tempDisplay = document.querySelector('.current-temp-display');
    if (tempDisplay) {
        elements.currentTemp.innerHTML = `
            <div class="current-temp-display">
                <span class="temp-value">${Math.round(current.temperature)}°</span>
                ${getIconHTML(currentIcon, '48', 'large-weather-icon', 'Current temperature icon')}
            </div>
        `;
    } else {
        elements.currentTemp.innerHTML = `
            <span class="temp-value">${Math.round(current.temperature)}°</span>
            ${getIconHTML(currentIcon, '48', 'large-weather-icon', 'Current temperature icon')}
        `;
    }
    
    // Get feels like
    elements.feelsLike.textContent = `${Math.round(current.temperature)}°`;
    
    // Get humidity
    const currentHumidity = hourly.relativehumidity_2m[currentHour] || 46;
    elements.humidity.textContent = `${currentHumidity}%`;
    
    // Update wind
    elements.wind.textContent = `${Math.round(current.windspeed)} ${state.windUnit}`;
    
    // Update precipitation
    const currentPrecip = hourly.precipitation[currentHour] || 0;
    elements.precipitation.textContent = `${currentPrecip.toFixed(1)} ${state.precipUnit === 'mm' ? 'mm' : 'in'}`;

    // Render daily forecast
    renderDailyForecast(daily);

    // Render day selector and hourly forecast
    renderDaySelector(daily);
    renderHourlyForecast(hourly, state.selectedDay);
}

// Update renderDailyForecast function
function renderDailyForecast(daily) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    let html = '';
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        const dayName = days[dayIndex];
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weathercode[i];
        const iconName = getWeatherIcon(weatherCode);
        
        html += `
            <div class="forecast-day-card ${i === state.selectedDay ? 'active' : ''}" data-day-index="${i}" tabindex="0" role="button" aria-label="${dayName}'s forecast: ${maxTemp}° high, ${minTemp}° low">
                <div class="forecast-day">${dayName}</div>
                ${getIconHTML(iconName, '32', 'forecast-icon', `${dayName} weather`)}
                <div class="forecast-temp">${maxTemp}°</div>
                <div class="forecast-temp-range">
                    <span class="temp-high">${maxTemp}°</span>
                    <span class="temp-low">${minTemp}°</span>
                </div>
            </div>
        `;
    }
    
    elements.dailyForecast.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.forecast-day-card').forEach(card => {
        card.addEventListener('click', () => {
            const dayIndex = parseInt(card.dataset.dayIndex);
            state.selectedDay = dayIndex;
            renderDaySelector(state.weatherData.daily);
            renderHourlyForecast(state.weatherData.hourly, dayIndex);
            
            document.querySelectorAll('.forecast-day-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });

        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// Update renderHourlyForecast function
function renderHourlyForecast(hourly, dayIndex) {
    const hoursPerDay = 24;
    const startIndex = dayIndex * hoursPerDay;
    let html = '';

    for (let i = 0; i < 8; i++) {
        const hourIndex = startIndex + i;
        if (hourIndex >= hourly.time.length) break;

        const hourTime = new Date(hourly.time[hourIndex]);
        const hour = hourTime.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const temp = Math.round(hourly.temperature_2m[hourIndex]);
        const weatherCode = hourly.weathercode[hourIndex];
        const iconName = getWeatherIcon(weatherCode);
        
        // Format time string
        const timeString = `${hour12} ${ampm}`;

        html += `
            <div class="hour-card" tabindex="0" role="button" aria-label="${timeString}: ${temp}°">
                <div class="hour-time">${timeString}</div>
                ${getIconHTML(iconName, '20', 'hourly-icon', `${timeString} weather`)}
                <div class="hour-temp">${temp}°</div>
            </div>
        `;
    }

    elements.hourlyGrid.innerHTML = html;
}

// Update renderDaySelector function (optional - can add icons to day tabs)
function renderDaySelector(daily) {
    let html = '';
    for (let i = 0; i < 7; i++) {
        const dayName = getDayName(daily.time[i]);
        const weatherCode = daily.weathercode[i];
        const iconName = getWeatherIcon(weatherCode);
        
        html += `
            <button class="day-tab ${i === state.selectedDay ? 'active' : ''}" data-day="${i}" aria-label="${dayName}">
                <span class="day-name">${dayName}</span>
                ${getIconHTML(iconName, '16', 'day-tab-icon', `${dayName} weather`)}
            </button>
        `;
    }
    
    elements.daySelector.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const dayIndex = parseInt(tab.dataset.day);
            state.selectedDay = dayIndex;
            renderHourlyForecast(state.weatherData.hourly, dayIndex);
            
            document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.forecast-day-card').forEach((card, index) => {
                if (index === dayIndex) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        });
    });
}

// Weather code to icon mapping (WMO Weather interpretation codes)
const weatherIcons = {
    // Clear
    0: { day: 'clear-day', night: 'clear-night', label: 'Clear sky' },
    
    // Partly cloudy
    1: { day: 'partly-cloudy-day', night: 'partly-cloudy-night', label: 'Mainly clear' },
    2: { day: 'partly-cloudy-day', night: 'partly-cloudy-night', label: 'Partly cloudy' },
    3: { day: 'cloudy', night: 'cloudy', label: 'Overcast' },
    
    // Fog
    45: { day: 'fog', night: 'fog', label: 'Fog' },
    48: { day: 'fog', night: 'fog', label: 'Rime fog' },
    
    // Rain
    51: { day: 'rain', night: 'rain', label: 'Light drizzle' },
    53: { day: 'rain', night: 'rain', label: 'Moderate drizzle' },
    55: { day: 'rain', night: 'rain', label: 'Dense drizzle' },
    56: { day: 'rain', night: 'rain', label: 'Freezing drizzle' },
    57: { day: 'rain', night: 'rain', label: 'Dense freezing drizzle' },
    61: { day: 'rain', night: 'rain', label: 'Slight rain' },
    63: { day: 'rain', night: 'rain', label: 'Moderate rain' },
    65: { day: 'rain', night: 'rain', label: 'Heavy rain' },
    66: { day: 'rain', night: 'rain', label: 'Freezing rain' },
    67: { day: 'rain', night: 'rain', label: 'Heavy freezing rain' },
    
    // Snow
    71: { day: 'snow', night: 'snow', label: 'Slight snow' },
    73: { day: 'snow', night: 'snow', label: 'Moderate snow' },
    75: { day: 'snow', night: 'snow', label: 'Heavy snow' },
    77: { day: 'snow', night: 'snow', label: 'Snow grains' },
    
    // Showers
    80: { day: 'rain', night: 'rain', label: 'Slight showers' },
    81: { day: 'rain', night: 'rain', label: 'Moderate showers' },
    82: { day: 'rain', night: 'rain', label: 'Violent showers' },
    
    // Thunderstorm
    95: { day: 'thunderstorm', night: 'thunderstorm', label: 'Thunderstorm' },
    96: { day: 'thunderstorm', night: 'thunderstorm', label: 'Thunderstorm with hail' },
    99: { day: 'thunderstorm', night: 'thunderstorm', label: 'Heavy thunderstorm with hail' }
};

// Helper function to determine if it's day or night
function isDayTime(currentHour) {
    return currentHour >= 6 && currentHour < 18; // 6 AM to 6 PM
}

// Get icon based on weather code and time
function getWeatherIcon(weatherCode, currentHour = new Date().getHours()) {
    const iconSet = weatherIcons[weatherCode] || weatherIcons[0];
    const timeOfDay = isDayTime(currentHour) ? 'day' : 'night';
    return iconSet[timeOfDay] || iconSet.day || 'cloudy';
}

// Get icon HTML
function getIconHTML(iconName, size = '24', className = 'weather-icon') {
    return `<img src="assets/icons/${iconName}.svg" class="${className}" width="${size}" height="${size}" alt="Weather icon">`;
}

// Update the state object to include weather codes
const state = {
    currentLocation: { name: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
    weatherData: null,
    unit: 'celsius',
    windUnit: 'kmh',
    precipUnit: 'mm',
    selectedDay: 0,
    isLoading: false,
    searchResults: [],
    error: null,
    currentHour: new Date().getHours() // Add current hour for day/night detection
};

// Update the renderWeather function
function renderWeather() {
    if (!state.weatherData) return;

    const data = state.weatherData;
    const current = data.current_weather;
    const hourly = data.hourly;
    const daily = data.daily;
    const currentHour = new Date().getHours();

    // Get current weather icon
    const currentWeatherCode = current.weathercode || 0;
    const currentIcon = getWeatherIcon(currentWeatherCode, currentHour);

    // Update location and date with icon
    elements.locationName.innerHTML = `
        <div class="location-with-icon">
            ${getIconHTML(currentIcon, '32', 'current-weather-icon')}
            <span>${state.currentLocation.name}</span>
        </div>
    `;
    
    elements.currentDate.textContent = formatDate(new Date().toISOString().split('T')[0]);

    // Update current weather
    elements.currentTemp.innerHTML = `
        <span class="temp-value">${Math.round(current.temperature)}°</span>
        ${getIconHTML(currentIcon, '48', 'large-weather-icon')}
    `;
    
    // Get feels like (using temperature for now, can be enhanced)
    elements.feelsLike.textContent = `${Math.round(current.temperature)}°`;
    
    // Get humidity (average of next few hours)
    const currentHumidity = hourly.relativehumidity_2m[currentHour] || 46;
    elements.humidity.textContent = `${currentHumidity}%`;
    
    // Update wind
    elements.wind.textContent = `${Math.round(current.windspeed)} ${state.windUnit}`;
    
    // Update precipitation
    const currentPrecip = hourly.precipitation[currentHour] || 0;
    elements.precipitation.textContent = `${currentPrecip.toFixed(1)} ${state.precipUnit === 'mm' ? 'mm' : 'in'}`;

    // Render daily forecast
    renderDailyForecast(daily);

    // Render day selector and hourly forecast
    renderDaySelector(daily);
    renderHourlyForecast(hourly, state.selectedDay);
}

// Update renderDailyForecast function
function renderDailyForecast(daily) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    let html = '';
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        const dayName = days[dayIndex];
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const weatherCode = daily.weathercode[i];
        
        // Use noon hour for day/night detection in forecast
        const iconName = getWeatherIcon(weatherCode, 12); // Assume noon for forecast
        
        html += `
            <div class="forecast-day-card ${i === state.selectedDay ? 'active' : ''}" data-day-index="${i}" tabindex="0" role="button" aria-label="${dayName}'s forecast">
                <div class="forecast-day">${dayName}</div>
                ${getIconHTML(iconName, '32', 'forecast-icon')}
                <div class="forecast-temp">${maxTemp}°</div>
                <div class="forecast-temp-range">
                    <span class="temp-high">${maxTemp}°</span>
                    <span class="temp-low">${minTemp}°</span>
                </div>
            </div>
        `;
    }
    
    elements.dailyForecast.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.forecast-day-card').forEach(card => {
        card.addEventListener('click', () => {
            const dayIndex = parseInt(card.dataset.dayIndex);
            state.selectedDay = dayIndex;
            renderDaySelector(state.weatherData.daily);
            renderHourlyForecast(state.weatherData.hourly, dayIndex);
            
            document.querySelectorAll('.forecast-day-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });

        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// Update renderHourlyForecast function
function renderHourlyForecast(hourly, dayIndex) {
    const hoursPerDay = 24;
    const startIndex = dayIndex * hoursPerDay;
    let html = '';

    for (let i = 0; i < 8; i++) {
        const hourIndex = startIndex + i;
        if (hourIndex >= hourly.time.length) break;

        const hour = new Date(hourly.time[hourIndex]).getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const temp = Math.round(hourly.temperature_2m[hourIndex]);
        const weatherCode = hourly.weathercode[hourIndex];
        const iconName = getWeatherIcon(weatherCode, hour);

        html += `
            <div class="hour-card">
                <div class="hour-time">${hour12} ${ampm}</div>
                ${getIconHTML(iconName, '20', 'hourly-icon')}
                <div class="hour-temp">${temp}°</div>
            </div>
        `;
    }

    elements.hourlyGrid.innerHTML = html;
}
const WeatherAPI = {
    baseURL: 'https://api.open-meteo.com/v1',
    
    async searchLocation(query) {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Location search error:', error);
            return [];
        }
    },

    async getWeather(lat, lon, unit = 'celsius') {
        const tempUnit = unit === 'celsius' ? 'celsius' : 'fahrenheit';
        try {
            const response = await fetch(
                `${this.baseURL}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&windspeed_unit=${unit === 'celsius' ? 'kmh' : 'mph'}&precipitation_unit=${unit === 'celsius' ? 'mm' : 'inch'}&timezone=auto`
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Weather fetch error:', error);
            throw error;
        }
    }
};

// State Management
const state = {
    currentLocation: { name: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
    weatherData: null,
    unit: 'celsius',
    windUnit: 'kmh',
    precipUnit: 'mm',
    selectedDay: 0,
    isLoading: false,
    searchResults: [],
    error: null
};

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    suggestions: document.getElementById('suggestions'),
    unitsBtn: document.getElementById('unitsBtn'),
    dropdownContent: document.getElementById('dropdownContent'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    noResultsState: document.getElementById('noResultsState'),
    weatherContent: document.getElementById('weatherContent'),
    locationName: document.getElementById('locationName'),
    currentDate: document.getElementById('currentDate'),
    currentTemp: document.getElementById('currentTemp'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    wind: document.getElementById('wind'),
    precipitation: document.getElementById('precipitation'),
    dailyForecast: document.getElementById('dailyForecast'),
    daySelector: document.getElementById('daySelector'),
    hourlyGrid: document.getElementById('hourlyGrid'),
    retryBtn: document.getElementById('retryBtn')
};

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function convertTemperature(temp, toUnit) {
    if (toUnit === 'fahrenheit') {
        return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
}

function convertWindSpeed(speed, fromUnit, toUnit) {
    if (fromUnit === toUnit) return Math.round(speed);
    if (fromUnit === 'kmh' && toUnit === 'mph') {
        return Math.round(speed * 0.621371);
    }
    if (fromUnit === 'mph' && toUnit === 'kmh') {
        return Math.round(speed * 1.60934);
    }
    return Math.round(speed);
}

function convertPrecipitation(precip, fromUnit, toUnit) {
    if (fromUnit === toUnit) return precip.toFixed(1);
    if (fromUnit === 'mm' && toUnit === 'inches') {
        return (precip * 0.0393701).toFixed(2);
    }
    if (fromUnit === 'inches' && toUnit === 'mm') {
        return (precip * 25.4).toFixed(1);
    }
    return precip.toFixed(1);
}

// Render Functions
function renderWeather() {
    if (!state.weatherData) return;

    const data = state.weatherData;
    const current = data.current_weather;
    const hourly = data.hourly;
    const daily = data.daily;

    // Update location and date
    elements.locationName.textContent = state.currentLocation.name;
    elements.currentDate.textContent = formatDate(new Date().toISOString().split('T')[0]);

    // Update current weather
    elements.currentTemp.textContent = `${Math.round(current.temperature)}°`;
    
    // Get feels like (using temperature for now, can be enhanced)
    elements.feelsLike.textContent = `${Math.round(current.temperature)}°`;
    
    // Get humidity (average of next few hours)
    const currentHour = new Date().getHours();
    const currentHumidity = hourly.relativehumidity_2m[currentHour] || 46;
    elements.humidity.textContent = `${currentHumidity}%`;
    
    // Update wind
    elements.wind.textContent = `${Math.round(current.windspeed)} ${state.windUnit}`;
    
    // Update precipitation
    const currentPrecip = hourly.precipitation[currentHour] || 0;
    elements.precipitation.textContent = `${currentPrecip.toFixed(1)} ${state.precipUnit === 'mm' ? 'mm' : 'in'}`;

    // Render daily forecast
    renderDailyForecast(daily);

    // Render day selector and hourly forecast
    renderDaySelector(daily);
    renderHourlyForecast(hourly, state.selectedDay);
}

function renderDailyForecast(daily) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    let html = '';
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        const dayName = days[dayIndex];
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        
        html += `
            <div class="forecast-day-card ${i === state.selectedDay ? 'active' : ''}" data-day-index="${i}" tabindex="0" role="button" aria-label="${dayName}'s forecast">
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-temp">${maxTemp}°</div>
                <div class="forecast-temp-range">
                    <span class="temp-high">${maxTemp}°</span>
                    <span class="temp-low">${minTemp}°</span>
                </div>
            </div>
        `;
    }
    
    elements.dailyForecast.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.forecast-day-card').forEach(card => {
        card.addEventListener('click', () => {
            const dayIndex = parseInt(card.dataset.dayIndex);
            state.selectedDay = dayIndex;
            renderDaySelector(state.weatherData.daily);
            renderHourlyForecast(state.weatherData.hourly, dayIndex);
            
            // Update active state
            document.querySelectorAll('.forecast-day-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });

        // Keyboard support
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

function renderDaySelector(daily) {
    let html = '';
    for (let i = 0; i < 7; i++) {
        const dayName = getDayName(daily.time[i]);
        html += `
            <button class="day-tab ${i === state.selectedDay ? 'active' : ''}" data-day="${i}">${dayName}</button>
        `;
    }
    
    elements.daySelector.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const dayIndex = parseInt(tab.dataset.day);
            state.selectedDay = dayIndex;
            renderHourlyForecast(state.weatherData.hourly, dayIndex);
            
            // Update active state
            document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Also update daily forecast active state
            document.querySelectorAll('.forecast-day-card').forEach((card, index) => {
                if (index === dayIndex) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        });
    });
}

function renderHourlyForecast(hourly, dayIndex) {
    const hoursPerDay = 24;
    const startIndex = dayIndex * hoursPerDay;
    let html = '';

    for (let i = 0; i < 8; i++) {
        const hourIndex = startIndex + i;
        if (hourIndex >= hourly.time.length) break;

        const hour = new Date(hourly.time[hourIndex]).getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const temp = Math.round(hourly.temperature_2m[hourIndex]);

        html += `
            <div class="hour-card">
                <div class="hour-time">${hour12} ${ampm}</div>
                <div class="hour-temp">${temp}°</div>
            </div>
        `;
    }

    elements.hourlyGrid.innerHTML = html;
}

function renderSuggestions(results) {
    if (results.length === 0) {
        elements.suggestions.classList.remove('show');
        return;
    }

    let html = '';
    results.forEach(location => {
        html += `
            <div class="suggestion-item" tabindex="0" data-lat="${location.latitude}" data-lon="${location.longitude}" data-name="${location.name}, ${location.country}">
                ${location.name}, ${location.country}
            </div>
        `;
    });

    elements.suggestions.innerHTML = html;
    elements.suggestions.classList.add('show');

    // Add click handlers to suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', async () => {
            const lat = parseFloat(item.dataset.lat);
            const lon = parseFloat(item.dataset.lon);
            const name = item.dataset.name;

            elements.searchInput.value = name;
            elements.suggestions.classList.remove('show');

            await fetchWeatherForLocation(lat, lon, name);
        });

        // Keyboard support
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                item.click();
            }
        });
    });
}

// UI State Functions
function showLoading() {
    elements.loadingState.classList.remove('hidden');
    elements.weatherContent.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.noResultsState.classList.add('hidden');
    state.isLoading = true;
}

function hideLoading() {
    elements.loadingState.classList.add('hidden');
    state.isLoading = false;
}

function showError() {
    elements.errorState.classList.remove('hidden');
    elements.weatherContent.classList.add('hidden');
    elements.noResultsState.classList.add('hidden');
    elements.loadingState.classList.add('hidden');
}

function showNoResults() {
    elements.noResultsState.classList.remove('hidden');
    elements.weatherContent.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.loadingState.classList.add('hidden');
}

function showWeatherContent() {
    elements.weatherContent.classList.remove('hidden');
    elements.errorState.classList.add('hidden');
    elements.noResultsState.classList.add('hidden');
    elements.loadingState.classList.add('hidden');
}

// Data Fetching Functions
async function fetchWeatherForLocation(lat, lon, name) {
    showLoading();

    try {
        state.currentLocation = { name, lat, lon };
        const weatherData = await WeatherAPI.getWeather(lat, lon, state.unit);
        state.weatherData = weatherData;
        state.selectedDay = 0;
        showWeatherContent();
        renderWeather();
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Event Handlers
async function handleSearch() {
    const query = elements.searchInput.value.trim();
    if (!query) return;

    showLoading();

    try {
        const results = await WeatherAPI.searchLocation(query);
        
        if (results.length === 0) {
            showNoResults();
            return;
        }

        const location = results[0];
        await fetchWeatherForLocation(
            location.latitude, 
            location.longitude, 
            `${location.name}, ${location.country}`
        );
    } catch (error) {
        console.error('Search error:', error);
        showError();
    } finally {
        hideLoading();
    }
}

async function handleSearchInput() {
    const query = elements.searchInput.value.trim();
    
    if (query.length < 2) {
        elements.suggestions.classList.remove('show');
        return;
    }

    try {
        const results = await WeatherAPI.searchLocation(query);
        state.searchResults = results;
        renderSuggestions(results);
    } catch (error) {
        console.error('Suggestion error:', error);
    }
}

function handleUnitChange() {
    const tempUnit = document.querySelector('input[name="tempUnit"]:checked').value;
    const windUnit = document.querySelector('input[name="windUnit"]:checked').value;
    const precipUnit = document.querySelector('input[name="precipUnit"]:checked').value;

    state.unit = tempUnit;
    state.windUnit = windUnit;
    state.precipUnit = precipUnit;

    // Refresh weather data with new units
    if (state.currentLocation) {
        showLoading();
        WeatherAPI.getWeather(state.currentLocation.lat, state.currentLocation.lon, state.unit)
            .then(data => {
                state.weatherData = data;
                renderWeather();
                showWeatherContent();
            })
            .catch(() => showError())
            .finally(() => hideLoading());
    }
}

// Initialize
async function init() {
    // Load default weather (Berlin)
    await fetchWeatherForLocation(52.52, 13.405, 'Berlin, Germany');

    // Event listeners
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('input', debounce(handleSearchInput, 300));
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.searchInput.contains(e.target) && !elements.suggestions.contains(e.target)) {
            elements.suggestions.classList.remove('show');
        }
    });

    // Units dropdown
    elements.unitsBtn.addEventListener('click', () => {
        const expanded = elements.unitsBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
        elements.unitsBtn.setAttribute('aria-expanded', expanded);
        elements.dropdownContent.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.unitsBtn.contains(e.target) && !elements.dropdownContent.contains(e.target)) {
            elements.dropdownContent.classList.remove('show');
            elements.unitsBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            elements.dropdownContent.classList.remove('show');
            elements.unitsBtn.setAttribute('aria-expanded', 'false');
            elements.suggestions.classList.remove('show');
        }
    });

    // Unit change listeners
    document.querySelectorAll('input[name="tempUnit"], input[name="windUnit"], input[name="precipUnit"]').forEach(input => {
        input.addEventListener('change', handleUnitChange);
    });

    // Retry button
    elements.retryBtn.addEventListener('click', async () => {
        if (state.currentLocation) {
            await fetchWeatherForLocation(
                state.currentLocation.lat, 
                state.currentLocation.lon, 
                state.currentLocation.name
            );
        } else {
            await fetchWeatherForLocation(52.52, 13.405, 'Berlin, Germany');
        }
    });

    // Handle touch events for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Re-render if needed for layout adjustments
            if (state.weatherData) {
                renderWeather();
            }
        }, 100);
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
