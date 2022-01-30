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
 * @param {string} searchedCity 
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
const setCurrDayDashboard = (cityName, temp, wind, humidity, uvIndex, icon) => {
    let cityNamePlaceHolder = document.getElementById('currently-displayed-city');
    let tempPlaceHolder = document.getElementById('curr-temp');
    let windPlaceHolder = document.getElementById('curr-wind');
    let humidityPlaceHolder = document.getElementById('curr-humidity');
    let uvPlaceHolder = document.getElementById('curr-uv');
    
    let placeHolderForData = [cityNamePlaceHolder, tempPlaceHolder, windPlaceHolder, humidityPlaceHolder, uvPlaceHolder];
    let dataValues = [cityName, `${temp}`, `${wind} MPH`, `${humidity}%`, 'uvIndex']
    
    placeHolderForData.forEach((item, index) => {
        if (item !== null) {
            item.textContent = dataValues[index];
        }
    })
    let currDayBg = document.querySelector('#currDay-dash')
    currDayBg.style.backgroundImage = `url('http://openweathermap.org/img/wn/${icon}@2x.png')`;
    console.log(icon);
}

const setFiveDayDashboard = (fiveDayList) => {
     /**
     * useful object properties on item
     * 
     * .dt_txt = date/time;
     * .main => .temp, .humidity
     * .wind => .speed
     */
    let fiveDayInsertContainer = document.getElementById('five-day-forecast');
    fiveDayInsertContainer.style.display = 'flex';

    let currentDate = moment().format('DDD');
    fiveDayList.map(item => {
        let currentDay = item.dt_txt.split(' ');

        let nextDay = moment(currentDay[0]);
        let reformattedCurrentDay = moment(currentDay[0]).format('DDD');

        let itemDate = null
        let itemIcon = null;
        let itemTemp = null;
        let itemWind = null;
        let itemHumidity = null;
;
        if (currentDate < reformattedCurrentDay) {
            itemDate = nextDay.format('DD/MM/YY')
            itemIcon = item.weather[0].icon;
            iconDescrip = item.weather[0].description;
            itemTemp = Math.round(item.main.temp - 273);
            itemWind = item.wind.speed;
            itemHumidity = item.main.humidity;

            let fiveDayForecastEl = createFutureDayEl(itemDate, itemIcon, iconDescrip, itemTemp, itemWind, itemHumidity);
            fiveDayInsertContainer.append(fiveDayForecastEl);
            currentDate = reformattedCurrentDay;
        }
    })
}

const getCityWeatherData = async () => {
    /** receive search value from toggle */
    let searchVal = document.getElementById('city-search-value');

    let inputVal = searchVal.value;
    let currWeather = (await getCurrentWeather(inputVal));
    let mainContent = currWeather.main;
    let temp = Math.round(parseInt(mainContent.temp) - 273);
    let humidity = mainContent.humidity;
    let wind = currWeather.wind.speed;
    let uvValue = '';

    console.log(currWeather);
    let searchedCity = `${currWeather.name}, ${currWeather.sys.country}`;
    let currentWeatherIcon = currWeather.weather[0].icon;
    setCurrDayDashboard(searchedCity, temp, wind, humidity, uvValue, currentWeatherIcon);

    
    let fiveDay = await getFiveDayForecast(inputVal);
    setFiveDayDashboard(fiveDay.list);
}

const createFutureDayEl = (date, icon, describeIcon, temp, wind, humidity) => {
    let dayForecastContainer = document.createElement('div');
    dayForecastContainer.setAttribute('class', 'single-5day-container');
    
    let dateTitle = document.createElement('h3');
    let weatherIcon = document.createElement('img');

    let daysTemp = document.createElement('p');
    let daysWind = document.createElement('p');
    let daysHumidity = document.createElement('p');

    dateTitle.textContent = date;
    weatherIcon.setAttribute('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
    weatherIcon.setAttribute('alt', `${describeIcon}`)
    daysTemp.textContent = `Temperature: ${temp}`;
    daysWind.textContent = `Wind: ${wind} MPH`;
    daysHumidity.textContent = `Humidity: ${humidity}%`;
    
    dayForecastContainer.append(dateTitle, weatherIcon, daysTemp, daysWind, daysHumidity);
    return dayForecastContainer;
}


let searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', getCityWeatherData)
