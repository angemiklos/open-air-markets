var homeHeader;
var homeFooter;
var homeForm;
var idResults;
var products = [
{ item : "Eggs", linkable : true},
{ item : "Fresh Fruit and Vegetables", linkable : true},
{ item : "Poultry", linkable : true},
{ item : "Meat", linkable : true},
{ item : "Prepared Foods", linkable : false},
{ item : "Cheese and/or Dairy Products", linkable : true},
{ item : "Baked Goods", linkable : true},
{ item : "Household Items", linkable : false},
{ item : "Soap and/or Body Care Items", linkable : false},
{ item : "Fresh and/or Dried Herbs", linkable : true},
{ item : "Honey", linkable : true},
{ item : "Crafts and/or Woodworking Items", linkable : false},
{ item : "Cut Flowers", linkable : false},
{ item : "Canned or Preserved", linkable : true},
{ item : "Maple Syrup and/or Products", linkable : true},
{ item : "Nuts", linkable : true},
{ item : "Plants in Containers", linkable : false},
{ item : "Trees, Shrubs", linkable : false}
];

const MARKET_SEARCH_URL = "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/";
const RECIPE_SEARCH_URL = "https://api.edamam.com/search";
const EDAMAM_ID = "&app_id=118e0e2d&app_key=c5eead045b6939e2524eb40298a3d91e&from=0&to=30"

function backToMain(){
    // add back in the home page elements.
    // Should not have to add the callback again.
    $(homeHeader).appendTo('main');
    $(homeForm).appendTo('main');
    $(homeFooter).appendTo('main');
    $(".js-main").addClass('js-background');
}

// Get Recipes from Edamam API
function getDataFromEdamamApi(searchTerm) {
  console.log("Entering getDataFromEdamamApi...");
  const zipUrl = RECIPE_SEARCH_URL + "search?q=" + searchTerm + EDAMAM_ID;
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

      // get data to pass in to search
      var searchStr = $(this).next().next().val;
      console.log(`search string is: ${searchStr}`);

      // get search data
      getDataFromEdamamApi(searchStr);
  })
}

// Helper function to add Products to Selected Farmers Market 
function addColumnItem(item, index, products){

  console.log("the index is: " + index);
  console.log("the product is: " + item.item);
  console.log("the product is linkable: " + item.linkable);
  var htmlString = "";

  // put about 6 items in each row
  if ((index === 6) || (index === 12)) {
    htmlString +=`</div>`;
    htmlString += `<div class="column col-light column-3">`;
    console.log("index is 6 or 12: " + htmlString);
  } 

  if ((products.search(item.item)) >= 0 ){

    // this is linkable and available
    if (item.linkable)  {
      htmlString += `<a href="./details.html"><i class="fa fa-check-square-o" style="font-size:24px;"><span>${item.item}</span></i></a><br>`;
      console.log("item is linkable and available: " + htmlString);

    // this is unlinkable and available
    } else {
      htmlString += `<i class="fa fa-check-square-o" style="font-size:24px"><span>${item.item}</span></i><br>`;
      console.log("item is unlinkable and available: " + htmlString);
    }
  }

  // this is unavailable
  else  {
    htmlString += `<i class="fa fa-times-rectangle" style="font-size:24px"><span>${item.item}</span></i><br>`;
    console.log("item is unavailable: " + htmlString);
  }

  return htmlString;
}

// Display Selected Farmers Market Details
function displayUSDADetailData(detailresults) {
  console.log("Entering displayUSDADetailData...");
  for (var key in detailresults) {
      console.log(`the key is: ${key}`);
      idResults = detailresults[key];
      console.log(`the address is: ${idResults.Address}`);

      // put the data on the page
      var streetAddress = idResults.Address.slice(0,idResults.Address.indexOf(','));
      var cityStateZip = idResults.Address.slice(idResults.Address.indexOf(',')+2, idResults.Address.length);
      $(".js-name").html(localStorage.getItem("theName"));
      $(".js-addr").html(streetAddress);
      $(".js-addr2").html(cityStateZip);
      $(".js-google").attr("href", idResults.GoogleLink);
      $(".js-fb").attr("href", `https:\\facebook.com/search/top/?q= ${localStorage.getItem("theName")}`);
      $(".js-schedule").html("Hours: " + idResults.Schedule);

      // remove all the columns and re-create below
      $(".column-3").each(function(item){$(this).remove()});

      // add all product items
      var productsRow = `<div class="column col-light column-3">`;
      products.forEach(function(item, index) { productsRow += addColumnItem(item, index, idResults.Products)});
      console.log(productsRow);
      productsRow += `</div>`;
      $('.products').prop('hidden',false).html(productsRow);
      //$(productsRow).appendTo($(".products"));
  }

  // add callback for recipes
  addRecipeSubmitCB();
}


// Get Selected Farmers Market Data from the USDA
function getDetailsFromUSDAApi() {
  console.log("Entering getDetailsFromUSDAApi...");
  const detailUrl = MARKET_SEARCH_URL + "mktDetail?id=" + localStorage.getItem("theID");
  console.log(`the url is: ${detailUrl}`);
    $.ajax({
        type : "GET",
        contentType : "application/json; charset=utf-8",
        // submit a get request to the restful service mktDetail.
        url : detailUrl,
        dataType : 'jsonp',
        jsonpCallback : 'displayUSDADetailData'
    });
}

// Add Callback for the Selected Farmers Market
function addMarketDetailsCB(){
    console.log("Entering addMarketDetailsCB...");

  $('a.js-link').on('click', function(event) {
    console.log("Entering anonymous addMarketDetailsCB...");
    event.preventDefault();
    event.stopPropagation();

    // retrieve the page data to open the window
    var theHref = $(this).attr('href');
    var theTgt = $(this).attr('target');
    var theName = $(this).html();
    var theID = $(this).next().html();
    setTimeout(function(event){window.open(theHref,theTgt);},500);

    // Call the API
    localStorage.setItem("theID", theID);
    localStorage.setItem("theName", theName);

    console.log(theName + ' ' + theHref + ' ' + theTgt + ' ' + localStorage.getItem("theID"));
  })
}

// Helper function for displaying Farmers Market List
function renderMarketListResult(result) {
  console.log("Entering renderMarketListResult...");
  var marketName = result.marketname.split(" ");
  var distance = marketName.shift();
  var name = marketName.join(" ");

  console.log(result.id);
  console.log(name);
  console.log(distance);
  return `
    <a class="js-link" target="_blank" href="./market.html">${name}</a>
    <p  class="the-id" hidden>${result.id}</p>
    <span>(${distance} miles from zipcode center)</span><br>
  `;
}

// Display Farmers Market List
function displayUSDASearchData(searchResults) {
  console.log("Entering displayUSDASearchData...");
  var resultsHTML, column1, column2, column3;
  const columnEnd = `</div>`;

  // create the top half of the html
  var resultsHTML = `
    <div role="header" class="js-detail-header">
        <h1><u>Select a Location For More Information</u><hr></h1></div>
    <div class="row">`;

  // get the search results
  for (var key in searchResults) {
    console.log(`the key is: ${key}`);
    var results = searchResults[key];

    // create the columns
    column1 = `<div class="column-list column-3">`;
    column2 = `<div class="column-list column-3">`;
    column3 = `<div class="column-list column-3">`;

    for (var i = 0; i < results.length; i++) {
      console.log(`result ${i} is : ${results[i].marketName}`);
      if (i % 3 === 0){
        column1 += renderMarketListResult(results[i]);
      }
      else if (i % 3 === 1) {
        column2 += renderMarketListResult(results[i]);
      }
      else {
        column3 += renderMarketListResult(results[i]);        
      }
    }
  }

  // add the bottom of the html
  resultsHTML += column1 + columnEnd;
  resultsHTML += column2 + columnEnd;
  resultsHTML += column3 + columnEnd;
  resultsHTML += `</div><div class="footer"><p></p><hr></div>`;

  $('.js-main').prop('hidden',false).html(resultsHTML);
  $('.js-main').addClass("js-detail-bkgd");

  // add the callback for the selected farmers market
  addMarketDetailsCB();

}

// Get Farmers Market List from USDA
function getDataFromUSDAApi(searchTerm) {
  console.log("Entering getDataFromUSDAApi...");
  const zipUrl = MARKET_SEARCH_URL + "zipSearch?zip=" + searchTerm;
  console.log(`the url is: ${zipUrl}`);
  $.ajax ({
    type : "GET",
    contentType : "application/json; charset=utf-8",
    url : zipUrl,
    dataType : 'jsonp',
    jsonpCallback : 'displayUSDASearchData'
  });
}

// Convert the city-state string into clean, city and state
// variables.
function getCityState(csString) {
  var divider = ",";
  var cityState = [];
  var found1 = csString.search(",");
  var found2 = csString.search(" ");
  if ( found1 >= 0 || found2 >= 0 ) {
    if (csString.search(",") < 0) {
      divider = " ";
    }
    cityState = csString.split(divider);
  }
  return cityState;
}

// Add Callback for the Farmers Market List
function addMarketListCB(){
    console.log("Entering addMarketListCB...");

  $('#market-search').submit(event => {
    console.log("Entering anonymous addMarketListCB...");
    event.preventDefault();

    // get the search data from the zipcode field
    const zip = $('#zipcode').val();

    // get the search data from the city-state field
    const cityState = getCityState($('#city-state').val());

    // if the data is valid, send it on to the api
    console.log(`zip length is: ${zip.length}`);
    if (zip.length > 4 && zip.length < 11) {

      // Save off the form and image for later.
      homeHeader = $('.js-main-header').detach();
      homeForm = $('.js-main-form').detach();
      homeFooter = $('.js-main-footer').detach();
      $('.js-main').removeClass("js-background");

      // Call the API.
      getDataFromUSDAApi(zip);
    } else if (cityState.length === 2) {
      getDataFromUSDAApi(cityState);
    } else {
      displayError();
    }
  });  
}

function main() {
  console.log(`Entering main...`);  
  addMarketListCB();
}

