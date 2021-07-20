// open weather api
var apiUrl = 'https://api.openweathermap.org/data/2.5/';
// Open Weather Map API key
var apiKey = '680f43caa98a6134eba0e8724c961773';

function searchCity (event) {
  event.preventDefault ();

  var cityInput = $ ('#searchcity').val ();
  //stop if input field is empty on submit
  if (cityInput === '') {
    return;
  }

  //itiial city search - populate the search input box and add to city history list
  searchWeather (cityInput);
  //get weather from a city in your stored list
  populateSearchHistory (cityInput);
  //clear input field
  $ ('#searchcity').val ('');
}

// function to fetch current weather of city from current weather data api on openweathermap.
function searchWeather (city) {
  // "https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={your api key}"
  var searchQueryURL =
    apiUrl + 'weather?q=' + city + '&units=imperial' + '&appid=' + apiKey;

  // Seach Current Weather
  fetch (searchQueryURL).then (response => response.json ()).then (response => {
    // Log the queryURL
    // console.log("Search Query URL : "+searchQueryURL);

    var tempF = response.main.temp;

    var currentDate = new Date ().toLocaleDateString ();

    var latitude = response.coord.lat;
    var longitude = response.coord.lon;

    var uvQueryURL =
      apiUrl + 'uvi?lat=' + latitude + '&lon=' + longitude + '&appid=' + apiKey;

    var forecastQueryURL = //Temperature is available in Fahrenheit, Celsius and Kelvin units.For temperature in Fahrenheit use units=imperial
      apiUrl + 'forecast?q=' + city + '&units=imperial&appid=' + apiKey;

    $ ('#city-card').show ();
    //shift - option - 8 °
    $ ('#temperature').text ('Current Temp: ' + tempF.toFixed (0) + ' °F');
    $ ('#humidity').text ('Humidity: ' + response.main.humidity + '%');
    $ ('#windspeed').text ('Wind Speed: ' + response.wind.speed + ' MPH');

    var iconAdd = $ ('<img>').attr (
      'src',
      'https://openweathermap.org/img/wn/' +
        response.weather[0].icon.toString () +
        '@2x.png'
    );

    $ ('#city-name')
      .text (response.name + ' ' + currentDate + ' ')
      .append (iconAdd);

    getuvIndex (uvQueryURL);

    showForecast (forecastQueryURL);
  });
}

//function to get UV index
function getuvIndex (uvQueryURL) {
  fetch (uvQueryURL)
    .then (response => response.json ())
    .then (function (uvDisplay) {
      var uvValue = uvDisplay.value;
      //add uv index button which is styled based on the uv level received from response
      var btnUV = $ ('<button>').attr ('type', 'button').text (uvValue);
      //set the parameters to identify how to style the button
      if (uvValue >= 0 && uvValue <= 3) {
        //low : green
        $ ('#uvIndex').text ('UV: Low ').append (btnUV);
        btnUV.addClass ('btn bg-info');
      } else if (uvValue >= 3 && uvValue <= 6) {
        //moderate : yellow
        $ ('#uvIndex').text ('UV: Moderate ').append (btnUV);
        btnUV.addClass ('btn btn-success');
      } else if (uvValue >= 6 && uvValue <= 8) {
        //high : orange
        $ ('#uvIndex').text ('UV: High ').append (btnUV);
        btnUV.addClass ('btn btn-warning');
      } else if (uvValue >= 8 && uvValue <= 10) {
        //very high : red
        $ ('#uvIndex').text ('UV: Very high ').append (btnUV);
        btnUV.addClass ('btn bg-danger');
      } else if (uvValue >= 10) {
        //extreme : violet
        $ ('#uvIndex').text ('UV: Extreme ').append (btnUV);
        btnUV.addClass ('btn btnRed');
      }
    });
}

//function to show 5 days forecast
function showForecast (forecastQueryURL) {
  var temp, humidity, wind, icon;

  $ ('#forecast5Day').show ();

  fetch (forecastQueryURL)
    .then (response => response.json ())
    .then (function (forecastResponse) {
      $ ('#forecast').empty ();

      var list = forecastResponse.list;
      /* 
because there's array with 40 objects, with 5 days, 5*8=40
5=days
this is gives every day - thank you stack overflow */
      for (var i = 0; i < list.length; i += 8) {
        var date = list[i].dt_txt.split (' ')[0];
        var dateArr = date.split ('-');

        //for each day of the forecast we get an array with dates
        //convert date into readable format - instead of "2021", "07", "24"
        var dateForecast = dateArr[1] + '/' + dateArr[2] + '/' + dateArr[0];
        var time = list[i].dt_txt.split (' ')[1];
        {
          temp = list[i].main.temp;
          humidity = list[i].main.humidity;
          wind = list[i].wind.speed;
          icon = list[i].weather[0].icon;

          //apply this styling to the date
          var fDate = $ ('<h5>').addClass ('card-text').text (dateForecast);

          var card = $ ('<div>').addClass ('card ');
          var cardBody = $ ('<div>').addClass ('card-body');

          // list of weather icons https://openweathermap.org/img/wn/10d.png
          var iconPng = $ ('<img>')
            .attr (
              'src',
              'http://openweathermap.org/img/wn/' + icon + '@2x.png'
            )
            .addClass ('mx-auto d-block');

          var tempP = $ ('<p>')
            .addClass ('card-text')
            .text ('Temp: ' + temp.toFixed (0) + ' °F');

          var humidityP = $ ('<p>')
            .addClass ('card-text')
            .text ('Humidity: ' + humidity + '% ');

          var windP = $ ('<p>')
            .addClass ('card-text')
            .text ('Wind: ' + wind + ' MPH');

          cardBody.append (fDate, iconPng, tempP, humidityP, windP);
          card.append (cardBody);

          $ ('#forecast').append (card);
        }
      }
    });
}

// function to store and populate city search history
function populateSearchHistory (city) {
  var history = JSON.parse (localStorage.getItem ('history'));
  var listitem;

  // If exists
  if (history) {
    for (var i = 0; i < history.length; i++) {
      //if this city already exists in the list, don't create another one
      if (history[i] === city) {
        return;
      }
    }
    //unshift adds new city to the beginning of the list
    history.unshift (city);
    listitem = $ ('<li>').addClass ('list-group-item cityPrev').text (city);
    $ ('#cityHistory').prepend (listitem);
  } else {
    history = [city];

    listitem = $ ('<li>').addClass ('list-group-item cityPrev').text (city);
    $ ('#cityHistory').append (listitem);
  }
  //add to localstorage
  localStorage.setItem ('history', JSON.stringify (history));
}

// adding function to the cities in the list to reload the weather for that city if clicked
$ ('#cityHistory').on ('click', 'li', function (event) {
  var showCity = $ (this).text ();

  searchWeather (showCity);
});

// Execute script when html is fully loaded
$ (document).ready (function () {
  $ ('#searchButton').on ('click', searchCity);

  var history = JSON.parse (localStorage.getItem ('history'));

  // if search history exists in local storage
  if (history) {
    var lastSearchedCity = history[0]; //takes last searched city from localstorage
    searchWeather (lastSearchedCity); //loads last searched city's weather
    //console.log(lastSearchedCity);
    for (var i = 0; i < history.length; i++) {
      var listitem = $ ('<li>')
        .addClass ('list-group-item cityPrev')
        .text (history[i]); //populate search history in local storage to html page when page loads
      $ ('#cityHistory').append (listitem);
    }
    //if no data to show, hide the elements on the right
  } else {
    $ ('#city-card').hide ();
    $ ('#forecast5Day').hide ();
  }
});
