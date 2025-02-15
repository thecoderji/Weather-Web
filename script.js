const apiKey = 'c56f33dd825cf4ef3c03e303b2776d6c';

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const themeSwitch = document.getElementById('themeSwitch');
    themeSwitch.textContent = body.classList.contains('dark-mode') ? '🌜' : '🌞';
}

function displayError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = `<p>${message}</p>`;
}

function searchWeather() {
    const cityInput = document.getElementById('cityInput').value;
    const errorDiv = document.getElementById('error');

    if (cityInput) {
        errorDiv.innerHTML = '';
        getWeather(cityInput);
    } else {
        displayError('Please enter a city name.');
    }
}

function getGeolocation() {
    const errorDiv = document.getElementById('error');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoordinates(lat, lon);
        });
    } else {
        displayError('Geolocation is not supported by this browser.');
    }
}

function getWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Call functions to update the DOM with the weather data
            displayCurrentWeather(data);
            displayExtraInfo(data);
            displayAirPollution(city);
            getForecast(city);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            displayError('Unable to fetch weather data. Please try again.');
        });
}

function getWeatherByCoordinates(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Call functions to update the DOM with the weather data
            displayCurrentWeather(data);
            displayExtraInfo(data);
            displayAirPollution(data.name);
            getForecast(data.name);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Unable to fetch weather data. Please try again.');
        });
}

function displayCurrentWeather(data) {
    const currentWeatherDiv = document.getElementById('currentWeather');
    currentWeatherDiv.innerHTML = `
        <h2>${data.name}</h2>
        <p>Date: ${new Date(data.dt * 1000).toLocaleDateString()}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather Icon">
    `;
}

function displayExtraInfo(data) {
    const extraInfoDiv = document.getElementById('extraInfo');
    extraInfoDiv.innerHTML = `
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p>Real Feel Temperature: ${data.main.feels_like}°C</p>
        <p>Clouds: ${data.clouds.all}%</p>
        <p>Humidity: ${data.main.humidity}%</p>
    `;
}

// Function to display air pollution information
function displayAirPollution(coordinates) {
    const airPollutionDiv = document.getElementById('airPollution');
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}`;

    console.log('Air Pollution API URL:', airPollutionUrl);

    fetch(airPollutionUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Air Pollution Data:', data);

            if (data && data.list && data.list.length > 0) {
                airPollutionDiv.innerHTML = `
                    <h3>Air Pollution Index</h3>
                    <p>AQI (Air Quality Index): ${data.list[0].main.aqi}</p>
                    <p>Components:</p>
                    <ul>
                        <li>CO: ${data.list[0].components.co} µg/m³</li>
                        <li>NO: ${data.list[0].components.no} µg/m³</li>
                        <li>NO2: ${data.list[0].components.no2} µg/m³</li>
                        <li>O3: ${data.list[0].components.o3} µg/m³</li>
                        <li>SO2: ${data.list[0].components.so2} µg/m³</li>
                        <li>PM2.5: ${data.list[0].components.pm2_5} µg/m³</li>
                        <li>PM10: ${data.list[0].components.pm10} µg/m³</li>
                    </ul>
                `;
            } else {
                airPollutionDiv.innerHTML = '<p>Air pollution data not available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching air pollution data:', error);
            airPollutionDiv.innerHTML = '<p>Air pollution data not available.</p>';
        });
}


function getForecast(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Call functions to update the DOM with the forecast data
            displayHourlyForecast(data);
            displayFiveDayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Unable to fetch forecast data. Please try again.');
        });
}

function displayHourlyForecast(data) {
    const hourlyForecastDiv = document.getElementById('hourlyForecast');
    const hourlyData = data.list.slice(0, 8); // Displaying the next 8 hours

    hourlyForecastDiv.innerHTML = '<h3>Hourly Forecast</h3>';
    hourlyData.forEach(item => {
        hourlyForecastDiv.innerHTML += `
            <p>${new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${item.main.temp}°C</p>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather Icon">
        `;
    });
}

function displayFiveDayForecast(data) {
    const fiveDayForecastDiv = document.getElementById('fiveDayForecast');
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00')); // Displaying once per day

    fiveDayForecastDiv.innerHTML = '<h3>5-Day Forecast</h3>';
    dailyData.forEach(item => {
        const forecastDate = new Date(item.dt * 1000);
        const dayOfWeek = getDayOfWeek(forecastDate.getDay());

        fiveDayForecastDiv.innerHTML += `
            <div class="forecast-item">
                <p>${dayOfWeek}, ${forecastDate.toLocaleDateString()}: ${item.main.temp}°C</p>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather Icon">
            </div>
        `;
    });
}

function getDayOfWeek(dayIndex) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek[dayIndex];
}

function clearError() {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = '';
}

function setDefaultCity() {
    const defaultCity = 'New Delhi'; // Replace 'YourDefaultCity' with the city you want to set as default
    getWeather(defaultCity);
}

// Call the function when the page loads
window.onload = setDefaultCity;

// Listen for 'Enter' key press in the input field
document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});


