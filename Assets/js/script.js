/**
 * get searched city's data 
 * require current day and 5-day forecast
 * Get user's input from text box by id => then use fetch request using OpenWeather API using user input as query parameter
 * parse and display appropriate data in necessary area's by id
 * 
 * add event listener to search btn
 */

// api key: f654f7e880965191598d5f9223a4101d;
/**
 * 
 * api's used: 
 * a) https://openweathermap.org/current
 *      - api call: api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
 * 
 *  
 * b) https://openweathermap.org/forecast5 
 *      - api call: api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key} 
 */

/**
 * 
 * @param {string} cityName 
 */
let cityName = '';
const apiKey = 'f654f7e880965191598d5f9223a4101d';

const getCurrentWeather = async (searchedCity) => {
    let currentWeatherData = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${apiKey}`)).json().catch((e => { console.log('there was an error')}));

    if (currentWeatherData.cod !== '400') {
        return currentWeatherData;

    } else {
        return 'No City Found'
    }
} 

const getFiveDayForecast = async (searchedCity) => {
    let fiveDayData = await (await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&appid=${apiKey}`)).json();
    if (fiveDayData.cod !== '400') {
        return fiveDayData;
    } else {
        return 'No City Found'
    }
} 
const setCurrDayDashboard = (temp, wind, humidity, uvIndex) => {
    let tempPlaceHolder = document.getElementById('curr-temp');
    let windPlaceHolder = document.getElementById('curr-wind');
    let humidityPlaceHolder = document.getElementById('curr-humidity');
    let uvPlaceHolder = document.getElementById('curr-uv');

    let placeHolderForData = [tempPlaceHolder, windPlaceHolder, humidityPlaceHolder, uvPlaceHolder];
    let dataValues = [temp, wind, humidity, uvIndex]

    placeHolderForData.forEach((item, index) => {
        item.textContent = dataValues[index];
    })
}

const setFiveDayDashboard = () => {
}
const getCityWeatherData = async () => {
    /** receive search value from toggle */
    let searchVal = document.getElementById('city-search-value');

    let inputVal = searchVal.value;
    let currWeather = (await getCurrentWeather(inputVal));
    let mainContent = currWeather.main;
    let fiveDay = await getFiveDayForecast(inputVal);

    
    let temp = Math.floor(parseInt(mainContent.temp) - 273);
    let humidity = mainContent.humidity;
    let wind = currWeather.wind.speed;
    let uvValue = '';
    
    setCurrDayDashboard(temp, wind, humidity, uvValue);
}




let searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', getCityWeatherData)
