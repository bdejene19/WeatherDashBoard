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

/**
 * 
 * @param {string} searchedCity 
 * @returns current days weather data if the fetch response is ok. Otherwise, returns 'No location found'.
 */
const getCurrentWeather = async (searchedCity) => {
    let currentWeatherData = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${apiKey}`)).json().catch((e => { console.log('there was an error')}));

    if (currentWeatherData.cod !== '400') {
        return currentWeatherData;

    } else {
        return 'No City Found'
    }
} 

/**
 * 
 * @param {string} lat location latitude
 * @param {string} long location longitude
 * @returns UV-index of location searched
 */
const getUVIndex = async (lat, long) => {
    let res = await (await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude={part}&appid=${apiKey}`)).json().catch((e => { console.log('there was an error')}));
    return res.daily[0].uvi;
}

/**
 * 
 * @param {string} searchedCity City searched by user
 * @returns Five day forecast data if successful, otherwise, returns 'No location found'
 */
const getFiveDayForecast = async (searchedCity) => {
    let fiveDayData = await (await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&appid=${apiKey}`)).json();
    if (fiveDayData.cod !== '400') {
        return fiveDayData;
    } else {
        return 'No City Found'
    }
} 

/**
 * Targets elements within current day portion of weather dashboard, and updates values. Empty string by default.
 * @param {string} cityName Name of city
 * @param {string} temp Temperature
 * @param {string} wind Wind speed
 * @param {string} humidity Humidity
 * @param {string} uvVal UV-index value
 * @param {string} icon API generated icon, describing current weather conditions.
 * 
 * 
 */
const setCurrDayDashboard = (cityName, temp, wind, humidity, uvVal, icon) => {
    let cityNamePlaceHolder = document.getElementById('currently-displayed-city');
    let tempPlaceHolder = document.getElementById('curr-temp');
    let windPlaceHolder = document.getElementById('curr-wind');
    let humidityPlaceHolder = document.getElementById('curr-humidity');
    let uvPlaceHolder = document.getElementById('curr-UV');
    

    // map placeholder targeted HTML elements => update page with new data
    let placeHolderForData = [cityNamePlaceHolder, tempPlaceHolder, windPlaceHolder, humidityPlaceHolder, uvPlaceHolder];
    let dataValues = [cityName, `${temp}°C`, `${wind} MPH`, `${humidity}%`, uvVal]
    placeHolderForData.forEach((item, index) => {
        if (item !== null) {
            item.textContent = dataValues[index];
        } 
    })

    // Assigning UV-indicator color
    let bgColor = ''
    if (uvVal <= 2) {
        bgColor = 'lime';
    } else if (uvVal > 4 && uvVal < 8) {
        bgColor = 'orangered';
    } else {
        bgColor = 'red';
    }

    uvPlaceHolder.style.cssText = `background-color: ${bgColor}; border-radius: 5px; padding: 0.5em 1em; color: white;`;

    // set background-image of current day weather container to descriptive icon;
    let currDayBg = document.querySelector('#currDay-dash')
    currDayBg.style.backgroundImage = `url('https://openweathermap.org/img/wn/${icon}.png')`;
}


/**
 * Targets 5-day forecast portion of weather dashboard. Maps through API response and displays data to UI.
 * @param {[]} fiveDayList List of 5-day weather data, to be parsed, manipulated and displayed.
 */
const setFiveDayDashboard = (fiveDayList) => {
     /**
     * useful object properties on item
     * 
     * .dt_txt = date/time;
     * .main => .temp, .humidity
     * .wind => .speed
     */
    // target five-day-forecast container make visible and to later insert elements
    let fiveDayInsertContainer = document.getElementById('five-day-forecast');
    fiveDayInsertContainer.style.display = 'flex';

    // use moment.js to determine when new day has occured in 5-hour 5-day forecast. => prevents use of unnecessary data
    let currentDate = moment().format('DDD');
   
    // loop through api response => parse content and update UI only if day of the year is different ,
    fiveDayList.map(item => {
        let currentDay = item.dt_txt.split(' ');

        let nextDay = moment(currentDay[0]);
        let reformattedCurrentDay = moment(currentDay[0]).format('DDD');

        /** does moving inside if chanage anything?  */
        // let itemDate = null
        // let itemIcon = null;
        // let itemTemp = null;
        // let itemWind = null;
        // let itemHumidity = null;

        if (currentDate < reformattedCurrentDay) {

            let itemDate = null;
            let itemIcon = null;
            let itemTemp = null;
            let itemWind = null;
            let itemHumidity = null;

            itemDate = nextDay.format('DD/MM/YY')
            itemIcon = item.weather[0].icon;
            iconDescrip = item.weather[0].description;
            itemTemp = Math.round(item.main.temp - 273);
            itemWind = item.wind.speed;
            itemHumidity = item.main.humidity;
            

            // measure 5-day-forecast children length to update UI, rather than always appending 5 weather cards every search
            let fiveDayInsertLength = fiveDayInsertContainer.children.length;
            if (fiveDayInsertLength <= 5) {
                let fiveDayForecastEl = createFutureDayEl(itemDate, itemIcon, iconDescrip, itemTemp, itemWind, itemHumidity);
                fiveDayInsertContainer.append(fiveDayForecastEl);
            }
           
            // update current day of 5-day forecast
            currentDate = reformattedCurrentDay;
        }
    })
    

}

// reusable local storage key
let globalStoreKey = 'cities-saved'

/**
 * Asynchronous function retrieving current weather and 5-day-forecast data. Handles data parsing and presentation to UI on any button click in the application
 * @param {string || event} cityShortcut Optional parameter, used for click events to handle data fetching from shortcuts
 */
const getCityWeatherData = async (cityShortcut) => {
    /** receive search value from toggle */
    let searchVal = document.getElementById('city-search-value');

    // checks to see if optional parameter was passed => if not, uses user input search value to make API call
    let inputVal = typeof(cityShortcut) === 'string' ? cityShortcut : searchVal.value;


    let currWeather = (await getCurrentWeather(inputVal));
    // parse api response for necessary data 
    let mainContent = currWeather.main;
    let temp = Math.round(parseInt(mainContent.temp) - 273);
    let humidity = mainContent.humidity;
    let wind = currWeather.wind.speed;
    let uvValue = '';

    let searchedCity = `${currWeather.name}, ${currWeather.sys.country}`;
    let currentWeatherIcon = currWeather.weather[0].icon;

    let lat = currWeather.coord.lat;
    let long = currWeather.coord.lon;


    // helper function to get UV-index
    uvValue = await getUVIndex(lat, long);
    // generate current-day portion of dashboard
    setCurrDayDashboard(searchedCity, temp, wind, humidity, uvValue, currentWeatherIcon);

    // retrieve five-day forecast data and present it to UI;
    let fiveDay = await getFiveDayForecast(inputVal);
    setFiveDayDashboard(fiveDay.list);


    // save search to local storage;
    saveCityToLocalStorage(searchedCity);
}


/**
 * Retrieves data from local storage to display as short cut buttons on page load
 */
const loadPastSearches = () => {
    let pastSearchedCities = localStorage.getItem(globalStoreKey);
    let tempArr = JSON.parse(pastSearchedCities);
    let shortcutsContainer = document.getElementById('search-history');
    tempArr.forEach(city => {
        let shortcutBtn = document.createElement('button')
        shortcutBtn.setAttribute('class', 'shortcut-btn');
        shortcutBtn.setAttribute('value', city);
        shortcutBtn.textContent = city;
        shortcutsContainer.append(shortcutBtn);
    })
}

/**
 * checks to see if there is any local storage currently => if there is, short cut buttons will be created
 */
let currentlySavedCities = localStorage.getItem(globalStoreKey);
if (currentlySavedCities !== undefined && currentlySavedCities !== 'undefined' && currentlySavedCities !== null) {
    loadPastSearches();
}


/**
 * Generates local storage item if none exists. Otherwise, filters city name through local storage to prevent duplicates. Saved city then persists to local storage item.
 * @param {string} savedCity 
 */
const saveCityToLocalStorage = (savedCity) => {
    let currentlySavedCities = localStorage.getItem(globalStoreKey);
    if (currentlySavedCities === undefined || currentlySavedCities === 'undefined' || currentlySavedCities === null) {
        let allSavedCities = [];
        allSavedCities.push(savedCity);
        allSavedCities = JSON.stringify(allSavedCities);
        localStorage.setItem(globalStoreKey, allSavedCities);
        generateShortcutBtn(savedCity);

    } else {
        let previouslySavedStr = localStorage.getItem(globalStoreKey);
        let tempCitiesArr = JSON.parse(previouslySavedStr);

        let alreadySearched = tempCitiesArr.filter(city => city === savedCity);
        
        if (alreadySearched.length === 0) {
            tempCitiesArr.push(savedCity);
            let citiesStr = JSON.stringify(tempCitiesArr)
            localStorage.setItem(globalStoreKey, citiesStr);
            generateShortcutBtn(savedCity);
        } 

        
    }
 
}

/**
 * 
 * @param {string} shortcutName Value and title of created button element
 */
const generateShortcutBtn = (shortcutName) => {
    // create new button to act as short cut;
    let newShortcutBtn = document.createElement('button');
    newShortcutBtn.setAttribute('class', 'shortcut-btn');
    newShortcutBtn.setAttribute('value', shortcutName);

    // style text of bvutton and append to shortcuts contatiner
    newShortcutBtn.textContent = shortcutName.slice(0, 1).toUpperCase() + shortcutName.slice(1, shortcutName.length);
    let shortcutsContainer = document.getElementById('search-history');
    shortcutsContainer.append(newShortcutBtn);

}

/**
 * Generates HTML for displaying weather card data. Text content is set by parameters. Cards are then placed into the DOM
 * @param {string} date Date of described weather conditions
 * @param {string} icon Descriptive image of day's conditions
 * @param {string} describeIcon Alt tag for icon
 * @param {string} temp Day's temperature
 * @param {string} wind Day's wind speed
 * @param {string} humidity Day's humidity
 * @returns new HTML element acting as weather card, containing data recieved from API
 */
const createFutureDayEl = (date, icon, describeIcon, temp, wind, humidity) => {
    let dayForecastContainer = document.createElement('div');
    dayForecastContainer.setAttribute('class', 'single-5day-container');
    
    let dateTitle = document.createElement('h3');
    let weatherIcon = document.createElement('img');

    let daysTemp = document.createElement('p');
    let daysWind = document.createElement('p');
    let daysHumidity = document.createElement('p');


    dateTitle.textContent = date;
    weatherIcon.setAttribute('src', `https://openweathermap.org/img/wn/${icon}@2x.png`);
    weatherIcon.setAttribute('alt', `${describeIcon}`)
    daysTemp.textContent = `Temperature: ${temp}°C`;
    daysWind.textContent = `Wind: ${wind} MPH`;
    daysHumidity.textContent = `Humidity: ${humidity}%`;
    
    dayForecastContainer.append(dateTitle, weatherIcon, daysTemp, daysWind, daysHumidity);
    return dayForecastContainer;
}

// apply event listener to search button
let searchBtn = document.getElementById('search-btn');
searchBtn.addEventListener('click', getCityWeatherData)


// add event listener to shortcut buttons clicked;
// applied to container => therefore, validate click event using btnValue ==> btn value is our input for getCityWeatherData
let shortcutsContainer = document.getElementById('search-history');
shortcutsContainer.addEventListener('click', (e) => {
    let btnValue = e.target.value;

    if (btnValue) {
        getCityWeatherData(btnValue)
    }
})
