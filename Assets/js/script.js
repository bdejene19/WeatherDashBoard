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
    let dataValues = [cityName, `${temp}°C`, `${wind} MPH`, `${humidity}%`, 'uvIndex']
    
    placeHolderForData.forEach((item, index) => {
        if (item !== null) {
            item.textContent = dataValues[index];
        }
    })
    let currDayBg = document.querySelector('#currDay-dash')
    currDayBg.style.backgroundImage = `url('http://openweathermap.org/img/wn/${icon}@2x.png')`;
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
            
            let fiveDayInsertLength = fiveDayInsertContainer.children.length;
            if (fiveDayInsertLength <= 5) {
                let fiveDayForecastEl = createFutureDayEl(itemDate, itemIcon, iconDescrip, itemTemp, itemWind, itemHumidity);
                fiveDayInsertContainer.append(fiveDayForecastEl);
            }
           
            currentDate = reformattedCurrentDay;
        }
    })
    

}

let globalStoreKey = 'testssss'

const getCityWeatherData = async (cityShortcut) => {
    /** receive search value from toggle */
    let searchVal = document.getElementById('city-search-value');

    let inputVal = typeof(cityShortcut) === 'string' ? cityShortcut : searchVal.value;
    let currWeather = (await getCurrentWeather(inputVal));
    let mainContent = currWeather.main;
    let temp = Math.round(parseInt(mainContent.temp) - 273);
    let humidity = mainContent.humidity;
    let wind = currWeather.wind.speed;
    let uvValue = '';

    let searchedCity = `${currWeather.name}, ${currWeather.sys.country}`;
    let currentWeatherIcon = currWeather.weather[0].icon;
    setCurrDayDashboard(searchedCity, temp, wind, humidity, uvValue, currentWeatherIcon);

    
    let fiveDay = await getFiveDayForecast(inputVal);
    let fiveDayInsertContainer = document.getElementById('five-day-forecast');
    setFiveDayDashboard(fiveDay.list);


    saveCityToLocalStorage(inputVal);
}

const loadPastSearches = () => {
    let pastSearchedCities = localStorage.getItem(globalStoreKey);
    let tempArr = JSON.parse(pastSearchedCities);
    console.log(tempArr);
    let shortcutsContainer = document.getElementById('search-history');
    tempArr.forEach(city => {
        let shortcutBtn = document.createElement('button')
        shortcutBtn.setAttribute('class', 'shortcut-btn');
        shortcutBtn.setAttribute('value', city);
        shortcutBtn.textContent = city;
        shortcutsContainer.append(shortcutBtn);
    })
}

let currentlySavedCities = localStorage.getItem(globalStoreKey);
if (currentlySavedCities !== undefined && currentlySavedCities !== 'undefined' && currentlySavedCities !== null) {
    loadPastSearches();
}

const saveCityToLocalStorage = (savedCity) => {
    let currentlySavedCities = localStorage.getItem(globalStoreKey);
    if (currentlySavedCities === undefined || currentlySavedCities === 'undefined' || currentlySavedCities === null) {
        let allSavedCities = [];
        allSavedCities.push(savedCity);
        allSavedCities = JSON.stringify(allSavedCities);
        localStorage.setItem(globalStoreKey, allSavedCities);

    } else {
        let previouslySavedStr = localStorage.getItem(globalStoreKey);
        let tempCitiesArr = JSON.parse(previouslySavedStr);

        let alreadySearched = tempCitiesArr.filter(city => city === savedCity);
        
        if (alreadySearched.length === 0) {
            tempCitiesArr.push(savedCity);
            let citiesStr = JSON.stringify(tempCitiesArr)
            localStorage.setItem(globalStoreKey, citiesStr);

            let newShortcutBtn = document.createElement('button');
            newShortcutBtn.setAttribute('class', 'shortcut-btn');
            newShortcutBtn.textContent = savedCity.slice(0, 1).toUpperCase() + savedCity.slice(1, savedCity.length);
            let shortcutsContainer = document.getElementById('search-history');
            shortcutsContainer.append(newShortcutBtn);
        } 
    }
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
    daysTemp.textContent = `Temperature: ${temp}°C`;
    daysWind.textContent = `Wind: ${wind} MPH`;
    daysHumidity.textContent = `Humidity: ${humidity}%`;
    
    dayForecastContainer.append(dateTitle, weatherIcon, daysTemp, daysWind, daysHumidity);
    return dayForecastContainer;
}


let searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', getCityWeatherData)


// add event listener to shortcut buttons clicked;

let shortcutsContainer = document.getElementById('search-history');
shortcutsContainer.addEventListener('click', (e) => {
    let btnValue = e.target.value;

    if (btnValue) {
        getCityWeatherData(btnValue)
    }
})
