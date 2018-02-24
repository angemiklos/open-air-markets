
// First API call market information
let marketIDs = [];
let marketIDsIndex = -1;

// Subsequent API calls per market
let markets = [];

// Index incremented for a count
// of displayable markets based
// on filter and zipcode settings
let displayIndex = -1;

// List of products for filtering
let selectedProducts = [];

// Home page document elements for 
// detaching and adding later
let bannerImageDiv;
let bannerTextDiv;
let searchDiv;
let marketListDiv;

// The entered zipcode
let zip;

// Constants for API usage
const MARKET_SEARCH_URL = "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/";
const USDA_ATTRITION = `This product uses USDA’s National Farmers Market API but is not endorsed
                        or certified by USDA.`


// Disable the search button
function disableButton(){
  $('.search-button').attr("disabled","disabled");
  $('.search-button').addClass("disabled-button");
  $('.js-text').on("keypress", allowSearch);
}


// Save off the current page to add on later
function removeMainPage(){
  bannerImageDiv = $('.js-banner').detach();
  bannerTextDiv = $('.js-banner-text').detach();
  searchDiv = $('#js-search').detach();
  marketListDiv = $('#js-list').detach();
}


// Insert the saved off home page elements
function insertMainPage(){
  $('body').prepend(bannerTextDiv);
  $('body').prepend(bannerImageDiv);
  $('main').prepend(marketListDiv);
  $('main').prepend(searchDiv);
}


// When a specific market is selected, display its data
function displayMarketInfo(event){
  removeMainPage();

  // display this markets data
  let marketHTML = `
    <div class="row nav-bar" role="navigation">
      <nav class="top-nav" role="navigation">
        <p><a href="" class="nav-link">Home</a></p>
      </nav>
    </div>
    <div class="row" role="banner">
      <div class="col-12 js-main-header">
        <h1>${event.data.name}</h1>
      </div>
    </div>
    <div>
      <div class="row">
        <div class="col-6">
          <h2>Address Info</h2>
          <h3>${event.data.street}</h3>
          <h3>${event.data.cityState}</h3>
        </div>
        <div class="col-6">
          <h2>Links and Schedule</h2>
          <h3><a target="_blank" href="${event.data.googleLink}">Google Link</a></h3>
          <h3><a target="_blank" href="${event.data.facebookLink}">Facebook Link</a></h3>
        </div>
      </div> 
      <div class="row">
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
  if (event.data.hours.length > 0 && event.data.hours[0].length != 0) {
    for (let i = 0; i < event.data.hours.length; i++){
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
    for (let i = 0; i < event.data.products.length; i++){
      let card = `<div><p class="js-fm-text js-cards-product">
                  ${event.data.products[i]}</p></div>`;
      let col = "";

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
      $(".p-column1").append(`<div><p class="js-fm-text js-cards-product">
                              This market has no products listed</p></div>`);
  }

  // add the callback for the HOME button
  $('.nav-link').on("click",event => {
    event.preventDefault();
    event.stopPropagation();

    $('#js-market').prop('hidden',true).empty();
    insertMainPage();

  });
}

// Display the market card if it matches the search criteria
function displayMarketCard(market) {
  let keep = false;
  if (selectedProducts.length > 0 && market.products.length > 0){

    for (prod in selectedProducts) {

      if (market.products.length > 0) {
        keep = market.products.join().includes(selectedProducts[prod]);
        if (keep) {
          break;
        }
      }
    }

  // if no products are selected just show all the markets
  } else if (selectedProducts.length == 0) {
    keep = true;
  } 

  // add the markets if they match the criteria, to the columns evenly
  if (keep == true) {
    displayIndex += 1;
    let idStr = "card" + displayIndex;
    let card = `
            <div class="${idStr} js-cards">
            <p class="js-fm-text js-cards-name">${marketIDs[marketIDsIndex].name}<p>
            <p class="js-fm-text js-cards-dist">(${marketIDs[marketIDsIndex].distance} miles)</p>
            </div>
            `;
    let col = "";
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

    // add the callback for displayed market
    let element = "." + idStr;

    $(col).on("click", element, market, event => {

      event.preventDefault();
      event.stopPropagation();

      displayMarketInfo(event);
   });

  }
}


/** Complete the page by prepending a title to the market cards
 * and scrolling them into view
 */
function positionDisplay() {
  if (displayIndex > 0) {
    $(".js-title").prepend(`<b class="js-list-title">Results for Zip ${zip}: Select a 
                            Location for More Information.</b> (*distances are from 
                            zipcode center)`);
    $(".CardBoxes").show();
  } else {
    $(".js-title").prepend(`<u><b class="js-list-title">Sorry, no markets found for this
                            zip code and filter.</b></u>`);
    $(".CardBoxes").hide();
  }

  // moves the scrollbar to show the list has been added.
  document.getElementById("js-list").scrollIntoView();
}


// Save detail data and display market card if it matches the search criteria
var setUSDADetailData = function(detailResults) {
  marketIDsIndex += 1;  

  // get the details on this market and save it off in the markets array.
  for (let key in detailResults) {
    let idResults = detailResults[key];

    // save the data
    var market = new Object();
    market.id           = marketIDs[marketIDsIndex].id;
    market.name         = marketIDs[marketIDsIndex].name;
    market.distance     = marketIDs[marketIDsIndex].distance;
    market.street       = idResults.Address.slice(0,idResults.Address.indexOf(','));
    market.cityState    = idResults.Address.slice(idResults.Address.indexOf(',') + 2, 
                          idResults.Address.length);
    market.googleLink   = idResults.GoogleLink;
    market.facebookLink = "https:\/\/facebook.com\/search\/top\/?q=" + market.name;
    market.hours        = idResults.Schedule.split(';');
    market.products     = idResults.Products.split(';');;
  }
  markets.push(market);

  // display the market if it contains the selected products
  displayMarketCard(market);

  /**
   * all markets from search criteria have returned. Position the page
   * to the newly displayed market cards. If there are no markets, 
   * provide a statement instead.
   */
  if (marketIDsIndex == marketIDs.length - 1) {
    positionDisplay();
  }
}


// Get Selected Farmers Market Data from the USDA
function getDetailsFromUSDAApi(theID) {

  const detailUrl = MARKET_SEARCH_URL + "mktDetail?id=" + theID;

  $.when($.ajax({
      type        : "GET",
      contentType : "application/json; charset=utf-8",
      url         : detailUrl,
      dataType    : 'jsonp'})).then(setUSDADetailData);
}


// Display Farmers Market List
function displayUSDASearchData(searchResults) {
  let isError = false;

  // remove any previous list
  $("#js-list").empty();

  // and create the html framework
  let resultsHTML = `
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
    <div class="js-footer" role="contentinfo"><span>${USDA_ATTRITION} (An Application 
    Program Interface (API) is a set of routines, protocols, and tools for building 
    software applications.)</span></div>
   `;

  $('#js-list').prop('hidden',false).html(resultsHTML);

  // get the search results
  let results = [];
  let filteredResults = [];

  for (let key in searchResults) {
    results = searchResults[key];

    if (results[0].id.match(/error/gi) != null) {
      displayError();
      isError = true;
      break;

    } else  {

      /**
       * for every market returned in the API call, 
       * make an API call using the market ID to
       * retrieve the details so the market list 
       * can be filtered by products that are
       * available at each market
       */
      for (let i = 0; i < results.length; i++) {
        let marketName = results[i].marketname.split(" ");
        var market = new Object();

        // the distance is in the first part of the name string
        market.id = results[i].id;
        market.distance = marketName.shift();
        market.name = marketName.join(" ");

        // save off the ID, distance and name
        marketIDs.push(market);

        // call the API to get the rest of the info on this market
        getDetailsFromUSDAApi(market.id);
      } // for loop to get detailed API data

    } // else no error in the results
  } // for loop to get general API data

}


// Get Farmers Market List from USDA
function getDataFromUSDAApi(searchTerm) {

  const zipUrl = MARKET_SEARCH_URL + "zipSearch?zip=" + searchTerm;

  $.ajax ({
    type          : "GET",
    contentType   : "application/json; charset=utf-8",
    url           : zipUrl,
    dataType      : 'jsonp',
    jsonpCallback : 'displayUSDASearchData'
  });
}

// Display an error to the user on invalid zipcode
function displayError(){

  $("#zipcode").addClass("js-error");
  $("fieldset").append(`<p class="js-err-msg">Invalid Zipcode</p>`);

  // remove error when the user focuses on zipcode again
  $("#zipcode").on("focus", event => {
    $(".js-err-msg").remove();
    $("#zipcode").removeClass("js-error");
  });
}


// Reset the page variables and html
function initializeMarkets() {

  // remove children from these divs
  $('#js-list').prop('hidden',true).empty();
  $('#js-market').prop('hidden',true).empty();

  // reset the market lists
  for (let i = 0; i < marketIDs.length; i++) {
    delete marketIDs[i];
  }
  marketIDs = [];
  marketIDsIndex = -1;

  for (let i = 0; i < markets.length; i++) {
    delete markets[i];
  }
  markets = [];
  displayIndex = -1;
  selectedProducts = [];  
}


// Add the callback for the search button
function addMarketListCB(){

  $('.search-button').on("click", event => {
    event.preventDefault();

    // clear all page-scoped variables
    initializeMarkets();

    // if previous entry was invalid, remove text and class
    $(".js-err-msg").remove();
    $("#zipcode").removeClass("js-error");

    // get the search data from the zipcode field
    zip = $('#zipcode').val();

    // if the data is valid, call the API
    if (zip.length == 5) {

      // store the list of selected products for later
      $("[type='checkbox']:checked").each(function(index){
          selectedProducts.push($(this).next().text());
      });

      getDataFromUSDAApi(zip);

    // invalid data - display an error
    } else {
      displayError();
    }
  });    
}


// Enable the search button for searches.
function allowSearch() {

  $('.search-button').removeAttr("disabled");
  $('.search-button').removeClass("disabled-button");
  $('.js-text').off("keypress");
  addMarketListCB();
}


function main() {
  $('.js-text').on("keypress", allowSearch); 
}


$(main);