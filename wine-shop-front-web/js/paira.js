/**
 * Author -> ThemeTidy
 * Email -> support@themetidy.com
 * Version -> 1.0
 */

/*******************************************************************************************
 * IIFE - Immediately Invoked Function Expression
 * The global jQuery object (window.jQuery, window, document) is passed as a parameter
 *******************************************************************************************/
(function($, window, document) {
    "use strict";
    

    
    if (document.querySelector('.product-widget') != null){
        fetch('http://spirit.ge:8000/wineproduct/?wine=test')
        .then(resp => {
            resp.json()
            .then(data => {
                productPage.showProducts(data.menu, 12, 1);
                paira.initDialogBox(data.menu);
                if (window.location.href.includes("collection.html" )){
                    paira.initProductPagination(data.menu, 1, 12);
                    paira.initProductPageSort(data.menu);
                    paira.initProductPageFilter(data.menu);
                }
                console.log(productPage.state)
                // paira.initDialogBox(data.menu);
            })
        })
        .catch(function(error){
            console.log(error)
        });
    }


    // show brands
    if ( document.querySelector('.paira-brand') != null) {
        fetch('http://www.spirit.ge:8000/brandlist/').then(resp => {
        resp.json()
        .then(data => {
            productPage.showBrands(data.menu);
            paira.initOwlCarousel();
            console.log("doneCar")
            // paira.initDialogBox(data.menu);
        })
    })
    }

    // async function getData(){
    //     let data = await getDataRequest(url);
    //     console.log(data); 
    // }
    // getData('http://34.107.74.144:8000/wineproduct/?wine=test');

    
    //const products = JSON.parse(JSON.stringify(json));
    
    /*******************************************************************************
     * Listen For The JQuery Ready Event On The Document
     *******************************************************************************/
    $(function() {
        paira.initDomReady();
    });
    /*******************************************************************************
     * Listen When The Document Full Load
     *******************************************************************************/
    $(window).load(function() {
        paira.initWindowReady();
    });
    var paira = {
        /***************************************************************************************
         * Init Dom Ready Function
         ***************************************************************************************/
        initDomReady: function() {
            this.initMenu();
            this.initPairaAnimation();
            this.initDomLoadClass();
            productPage.cartCounter();
            // this.initDialogBox();
        },
        /***************************************************************************************
         * Init Window Ready Function
         ***************************************************************************************/
        initWindowReady: function() {
            this.initToolTip();
            this.initIE10ViewPortHack();
            this.initWindowLoadClass();
            this.initGoogleMap();
            this.initBxCarousel();
            //this.initProductPageSort(); //mine
            //this.initProductPagination(0, 5); //mine
        },
        /*******************************************************************************
         * Scroll Animation Function - Using Animate.css with jQuery Waypoints
         *******************************************************************************/
        pairaAnimation: function( items, trigger ) {
            items.each( function() {
                var osElement = $(this),
                    osAnimationClass = osElement.attr('data-paira-animation'),
                    osAnimationDelay = osElement.attr('data-paira-animation-delay');
                osElement.css({
                    '-webkit-animation-delay':  osAnimationDelay,
                    '-moz-animation-delay':     osAnimationDelay,
                    'animation-delay':          osAnimationDelay
                });
                var osTrigger = ( trigger ) ? trigger : osElement;
                osTrigger.waypoint(function() {
                    osElement.addClass('animated').addClass(osAnimationClass);
                },{
                    triggerOnce: true,
                    offset: '90%'
                });
            });
        },
        /*******************************************************************************
         * Animation Load Function
         *******************************************************************************/
        initPairaAnimation: function() {
            paira.pairaAnimation($('.paira-animation'));
        },
        /*******************************************************************************
         * Tool Tips
         *******************************************************************************/
        initToolTip: function() {
            var $tooltip = $('[data-toggle="tooltip"]');
            if($tooltip.length > 0) {
                $tooltip.tooltip();
            }
        },
        /*******************************************************************************
         * Menu Customize
         *******************************************************************************/
        initMenu: function() {
            /***************************************************************************************
             * Mega Menu
             ***************************************************************************************/
            window.prettyPrint && prettyPrint();
            $(document).on('click', '.paira-mega-menu .paira-dropdown-menu', function(p) {
                p.stopPropagation();
            });
            $('.paira-mega-menu ul .paira-dropdown-menu').parent().hover(function() {
                var menu = $(this).find("ul");
                var menupos = $(menu).offset();
                if (menupos.left + menu.width() > $(window).width()) {
                    var newpos = -$(menu).width();
                    menu.css({ left: newpos });
                }
            });
            $(document).on('click', '.paira-mega-menu .paira-angle-down', function(p) {
                p.preventDefault();
                $(this).parents('.paira-dropdown').find('.paira-dropdown-menu').toggleClass('active');
            });
            $(document).on('click', '.paira-dropdown-menu .dropdown-submenu .fa-angle-right', function(p) {
                p.preventDefault();
                $(this).parents('a').next().toggleClass('active-on');
            });
        },
        /*******************************************************************************
         * Dialog Box
         *******************************************************************************/
        initDialogBox: function(json) {
            /***************************************************************************************
             * Modal Dialog (Quick View, Success Message, Welcome Newsletter, Error Massage)
             ***************************************************************************************/
            $(document).on('click', '.paira-quick-view', function(p) {
                p.stopPropagation();
                $('#paira-quick-view').modal('show');
                let elemId = p.target.closest('div[data-product-id]').getAttribute('data-product-id')
                let filteredJson = json.filter(item => item.id == elemId)
                filteredJson
                productPage.displayModalContent(filteredJson[0], elemId);

                let upBtn = document.querySelector("#modalCounterUp");
                let downBtn = document.querySelector("#modalCounterDown");
                let counterInput = document.querySelector("#modalInput");
                let cartBtns = document.querySelectorAll(".addToCartModal");
                paira.setInputFilter(counterInput, value => /^\d*$/.test(value))
                counterInput.value = 1;

                upBtn.addEventListener('click', e => {
                    counterInput.value = parseInt(counterInput.value) + 1;
                })
                downBtn.addEventListener('click', e => {
                    if (counterInput.value > 1) counterInput.value -= 1;
                })
                
                cartBtns.forEach(item => {
                    item.addEventListener('click', e => {
                        filteredJson[0].selectedQuantity = counterInput.value
                        console.log(filteredJson[0])
                        $('#paira-ajax-success-message').modal('show');
                        productPage.cartModal(filteredJson[0]);
                    })
                })
                
            });
            $(document).on('click', '.search-popup', function(p) {
                p.stopPropagation();
                $('#paira-search').modal('show');
            });
            $(document).on('click', '.login-popup', function(p) {
                p.stopPropagation();
                $('#paira-login').modal('show');

                let form = document.querySelector('.popup-login-form')
                
                let email = document.querySelector('input[type=email]');
                let password = document.querySelector('input[type=password]');
                let submit = document.querySelector("#paira-login > div > div > div > div > div > form > div > button");

                let insertLoginText = (response) => {
                    if(!document.querySelector('#serverResponse')){
                        let div = `<div style="color:#FF4500; font-size:20px; margin-bottom: 10px" id="serverResponse">${response}</div>`
                        form.insertAdjacentHTML('afterbegin', div);
                    } else {
                        document.querySelector('#serverResponse').innerHTML="";
                        let div = `<div style="color:#FF4500; font-size:20px; margin-bottom: 10px" id="serverResponse">${response}</div>`
                        form.insertAdjacentHTML('afterbegin', div);
                    }
                }
                
                

                submit.addEventListener('click', (e, data) => {
                    let emailValue = email.value;
                    let passwordValue = password.value;
                    e.preventDefault();
                    fetch('http://34.107.74.144:8000/token-auth/', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({username: emailValue, password: passwordValue})
                    })
                      .then(res => res.json())
                      .then(json => {
                        insertLoginText(json.non_field_errors[0]);
                        localStorage.setItem('token', json.token);
                        sessionStorage.setItem('logged_in', true);
                        sessionStorage.setItem('displayed_form', '');
                        sessionStorage.setItem('username', json.user.username);
                      });

                  });

            });
            
            $(document).on('click', '#create-acc', function(p) {
                // p.stopPropagation();

                let firstName = document.querySelector("#first-name");
                let lastName = document.querySelector("#last-name");
                let username = document.querySelector("#username");
                let password = document.querySelector("#register-password");
                let email = document.querySelector("#email");


                
                p.preventDefault();
                fetch('http://34.107.74.144:8000/users/', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username: username.value, password: password.value
                        , first_name: firstName.value, last_name: lastName.value, email : email.value})
                })
                    .then(res => res.json())
                    .then(json => {
                    localStorage.setItem('token', json.token);
                    sessionStorage.setItem('logged_in', true);
                    sessionStorage.setItem('displayed_form', '');
                    sessionStorage.setItem('username', json.username);
                    });
                
            });
            $(document).on('click', '.cart-menu-body', function(p) {
                p.stopPropagation();
                $('#paira-ajax-cart').modal('show');
                productPage.displayCartContent();
                paira.setInputFilter(document.querySelector(".row-4 div div input"), value => /^\d*$/.test(value));
                document.querySelector('#cartTableWrapper').addEventListener('click', e => {
                    if(e.target.id === 'removeItem'){
                        let json = JSON.parse(localStorage.getItem('cartItems'));
                        let filteredJson = json.filter(item => {
                            if(item.id !== +e.target.dataset.id){
                                return true;
                            } else {
                                e.target.closest(`div[data-id="${item.id}"]`).remove();
                                return false;
                            }
                        })
                        console.log(filteredJson);
                        localStorage.setItem('cartItems', JSON.stringify(filteredJson))
                    }
                    if(e.target.id === "cartDown"){
                        let inputText = e.target.nextElementSibling
                        let totalValue = e.target.closest('.row-4').previousElementSibling.querySelector('p br')
                        if(inputText.value > 1){
                            inputText.value -= 1;
                            totalValue.nextSibling.nodeValue = `Total : ${inputText.value* parseInt(totalValue.previousSibling.nodeValue)}`
                        }
                    }
                    if(e.target.id === "cartUp"){
                        let inputText = e.target.previousElementSibling
                        let totalValue = e.target.closest('.row-4').previousElementSibling.querySelector('p br')
                        inputText.value = parseInt(inputText.value) + 1;
                        totalValue.nextSibling.nodeValue = `Total : ${inputText.value* parseInt(totalValue.previousSibling.nodeValue)}`
                    }
                })
                document.querySelector('#cartUpdate').addEventListener('click', e => {
                    let storageItems = JSON.parse(localStorage.getItem('cartItems'))
                    console.log(json)
                    let calculate = document.querySelector('#cartCalculate')
                    let total = 0;
                    let totalArr = [];
                    
                    console.log(document.querySelectorAll('.cartItem'))
                    document.querySelectorAll('.row-3 p').forEach(item => {
                        totalArr.push(parseInt(item.innerText.match(/\d+/g)[0])* item.closest('.row-3').nextElementSibling.querySelector('div div input').value)
                    })
                    console.log(totalArr)
                    total = totalArr.reduce((accumulator, currentValue) => accumulator + currentValue);
                    calculate.innerHTML = `Subtotal : <span><b>${total}&#8382;</b></span>`
                })
            });
            $(document).on('click', '.product-cart-con', function(p) {
                p.stopPropagation();
                $('#paira-ajax-success-message').modal('show');
                let elemId = p.target.closest('div[data-product-id]').getAttribute('data-product-id')
                let filteredJson = json.filter(item => item.id == elemId)
                productPage.cartModal(filteredJson[0]);
            });
            $('#paira-welcome-newsletter').modal('show');
        },
        initProductPageSort: function(json){
            document.querySelector('#product-sort').addEventListener('change', e => {
                let selectValue = e.target.value
                let sortedJson;
                let state = productPage.state;
                
                
               



                if(!state.isFiltered){
                    if(selectValue === "sort-asc"){
                        sortedJson = productPage.sortByCost(json, "asc");
                        productPage.showProducts(sortedJson, 12, 1)
                        state.isSorted = { byAsc: true, byDesc: false }
                    } else if(selectValue === "sort-desc"){
                        sortedJson = productPage.sortByCost(json, "desc");
                        productPage.showProducts(sortedJson, 12, 1)
                        state.isSorted = { byAsc: false, byDesc: true }
                    } else if(selectValue === "sort-def"){
                        console.log(json);
                        state.isSorted = false;
                        productPage.showProducts(json, 12, 1);
                    }
                } else {
                    if(state.isFiltered.byRed){
                        if(selectValue === "sort-asc"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "red"), "asc"), 12, 1);
                            state.isSorted = { byAsc: true, byDesc: false }
                        } else if(selectValue === "sort-desc"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "red"), "desc"), 12, 1);
                            state.isSorted = { byAsc: false, byDesc: true }
                        } else if(selectValue === "sort-def"){
                            state.isSorted = false;
                            productPage.showProducts(json, 12, 1);
                        }
                    }
                    if(state.isFiltered.byWhite){
                        if(selectValue === "sort-asc"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "white"), "asc"), 12, 1);
                            state.isSorted = { byAsc: true, byDesc: false }
                        } else if(selectValue === "sort-desc"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "white"), "desc"), 12, 1);
                            state.isSorted = { byAsc: false, byDesc: true }
                        } else if(selectValue === "sort-def"){
                            state.isSorted = false;
                            productPage.showProducts(json, 12, 1);
                        }
                    }
                    if(state.isFiltered.byOther){
                        if(selectValue === "sort-asc"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "other"), "asc"), 12, 1);
                            state.isSorted = { byAsc: true, byDesc: false }
                        } else if(selectValue === "sort-desc"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "other"), "desc"), 12, 1);
                            state.isSorted = { byAsc: false, byDesc: true }
                        } else if(selectValue === "sort-def"){
                            state.isSorted = false;
                            productPage.showProducts(json, 12, 1);
                        }
                    }
                }
            })
        },
        initProductPageFilter: function(json){
            document.querySelector('#product-filter').addEventListener('change', e => {
                let selectValue = e.target.value;
                let state = productPage.state;
            
               

                

                if(!state.isSorted){
                    if(selectValue === "red"){
                        productPage.showProducts(productPage.filter(json, "red"), 12, 1);
                        state.isFiltered = { byRed: true, byWhite: false, byOther: false };
                    } else if(selectValue === "white"){
                        productPage.showProducts(productPage.filter(json, "white"), 12, 1);
                        state.isFiltered = { byRed: false, byWhite: true, byOther: false };
                    } else if(selectValue === "other"){
                        productPage.showProducts(productPage.filter(json, "other"), 12, 1);
                        state.isFiltered = { byRed: false, byWhite: false, byOther: true };
                    } else {
                        //isFiltered = false;
                        productPage.showProducts(json, 12, 1)
                    }
                } else {
                    
                    if(state.isSorted.byAsc){
                        if(selectValue === "red"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "red"), "asc"), 12, 1);
                            state.isFiltered = { byRed: true, byWhite: false, byOther: false };
                        } else if(selectValue === "white"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "white"), "asc"), 12, 1);
                            state.isFiltered = { byRed: false, byWhite: true, byOther: false };
                        } else if(selectValue === "other"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "other"), "asc"), 12, 1);
                            state.isFiltered = { byRed: false, byWhite: false, byOther: true };
                        } else {
                            state.isFiltered = false;
                            productPage.showProducts(json, 12, 1)
                        }
                    } else if(state.isSorted.byDesc){
                        if(selectValue === "red"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "red"), "desc"), 12, 1);
                            state.isFiltered = { byRed: true, byWhite: false, byOther: false };
                        } else if(selectValue === "white"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "white"), "desc"), 12, 1);
                            state.isFiltered = { byRed: false, byWhite: true, byOther: false };
                        } else if(selectValue === "other"){
                            productPage.showProducts(productPage.sortByCost(productPage.filter(json, "other"), "desc"), 12, 1);
                            state.isFiltered = { byRed: false, byWhite: false, byOther: true };
                        } else {
                            state.isFiltered = false;
                            productPage.showProducts(json, 12, 1)
                        }
                    }
                }
                
                
                
            })
        },
        initProductPagination: function(json, currentPage, recordsPerPage){
            let total = Math.ceil(json.length / recordsPerPage);
            let container = document.querySelector("#page-numbers");
            //container.innerHTML="";
            let pageNumber = ``;
            for(let i = 1; i < total + 1; i++){
                pageNumber += `<li class="" value="${i}" style="cursor: pointer;">${i}</li>`;
            }
            let pageStat = document.querySelector("#paging-stat")
            pageStat.innerHTML = `Showing : <b>${currentPage} - ${recordsPerPage}</b> Of <b>${json.length}</b>`;
            $("#page-numbers li:first-child").after(pageNumber);
            container.addEventListener('click', e => {
                e.preventDefault()
                let selectValue = e.target.getAttribute('value');
                if(selectValue === "next"){
                    currentPage++;
                    if(currentPage > total) currentPage = 1;
                    productPage.showProducts(json, recordsPerPage, currentPage);
                } else if(selectValue === "prev"){
                    currentPage--;
                    if(currentPage < 1) currentPage = total;
                    productPage.showProducts(json, recordsPerPage, currentPage);
                } else if(typeof(parseInt(selectValue)) === "number" && !NaN){
                    e.target.previousElementSibling.classList.remove("active");
                    e.target.nextElementSibling.classList.remove("active");
                    e.target.classList.add("active");
                    currentPage=selectValue;
                    productPage.showProducts(json, recordsPerPage, currentPage);
                } else {
                    console.log('lol')
                }
                pageStat.innerHTML = `Showing : <b>${currentPage} - ${json.length - recordsPerPage}</b> Of <b>${json.length}</b>`;
            })
            
                
            
        },
        setInputFilter: function(textbox, inputFilter) {
            ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
              textbox.addEventListener(event, function() {
                if (inputFilter(this.value)) {
                  this.oldValue = this.value;
                  this.oldSelectionStart = this.selectionStart;
                  this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                  this.value = this.oldValue;
                  this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                } else {
                  this.value = "";
                }
              });
            });
          },
        
        /*******************************************************************************
         * Google Map
         *******************************************************************************/
        initGoogleMap: function() {
            if($("#googleMap").length > 0) {
                var locations = [
                    ['Head Office', 23.544997, 89.172591, 1],
                    ['Head Of Developer Office', 23.544798, 89.170480, 2],
                    ['Production House', 23.537337, 89.174856, 3],
                    ['Head Of Designer Office', 23.531917, 89.172887, 4],
                    ['Selling House', 23.545307, 89.165835, 5],
                    ['Packaging House', 23.542749, 89.167293, 6],
                    ['Play Ground', 23.544863, 89.177532, 7],
                ];
                var map = new google.maps.Map(document.getElementById('googleMap'), {
                        zoom: 14,
                        center: new google.maps.LatLng(23.544997, 89.172591),
                        styles: [
                            {
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#f5f5f5"
                                    }
                                ]
                            },
                            {
                                "elementType": "labels.icon",
                                "stylers": [
                                    {
                                        "visibility": "off"
                                    }
                                ]
                            },
                            {
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#616161"
                                    }
                                ]
                            },
                            {
                                "elementType": "labels.text.stroke",
                                "stylers": [
                                    {
                                        "color": "#f5f5f5"
                                    }
                                ]
                            },
                            {
                                "featureType": "administrative.land_parcel",
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#bdbdbd"
                                    }
                                ]
                            },
                            {
                                "featureType": "poi",
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#eeeeee"
                                    }
                                ]
                            },
                            {
                                "featureType": "poi",
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#757575"
                                    }
                                ]
                            },
                            {
                                "featureType": "poi.park",
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#e5e5e5"
                                    }
                                ]
                            },
                            {
                                "featureType": "poi.park",
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#9e9e9e"
                                    }
                                ]
                            },
                            {
                                "featureType": "road",
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#ffffff"
                                    }
                                ]
                            },
                            {
                                "featureType": "road.arterial",
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#757575"
                                    }
                                ]
                            },
                            {
                                "featureType": "road.highway",
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#dadada"
                                    }
                                ]
                            },
                            {
                                "featureType": "road.highway",
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#616161"
                                    }
                                ]
                            },
                            {
                                "featureType": "road.local",
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#9e9e9e"
                                    }
                                ]
                            },
                            {
                                "featureType": "transit.line",
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#e5e5e5"
                                    }
                                ]
                            },
                            {
                                "featureType": "transit.station",
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#eeeeee"
                                    }
                                ]
                            },
                            {
                                "featureType": "water",
                                "elementType": "geometry",
                                "stylers": [
                                    {
                                        "color": "#c9c9c9"
                                    }
                                ]
                            },
                            {
                                "featureType": "water",
                                "elementType": "labels.text.fill",
                                "stylers": [
                                    {
                                        "color": "#9e9e9e"
                                    }
                                ]
                            }
                        ]
                    }),
                    infowindow = new google.maps.InfoWindow(),
                    marker, i;
                for (i = 0; i < locations.length; i++) {
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
                        map: map
                    });
                    google.maps.event.addListener(marker, 'click', (function(marker, i) {
                        return function() {
                            infowindow.setContent(locations[i][0]);
                            infowindow.open(map, marker);
                        }
                    })(marker, i));
                }
            }
        },
        /*******************************************************************************
         * Single Product Page Item Carousel With Product Elevate Zoom Effect
         *******************************************************************************/
        initBxCarousel: function() {
            var $single_bxSlider = $(".single-product-image-list"),
                $bxSlider = $('.bxslider');
            if($single_bxSlider.length > 0){
                $single_bxSlider.bxSlider({
                    auto: true,
                    mode: 'vertical',
                    slideWidth: 147,
                    minSlides: 3,
                    pager: false,
                    responsive:true,
                    slideMargin: 20
                });
            }
            if($bxSlider.length > 0){
                $bxSlider.bxSlider({
                    mode: 'horizontal',
                    useCSS: false,
                    infiniteLoop: false,
                    hideControlOnEnd: true,
                    easing: false,
                    speed: 0
                });
            }
        },
        /*******************************************************************************
         * Owl Carousel
         *******************************************************************************/
        initOwlCarousel: function() {
            /*******************************************************************************
             * Brand Logo Carousel
             *******************************************************************************/
            var $brand_owlCarousel = $('.paira-brand');
            if ($brand_owlCarousel.length > 0) {
                var brand = $brand_owlCarousel.owlCarousel({
                    itemsCustom: [
                        [1199, 4],
                        [992, 4],
                        [768, 3],
                        [480, 2],
                        [300, 1],
                        [200, 1]
                    ],
                    autoPlay: !1,
                    slidespeed: 500,
                    autoHeight: !0,
                    transitionStyle: "backSlide"
                });
                $(".paira-brand-left").on("click", function () {
                    brand.trigger("owl.prev")
                });
                $(".paira-brand-right").on("click", function () {
                    brand.trigger("owl.next")
                })
            }
        },
        /*******************************************************************************
         * IE10 viewport hack for Surface/desktop Windows 8 bug
         *******************************************************************************/
        initIE10ViewPortHack: function() {
            'use strict';
            if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
                var msViewportStyle = document.createElement('style');
                msViewportStyle.appendChild(
                    document.createTextNode(
                        '@-ms-viewport{width:auto!important}'
                    )
                );
                document.querySelector('head').appendChild(msViewportStyle)
            }
        },
        /*******************************************************************************
         * Custom Dom Load Class
         *******************************************************************************/
        initDomLoadClass: function() {
            /***************************************************************************************
             * When Document Ready Show This Class "paira-dom-ready"
             ***************************************************************************************/
            var toggle_button = $('.toggle-button .fa'),
                product_dtl = $('.product-dtl');
            $(".paira-dom-ready").show();
            $(document).on('click', '.fa-angle-right', function(p) {
                p.preventDefault();
                toggle_button.removeClass('fa-angle-right').addClass('fa-angle-left');
                product_dtl.toggleClass("single-product-tab");
            });
            $(document).on('click', '.fa-angle-left', function(p) {
                p.preventDefault();
                toggle_button.addClass('fa-angle-right').removeClass('fa-angle-left');
                product_dtl.toggleClass("single-product-tab");
            });
        },
        /***************************************************************************************
         * Ajax Get Data
         ***************************************************************************************/
        ajaxGetData: function(url, dataType) {
            var dataTypeDefault = typeof dataType !== 'undefined' ?  dataType : 'html';
            return $.ajax({
                url: url,
                type: "get",
                dataType: dataTypeDefault,
                beforeSend: function() {
                    paira.showLoading();
                },
                error: function() {
                    paira.hideLoading();
                    var message = '<i class="fa fa-info-circle font-size-16"></i> Something wrong! Try to reload your page OR contact customer support.';
                    paira.showCommonMessage(message);
                }
            });
        },
        /***************************************************************************************
         * Show Loading Animation
         ***************************************************************************************/
        showLoading: function() {
            $(".paira-loading").show()
        },
        /***************************************************************************************
         * Hide Loading Animation
         ***************************************************************************************/
        hideLoading: function() {
            $(".paira-loading").hide()
        },
        showCommonMessage: function(message) {
            var popup = $('#paira-common-message');
            popup.find('.paira-common-message-details').html(message);
            popup.modal('show');
        },
        /*******************************************************************************
         * Custom Window Load Class
         *******************************************************************************/
        initWindowLoadClass: function() {
            var $parallax = $('.parallax');
            /*******************************************************************************
             * Image Parallax
             *******************************************************************************/
            if ($parallax.length > 0) {
                $parallax.parallax("50%", 0.3);
            }
            /***************************************************************************************
             * When Window Ready Show This Class "paira-win-ready"
             ***************************************************************************************/
            $(".paira-win-ready").show();
            /***************************************************************************************
             * For product page
             ***************************************************************************************/
            $(document).on('click', '#paira-single-product-gallery a', function(p) {
                p.preventDefault();
                var imageUrl = $(this).attr('data-image');
                paira.ajaxGetData(imageUrl).done(function() {
                    paira.hideLoading();
                    $('.paira-single-product-image img').attr('src', imageUrl);
                });
            });
            $(document).on('click', '.paira-quick-product-image-list a', function(p) {
                p.preventDefault();
                var imageUrl = $(this).attr('data-image');
                paira.ajaxGetData(imageUrl).done(function() {
                    paira.hideLoading();
                    $('.paira-quick-single-product-image img').attr('src', imageUrl);
                });
            });

            
        },

    };

    const productWidget = document.querySelector('.product-widget');
    const brandWidget = document.querySelector('.paira-brand');

    const productModalContent = document.querySelector('.pro-content');
    let currentPage = 1;
    

    
    const productPage = {
        state:{
            isFiltered: false,
            isSorted: false
        },
        hideProducts: function(){
            productWidget.innerHTML = "";
        },
        showProducts: function(json, recordsPerPage, page){
            this.hideProducts();
            let product = "";
            page--;
            console.log(`Current Page: ${page}`)

            let start = recordsPerPage * page;
            let end = start + recordsPerPage;
            let paginatedJson = json.slice(start, end);


            for(let i =0; i < paginatedJson.length; i++){
                let item = paginatedJson[i];
                product += `
                    <div class="col-sm-3 col-md-3 col-xs-6 paira-margin-top-1" data-product-id="${item.id}">
                        <div class="product text-center" >
                            <div class="block-image position-rela">
                                <a href="#" >
                                    <div class="background-overlay"></div>
                                    <img src="http://spirit.ge:8000/images/${item.image}" alt="IMAGE NOT FOUND" class="img-responsive"; style="display: inline-block; max-width: 265px; max-height: 426px;">
                                </a>
                            </div>
                            <h1 class="font-size-16 paira-margin-top-4 margin-bottom-10"><a href="collection.html">${item.name}</a></h1>
                            <span class="money font-size-16"><b>${item.price}</b>&#8382;</span>
                            <div class="product-hover">
                                <div class="paira-wish-compare-con wish-compare-view-cart paira-margin-top-4">
                                    <a href="#paira-quick-view" class="paira-quick-view quick-view  btn color-scheme-2 font-size-18"><i class="fa fa-eye"></i></a>
                                    <a href="#" class="product-cart-con margin-left-5  btn color-scheme-2"><img src="images/cart-2.png" alt=""></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    `
            }
                
        
            productWidget.insertAdjacentHTML('beforeend', product);
        },
        showBrands: function(jsonBrands){
            this.hideProducts();
            let product = "";

            for(let i =0; i < jsonBrands.length; i++){
                let item = jsonBrands[i];
                product += `
                    <a href="#"><img src="http://spirit.ge:8000/images/${item.image}" " alt=""/></a>
                    `
            }


            brandWidget.insertAdjacentHTML('beforeend', product);
        },
        displayModalContent: function(data){
            productModalContent.innerHTML="";
            let modalContent = `
            <div class="pro-conte
            <div class="pro-body product-dtl">
                <div class="bottom-img">
                    <div class="info">
                        <h4 class="raleway-sbold full-width">${data.price}&#8382;</h4>
                        <h4 class="raleway-light full-width text-capitalize margin-top-15">${data.name}</h4>
                        <p class="margin-top-15 letter-spacing-2 font-size-14">
                            ${data.description}
                        </p>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>vendor : </b>${data.brand_id__name}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>year : </b>${data.year}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>alcohol % : </b>${data.alcoholPercent}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>region : </b>${data.region}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>type : </b>${data.type}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>color : </b>${data.color}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>variety : </b>${data.variety}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>size : </b></h4>
                            <select class="sort-by paira-filter-category">
                                <option value="/collections/camera">250ml</option>
                                <option value="/collections/dslr-camera">250ml</option>
                                <option value="/collections/headphone">250ml</option>
                                <option value="/collections/ipad">250ml</option>
                                <option value="/collections/iphone">250ml</option>
                            </select>
                        </div>
                        <div class="quantity margin-top-15 display-inline-b full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase pull-left"><b>Quantity : </b></label></h4>
                            <div class=" full-width">
                                <div class="product_quantity_group product-quantity-fix">
                                    <input type="text" class="form-control text-center pull-left font-size-16" value="1" id="modalInput">
                                    <div class="up-down text-center pull-left overflow">
                                        <span class="up" data-direction="up" id="modalCounterUp"><i class="fa fa-angle-up"></i></span>
                                        <span class="down" data-direction="down" id="modalCounterDown"><i class="fa fa-angle-down"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="sub-totals margin-top-15 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase pull-left margin-right-10"><b>Subtotal : </b></label></h4>
                            <h4 class="money margin-left-5">$40.00</h4>
                        </div>
                        <div class="btn-group paira-margin-top-4 full-width pull-left" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-default btn-lg btn-image addToCartModal"><img src="images/cart-3.png" alt=""></button>
                            <button type="button" class="btn btn-default btn-lg color-scheme-2 raleway-light text-uppercase addToCartModal">add to cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            `
        productModalContent.insertAdjacentHTML('beforeend', modalContent);
        document.querySelector(".paira-product.single-varients-product").innerHTML=`<img src="http://spirit.ge:8000/images/${data.image}" style="max-width:374px;max-height:621px;margin-left:90px;margin-top:30px"></img>`
        },
        sortByCost: function(json, by="asc"){
            let sortedJson;
            (by == "asc") ?
            sortedJson = json.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
            :
            sortedJson = json.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
            return sortedJson;
        },
        filter: function(json, option){
            let hasOption = item => {
                if(item.type !== null){
                    if(option==="other"){
                        return !item.type.toLowerCase().includes("red") && !item.type.toLowerCase().includes("white")
                    }
                    return item.type.toLowerCase().includes(option)
                } else {
                    return false;
                }
            }
            return json.filter(hasOption)
           
        },
        cartModal: function(data){
            let productName = document.querySelector("#cartProductName");
            let productImage = document.querySelector("#cartProductImg");
            let productId = data.id;
            let quantity = 1

            if (data.selectedQuantity){
                quantity = data.selectedQuantity
            }

            let cartItem = { id: data.id, image: data.image, name: data.name, quantity: quantity, price: data.price };
            productImage.src = `http://spirit.ge:8000/images/${data.image}`;
            productName.innerHTML = `${data.name}`;

            
            let existing = localStorage.getItem('cartItems');

            
            //existing = existing ? JSON.parse(existing) : [];
            
            // existing.forEach( (item, i) => {
                
            // })

            if(existing){
                existing = JSON.parse(existing);
                existing = existing.filter(item => JSON.stringify(item) !== JSON.stringify(cartItem));
                existing.push(cartItem);
        
            } else {
                existing = []
                existing.push(cartItem);
                localStorage.setItem('cartItems', JSON.stringify(existing));
            }

            localStorage.setItem('cartItems', JSON.stringify(existing))
            this.cartCounter();
            



           
        },
        cartCounter: function(){
            let existing = JSON.parse(localStorage.getItem('cartItems'))
            let counter = document.querySelector('#cartCounter')
            if(existing) counter.innerText = existing.length
        },
        displayCartContent: function(){
            let cartContent = JSON.parse(localStorage.getItem('cartItems'))
            let cartWidget = document.querySelector('#paira-ajax-cart > div > div > div > div > div.col-md-12.col-sm-12.col-xs-12.cart-table > div')
            cartWidget.innerHTML = '';
            let cartItem;
            cartContent.forEach((item,i) => {
                cartItem += `
                    <div class="column full-width overflow paira-margin-bottom-4 cartItem" data-id="${item.id}">
                    <div class="row-1">
                        <a href="product.html">
                            <img src="http://spirit.ge:8000/images/${item.image}" alt="" class="img-responsive center-block">
                        </a>
                    </div>
                    <div class="row-2"><p><a href="#">${item.name}</a></p></div>
                    <div class="row-3"><p>${item.price}&#8382;<br class="totalItem">Total : ${item.price}&#8382</p></div>
                    <div class="row-4">
                        <div class="quantity">
                            <div class="quantity-fix display-inline-b">
                                <button class="btn-default btn" data-direction="down" id="cartDown" data-id="${item.id}"><i class="fa fa-angle-down"></i></button>
                                <input type="text" value="${item.quantity}" class="text-center product_quantity_text" id="cartInput" data-id="${item.id}">
                                <button class="btn-success btn" data-direction="up" id="cartUp" data-id="${item.id}"><i class="fa fa-angle-up"></i></button>
                            </div>
                        </div>
                    </div>
                    <div class="row-5"><p><a href="#" class="remove"><i class="fa fa-trash fa-2x" id="removeItem" data-id="${item.id}"></i></a>
                    </p></div>
                    </div>
                `
            })
            cartWidget.insertAdjacentHTML('beforeend', cartItem)
        }
    }

   
    

}(window.jQuery, window, document));
/**********************************************************************************************
 * The global jQuery object (window.jQuery, window, document) is passed as a parameter
 **********************************************************************************************/
