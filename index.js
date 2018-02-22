var marketIDs = [];
var marketIDsIndex = -1;
var markets = [];
var displayIndex = -1;
var selectedProducts = [];
var bannerImageDiv;
var bannerTextDiv;
var searchDiv;
var marketListDiv;
var zip;

const MY_EDAMAM_APP_ID = "2fa4c48e";
const MY_EDAMAM_APP_KEY = "5f32aeea8e822b1fcf09a139329c7216";
const MARKET_SEARCH_URL = "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/";
const RECIPE_SEARCH_URL = "https://api.edamam.com/";
const EDAMAM_ID_STR = `&app_id=${MY_EDAMAM_APP_ID}&app_key=${MY_EDAMAM_APP_KEY}&from=0&to=30`;
const USDA_ATTRITION = `This product uses USDA’s National Farmers Market API but is not endorsed or certified by USDA.`
const EDAMAM_ATTRITION = `<div id="edamam-badge" data-color="white" hidden></div>`;

function showMarketIDs(){
   for (let i=0; i<marketIDs.length; i++) {
    console.log("Item number " + i + ":");
    console.log("id: " + marketIDs[i].id);
    console.log("name: " + marketIDs[i].name);
    console.log("distance: " + marketIDs[i].distance);
   }
}

function showMarket(index){
    console.log("Item number " + index + ":");
    console.log("ID: " + markets[index].id);
    console.log("name: " + markets[index].name);
    console.log("street: " + markets[index].street);
    console.log("cityState: " + markets[index].cityState);
    console.log("googleLink: " + markets[index].googleLink);
    console.log("facebookLink: " + markets[index].facebookLink);
    console.log("hours: " + markets[index].hours);
    console.log("products: ");
    var items = markets[index].products;
    for (let i=0; i<items.length; i++) {
      console.log(items[i]);
    }
}

// Disable the search button
function disableButton(){
    console.log("Entering disableButton...");

  $('.search-button').attr("disabled","disabled");
  $('.search-button').addClass("disabled-button");
  $('.js-text').on("keypress", allowSearch );
}


/*
function displayEDAMAMSearchData(){
  console.log("Entering displayEDAMAMSearchData...");
}

// Get Recipes from Edamam API
function getDataFromEdamamApi() {
  console.log("Entering getDataFromEdamamApi...");
  const zipUrl = RECIPE_SEARCH_URL + "search?q=" + localStorage.getItem("theIngredient") + EDAMAM_ID_STR;
  console.log(`the url is: ${zipUrl}`);
  $.ajax ({
    type : "GET",
    contentType : "application/json; charset=utf-8",
    url : zipUrl,
    dataType : 'jsonp',
    jsonpCallback : 'displayEDAMAMSearchData'
  });
}

// Add Callback for the Recipe Page
function addRecipeSubmitCB(){
      console.log("Entering addRecipeSubmitCB...");
  $('.recipes').submit(event => {
      console.log("Entering anonymous addRecipeSubmitCB...");
      event.preventDefault();
      event.stopPropagation();

      // get data to pass in to search
      var searchStr = $(this).next().next().val();
      console.log(`search string is: ${searchStr}`);

      // get search data
      localStorage.setItem("theIngredient", searchStr);
  })
} */


function removeMainPage(){
  console.log("Entering removeMainPage...");

  // save off the current page to add on later
  bannerImageDiv = $('.js-banner').detach();
  bannerTextDiv = $('.js-banner-text').detach();
  searchDiv = $('#js-search').detach();
  marketListDiv = $('#js-list').detach();
}


function insertMainPage(){
  console.log("Entering insertMainPage...");

  // save off the current page to add on later
  $('body').prepend(bannerTextDiv);
  $('body').prepend(bannerImageDiv);
  $('main').prepend(marketListDiv);
  $('main').prepend(searchDiv);
}


// When a specific market is selected, display its data
function displayMarketInfo(event){
  console.log("Entering displayMarketInfo...");

  // remove the divs from main
  removeMainPage();

  // display this markets data
  var marketHTML = `
    <div class="row nav-bar" role="navigation">
      <nav class="top-nav" role="navigation">
        <p><a href="" class="nav-link">Home</a></p>
      </nav>
    </div>
    <div class="row" role="banner">
      <div class="col-12 js-main-header">
        <h1 class="js-name">${event.data.name}</h1>
      </div>
    </div>
    <div>
      <div class="row js-address-hours">
        <div class="col-6 js-address">
          <h2>Address Info</h2>
          <h3 class="js-addr">${event.data.street}</h3>
          <h3 class="js-addr2">${event.data.cityState}</h3>
        </div>
        <div class="col-6 js-hours">
          <h2>Links and Schedule</h2>
          <h3><a class="js-google" target="_blank" href="${event.data.googleLink}">Google Link</a></h3>
          <h3><a class="js-fb" target="_blank" href="${event.data.facebookLink}">Facebook Link</a></h3>
        </div>
      </div> 
      <div class="row products">
        <p>These are the products available at this market...</p>
        <div class="col-3 p-column1"></div>
        <div class="col-3 p-column2"></div>
        <div class="col-3 p-column3"></div>
        <div class="col-3 p-column4"></div>
      </div> 
    </div>
  `;
  $('#js-market').prop('hidden',false).html(marketHTML);

  // add in the hours
  console.log("Here's all data hours: " + event.data.hours)
  console.log("Here's all data hours length: " + event.data.hours.length)
  if (event.data.hours.length > 0 && event.data.hours[0].length != 0) {
    for (let i=0; i<event.data.hours.length; i++){
      console.log("Here's the hours: " + event.data.hours[i]);
      if (event.data.hours[i].length > 0 && !event.data.hours[i].includes('<br> <br>')) {
        $(".js-hours").append(`<h3 class="js-schedule">${event.data.hours[i]}</h3>`);
      }
    }

    // no hours to add
  } else {
      $(".js-hours").append(`<h3 class="js-schedule">This market has no schedule listed</h3>`);
  }

  // add products
  if (event.data.products.length > 0 && event.data.products[0].length != 0) {
    for (let i=0; i<event.data.products.length; i++){
      var card = `<div><p class="js-fm-text js-cards-product">${event.data.products[i]}</p></div>`;
      var col = "";

      if (i % 4 === 0) {
         col = ".p-column1";
       } else if (i % 4 === 1) {
         col = ".p-column2";
       } else if (i % 4 === 2) {
         col = ".p-column3";
       } else if (i % 4 === 3) {
         col = ".p-column4";
       }
      $(col).append(card);
    }

    // no products to add
  } else {
      $(".p-column1").append(`<div><p class="js-fm-text js-cards-product">This market has no products listed</p></div>`);
  }

  $('.nav-link').on("click",event => {
    event.preventDefault();
    event.stopPropagation();

    $('#js-market').prop('hidden',true).empty();
    insertMainPage();

  });

}



// Add all data to the markets list
var setUSDADetailData = function(detailResults){
  console.log("Entering setUSDADetailData...");

  marketIDsIndex += 1;  

  // get the details on this market and save it off in the markets array.
  for (var key in detailResults) {
    var idResults = detailResults[key];

    // save the data
    var market = new Object();
    market.id = marketIDs[marketIDsIndex].id;
    market.name = marketIDs[marketIDsIndex].name;
    market.distance = marketIDs[marketIDsIndex].distance;
    market.street = idResults.Address.slice(0,idResults.Address.indexOf(','));
    market.cityState = idResults.Address.slice(idResults.Address.indexOf(',')+2, idResults.Address.length);
    market.googleLink = idResults.GoogleLink;
    market.facebookLink = "https:\/\/facebook.com\/search\/top\/?q=" + market.name;
    market.hours = idResults.Schedule.split(';');
    market.products = idResults.Products.split(';');;
  }
  markets.push(market);

  // display the market if it contains the
  // selected products

  // compare with each selected product
  var keep = false;
  if (selectedProducts.length > 0 && market.products.length > 0){

    for ( prod in selectedProducts ) {

      if (market.products.length > 0) {
        var answer = market.products.join().includes(selectedProducts[prod]);
        if ( answer ) {
          keep = true;
        }
      }
    }

  // if no products are selected just show all the markets
  } else if (selectedProducts.length == 0) {
    keep = true;
  } 

  if ( keep == true ) {
    displayIndex += 1;
    var idStr = "card" + displayIndex;
    var card = `
            <div class="${idStr} js-cards">
            <p class="js-fm-text js-cards-name">${marketIDs[marketIDsIndex].name}<p>
            <p class="the-id" hidden>${marketIDs[marketIDsIndex].id}</p>
            <p class="js-fm-text js-cards-dist">(${marketIDs[marketIDsIndex].distance} miles)</p>
            </div>
            `;
    var col = "";
    if (displayIndex % 4 === 0) {
       col = ".column1";
     } else if (displayIndex % 4 === 1) {
       col = ".column2";
     } else if (displayIndex % 4 === 2) {
       col = ".column3";
     } else if (displayIndex % 4 === 3) {
       col = ".column4";
     }
    $(col).append(card);

     // add the callback for selected markets
     var element = "." + idStr;
     $(col).on("click", element, market, event => {

       event.preventDefault();
       event.stopPropagation();

       displayMarketInfo(event);

   } );

  }

  // all markets in list have been run. If none are displayed,
  // provide a statement and position the page.
  console.log("marketIDsIndex is: " + marketIDsIndex);
  console.log("marketIDs.length is: " + marketIDs.length);
  if ( marketIDsIndex == marketIDs.length-1 ) {

    // if no markets were found, add some text explaining this
    if (displayIndex > 0) {
      $(".js-title").prepend(`<u><b class="js-list-title">Results for Zip ${zip}: Select a Location for More Information.</b></u>
                                                     (*distances are from zipcode center)`);
      $(".CardBoxes").show();
    } else {
      $(".js-title").prepend(`<u><b class="js-list-title">Sorry, no markets found for this zip code and filter.</b></u>`);
      $(".CardBoxes").hide();
    }

    // moves the scrollbar to show the list has been added.
    var fmList = document.getElementById("js-list");
    fmList.scrollIntoView();
  }
}


// Get Selected Farmers Market Data from the USDA
function getDetailsFromUSDAApi(theID) {
  console.log("Entering getDetailsFromUSDAApi...");
  const detailUrl = MARKET_SEARCH_URL + "mktDetail?id=" + theID;
  console.log("detail url is: " + detailUrl);
    $.when($.ajax({
        type : "GET",
        contentType : "application/json; charset=utf-8",
        // submit a get request to the restful service mktDetail.
        url : detailUrl,
        dataType : 'jsonp'})).then(setUSDADetailData);
  //      jsonpCallback : 'setUSDADetailData'
 //   });
}


// Display Farmers Market List
function displayUSDASearchData(searchResults) {
  console.log("Entering displayUSDASearchData...");
  var isError = false;

  // remove any previous list
  $("#js-list").empty();

  // and create the html framework
  var resultsHTML = `
    <div class="row">
      <div class="col-12 js-title">
        <div class="row CardBoxes">
          <div class="col-3"><div class="column1"></div></div>
          <div class="col-3"><div class="column2"></div></div>
          <div class="col-3"><div class="column3"></div></div>
          <div class="col-3"><div class="column4"></div></div>
        </div>
      </div>
    </div>
    <div class="js-footer"><span>${USDA_ATTRITION} (An Application Program Interface (API) 
    is a set of routines, protocols, and tools for building software applications.)</span></div>
   `;

  // and put it out in the DOM
  $('#js-list').prop('hidden',false).html(resultsHTML);

  // get the search results
  var results = [];
  var filteredResults = [];

  for (var key in searchResults) {
    results = searchResults[key];

    if (results[0].id.match(/error/gi) != null) {
      displayError();
      isError = true;
      break;

    } else  {

      // for every market, need to get the details so
      // the market list can be filtered by products
      // that are available at each market
      for (let i = 0; i < results.length; i++) {
        var marketName = results[i].marketname.split(" ");
        var market = new Object();

        market.id = results[i].id;

        // order dependent - shift off the distance
        // and you're left with the name
        market.distance = marketName.shift();
        market.name = marketName.join(" ");

        marketIDs.push(market);

        getDetailsFromUSDAApi(market.id);
      }

    }
  }

}


// Get Farmers Market List from USDA
function getDataFromUSDAApi(searchTerm) {
  console.log("Entering getDataFromUSDAApi...");
  const zipUrl = MARKET_SEARCH_URL + "zipSearch?zip=" + searchTerm;
  console.log("zip url is: " + zipUrl);
  $.ajax ({
    type : "GET",
    contentType : "application/json; charset=utf-8",
    url : zipUrl,
    dataType : 'jsonp',
    jsonpCallback : 'displayUSDASearchData'
  });
}


function displayError(){
  console.log("Entering displayError...");
  $("#zipcode").addClass("js-error");
  $("fieldset").append(`<p class="js-err-msg">Invalid Zipcode</p>`);

  $("#zipcode").on("focus", event => {
    $(".js-err-msg").remove();
  });
}


// Reset the page variables and html
function initializeMarkets() {
  console.log("Entering initializeMarkets...");

  // remove children from these divs
  $('#js-list').prop('hidden',true).empty();
  $('#js-market').prop('hidden',true).empty();

  // reset the market lists
  marketIDs = [];
  marketIDsIndex = -1;
  markets = [];
  displayIndex = -1;
  selectedProducts = [];  
}


// Add the callback for the search button
function addMarketListCB(){
    console.log("Entering addMarketListCB...");
  $('.search-button').on("click", event => {
    event.preventDefault();

    // clear all page-scoped variables
    initializeMarkets();

    // get the search data from the zipcode field
    zip = $('#zipcode').val();

    // if the data is valid, call the api
    if (zip.length == 5) {

      // retrieve the list of selected products, if any
      $("[type='checkbox']:checked").each(function(index){
          selectedProducts.push($(this).next().text());
      });

      console.log("selectedProducts: " + selectedProducts);
      console.log("size is: " + selectedProducts.length);

      console.log("zipcode is: " + zip);
      getDataFromUSDAApi(zip);

    } else {
      displayError();
    }
  });    
}


// Enable the search button to allow searches.
function allowSearch(){
    console.log("Entering allowSearch...");

    $('.search-button').removeAttr("disabled");
    $('.search-button').removeClass("disabled-button");
    $('.js-text').off("keypress");
    addMarketListCB();
}


function main() {
  console.log(`Entering main...`);  
  $('.js-text').on("keypress", allowSearch );
}

$(main);

