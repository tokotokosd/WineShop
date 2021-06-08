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
    

    function getCookie(name) {
        if (!document.cookie) {
          return null;
        }
      
        const xsrfCookies = document.cookie.split(';')
          .map(c => c.trim())
          .filter(c => c.startsWith(name + '='));
      
        if (xsrfCookies.length === 0) {
          return null;
        }
        return decodeURIComponent(xsrfCookies[0].split('=')[1]);
      }

    const csrftoken = getCookie('csrftoken');
    
    function dbt(objProp, useFun=true){
        let hasLanguage = objProp.includes(';');
        if(useFun === false && hasLanguage) return objProp.split(';')[0]
        if(useFun === false && !hasLanguage) return objProp
        if(localStorage.getItem('language') === 'ge'){
            if(hasLanguage) return objProp.split(';')[1]
            return objProp
        } else {
            if(hasLanguage) return objProp.split(';')[0]
            return objProp
        }
    }



    

    //navbar changes

    
    document.querySelector('#searchButton').addEventListener('click', e => {
        let input = document.querySelector("#custom-search-input").querySelector('input').value;
        console.log(input)
        if(window.location.href.includes('collection.html')){
            window.location.replace(`collection.html#search=${input}`);
            window.location.reload();
        } else {
            window.location.replace(`collection.html#search=${input}`);
        }
    })
    
    

    let isLoggedIn = () => {
        if(sessionStorage.getItem('logged_in') === "true") return true;
    }
    
    
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
                ///////
                p.stopPropagation();
                p.preventDefault();
                $('#paira-quick-view').modal('show');
                let elemId = p.target.closest('div[data-product-id]').getAttribute('data-product-id');
                let filteredJson = json.filter(item => item.id == elemId);
                
                productPage.displayModalContent(filteredJson[0], elemId);

                let upBtn = document.querySelector("#modalCounterUp");
                let downBtn = document.querySelector("#modalCounterDown");
                let counterInput = document.querySelector("#modalInput");
                let cartBtns = document.querySelectorAll(".addToCartModal");
                let total = document.querySelector('#modalTotalCost');

                console.log(filteredJson)

                const calculateSum = () => {
                    total.innerText = +counterInput.value * +filteredJson[0].price
                }

                paira.setInputFilter(counterInput, value => /^\d*$/.test(value))
                counterInput.value = 1;
                calculateSum()
                

                upBtn.addEventListener('click', e => {
                    if(counterInput.value < filteredJson[0].quantity){
                
                        counterInput.value = +counterInput.value + 1;
                        calculateSum();
                    } else {
                        //////////
                        document.querySelector('#modalQuantityText').innerHTML = `
                        <i class="fa fa-exclamation" aria-hidden="true" style="color: red"></i><span style="color: red";> ${t("Unfortunately, required quantity is out of stock")}</span>
                        `
                        setTimeout(() => {
                            document.querySelector('#modalQuantityText').innerHTML = "";
                        }, 5000);
                    }
                })
                downBtn.addEventListener('click', e => {
                    if (counterInput.value > 1) counterInput.value -= 1;
                    calculateSum()
                })
                
                if(!isLoggedIn()){
                    cartBtns.forEach(item => {
                        item.addEventListener('click', e => {
                            filteredJson[0].selectedQuantity = counterInput.value
                            console.log(filteredJson[0])
                            $('#paira-ajax-success-message').modal('show');
                            productPage.cartModal(filteredJson[0]);
                        })
                    })
                }
                
                if(isLoggedIn()){
                    cartBtns.forEach(item => {
                        item.addEventListener('click', e => {
                            fetch('https://spirit.ge:8000/cart/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'appliction/json;charset=utf-8',
                                    Authorization: `JWT ${localStorage.getItem('token')}`,
                                    'X-CSRFToken':  csrftoken,
                                },
                                body: JSON.stringify({action: 'quantity', productId: filteredJson[0].id , quantity: +counterInput.value}),
                                credentials: 'include'
                            })
                            .then( res => res.json() )
                            .then( resJson => {
                                if(resJson === "item was added"){
                                    $('#paira-ajax-success-message').modal('show');
                                    productPage.cartModal(filteredJson[0]);
                                }
                            });
                        })
                    })
                }
                
                
            });
            $(document).on('click', '.search-popup', function(p) {
                p.stopPropagation();
                $('#paira-search').modal('show');
            });
            $(document).on('click', '.login-popup', function(p) {
                p.stopPropagation();
                $('#paira-login').modal('show');

                let form = document.querySelector('.popup-login-form')
                
                let email = document.querySelector('.popup-login-form input[type=email]');
                let password = document.querySelector('.popup-login-form input[type=password]');
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

                let validateInputs = () => {
                    if(email.value === "" && password.value === ""){
                        insertLoginText(t("Username & password fields are blank"));
                        email.style.border = "1px solid red";
                        password.style.border = "1px solid red";
                        return false;
                    } else if (email.value === ""){
                        
                        insertLoginText(t("Username field is blank"));
                        email.style.border = "1px solid red";
                        return false;
                    } else if (password.value === ""){
                        
                        insertLoginText(t("Password field is blank"));
                        password.style.border = "1px solid red";
                        return false;
                    } else {
                        return true
                    }
                }
                
                let clearInputs = () => {
                    email.value = "";
                    password.value = "";
                    password.style.border = "";
                    email.style.border = "";
                    if(document.querySelector('#serverResponse')) document.querySelector('#serverResponse').remove();
                }
                
 
                submit.addEventListener('click', (e, data) => {
                    let emailValue = email.value;
                    let passwordValue = password.value;
                    e.preventDefault();
                    if(validateInputs() === true){
                        fetch('https://spirit.ge:8000/token-auth/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({username: emailValue, password: passwordValue})
                            })
                            .then(res => res.json())
                            .then(json => {
                                if(json.non_field_errors) insertLoginText(t('Your password & username is wrong!'))
                                if(json.token !== undefined || null){
                                    localStorage.setItem('token', json.token);
                                    sessionStorage.setItem('logged_in', true);
                                    sessionStorage.setItem('username', json.user.username);
                                    clearInputs();
                                    location.reload();
                                }
                        });
                    }
                    

                  });

            });
            
            $(document).on('click', '#create-acc', function(p) {
                // p.stopPropagation();
                p.preventDefault();
                let username = document.querySelector("#register-username");
                let password = document.querySelector("#register-password");
                let repeatedPassword = document.querySelector("#register-repeat-password");
                let email = document.querySelector("#register-email");
                let checkbox = document.querySelector('#invalidCheck');
                let registerFormInputs = document.querySelectorAll('#register-form input')
                let errorMsg = document.querySelector('#register-error-msg')
                let isValid = true;
                let registerJson = {username: "", password: "", email: ""}
                errorMsg.innerText = "";
    
                let printErrorMsg = (text) => {
                    errorMsg.innerText += text
                }
                
                registerFormInputs.forEach(x => {
                    if(x !== checkbox) x.removeAttribute('style')
                    switch(x){
                        case username:
                            if(x.value === ""){
                                isValid = false
                                x.style.border = "1px solid red";
                                printErrorMsg("Please, enter your username\n")
                            }
                            break;
                        case email:
                            if(x.value === ""){
                                isValid = false
                                x.style.border = "1px solid red";
                                printErrorMsg("Please, enter your email\n")
                            }
                            break;
                        case password:
                            if(x.value === ""){
                                isValid = false
                                x.style.border = "1px solid red";
                                printErrorMsg("Please, enter your password\n")
                            }
                            if(x.value !== repeatedPassword.value){
                                x.style.border = "1px solid red";
                                repeatedPassword.style.border = "1px solid red";
                                printErrorMsg("Your passwod doesn't match\n")
                            }
                            break;
                        case repeatedPassword:
                            if(x.value === ""){
                                isValid = false
                                x.style.border = "1px solid red";
                                printErrorMsg("Please, repeat your password\n")
                            }
                            if(x.value !== password.value){
                                isValid = false
                                x.style.border = "1px solid red";
                            }
                            break;
                        case checkbox:
                            if(!checkbox.checked){
                                isValid = false
                                printErrorMsg("You must agree to our terms and conditions\n")
                            }
                            break;
                    }
                })
                console.log('lol')
                if(isValid){
                    registerJson.username = username.value
                    registerJson.email = email.value
                    registerJson.password = password.value
                    console.log(registerJson)
                    fetch('https://spirit.ge:8000/users/', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    //username: username.value, password: password.value, first_name: username.value, last_name: lastName.value, email : email.value
                    body: JSON.stringify(registerJson)
                })
                    .then(res => {
                        console.dir(res)
                        if(res.ok === true) printErrorMsg(t("Please check your email to activate your account"))
                        return res.json()
                    })
                    .then(json => {
                        if(Object.keys(json).length < 4) printErrorMsg(json[Object.keys(json)[0]])
                    });

                }
                
                
            });
            $(document).on('click', '.cart-menu-body', function(p) {
                p.stopPropagation();
                
                $('#paira-ajax-cart').modal('show');
                productPage.displayCartContent(json);
                
                function cart(e){
                    e.stopPropagation()
                    
                    if(e.target.id === 'removeItem'){
                        console.log('removeitem click')
                        if(isLoggedIn()){
                            fetch('https://spirit.ge:8000/cart/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'appliction/json;charset=utf-8',
                                    Authorization: `JWT ${localStorage.getItem('token')}`,
                                    'X-CSRFToken':  csrftoken,
                                },
                                body: JSON.stringify({action: 'removeAll', productId: +e.target.dataset.id}),
                                credentials: 'include'
                            })
                            .then( res => res.json() )
                            .then( resJson => {
                                if(resJson === "item was added"){
                                    e.target.closest(`div[data-id="${json.filter(item => item.id === +e.target.dataset.id)[0].id}"]`).remove();
                                    totalPriceUpdate();
                                }
                            });
                        } else {
                            console.log('removeitem click')
                            let json = JSON.parse(localStorage.getItem('cartItems'));
                            let filteredJson = json.filter(item => {
                            if(item.id !== +e.target.dataset.id){
                                return true;
                            } else {
                                e.target.closest(`div[data-id="${item.id}"]`).remove();
                                totalPriceUpdate();
                                return false;
                            }
                            })
                            console.log(filteredJson);
                            localStorage.setItem('cartItems', JSON.stringify(filteredJson))
                        }
                    }
                    if(e.target.id === "cartDown"){
                        if(isLoggedIn()){
                            fetch('https://spirit.ge:8000/cart/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'appliction/json;charset=utf-8',
                                    Authorization: `JWT ${localStorage.getItem('token')}`,
                                    'X-CSRFToken':  csrftoken,
                                },
                                body: JSON.stringify({action: 'remove', productId: +e.target.dataset.id}),
                                credentials: 'include'
                            })
                            .then( res => res.json() )
                            .then( json => console.log(json) );
                        }
                        let inputText = e.target.nextElementSibling
                        let totalValue = e.target.closest('.row-4').previousElementSibling.querySelector('p br')
                        if(inputText.value > 1){
                            console.log()
                            
                            console.log(`inputText.value is ${inputText.value}`)
                            inputText.value -= 1;
                            totalValue.nextSibling.nodeValue = `${t('Total')} : ${inputText.value* parseInt(totalValue.previousSibling.nodeValue)}`
                        }
                        totalPriceUpdate();
                    }
                    if(e.target.id === "cartUp"){
                        console.log(+e.target.dataset.id)
                        if(isLoggedIn()){
                            fetch('https://spirit.ge:8000/cart/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'appliction/json;charset=utf-8',
                                    Authorization: `JWT ${localStorage.getItem('token')}`,
                                    'X-CSRFToken':  csrftoken,
                                },
                                body: JSON.stringify({action: 'add', productId: +e.target.dataset.id}),
                                credentials: 'include'
                            })
                            .then( res => res.json() )
                            .then( json => console.log(json) );
                        }
                        let inputText = e.target.previousElementSibling
                        let totalValue = e.target.closest('.row-4').previousElementSibling.querySelector('p br')
                        if(json.filter(item => item.id === +e.target.dataset.id)[0].quantity > inputText.value){
                            inputText.value = parseInt(inputText.value) + 1;
                            totalValue.nextSibling.nodeValue = `${t('Total')} : ${inputText.value* parseInt(totalValue.previousSibling.nodeValue)}`
                        }
                        
                    }
                    totalPriceUpdate();
                }

                function totalPriceUpdate(){
                    let calculate = document.querySelector('#cartCalculate')
                    let total = 0;
                    let totalArr = [];
                    
                    
                    document.querySelectorAll('.row-3 p').forEach(item => {
                        totalArr.push(parseInt(item.innerText.match(/\d+/g)[0])* item.closest('.row-3').nextElementSibling.querySelector('div div input').value)
                    })
                    if(totalArr.length !== 0){
                        total = totalArr.reduce((accumulator, currentValue) => accumulator + currentValue);
                    } else {
                        total = 0;
                    }
                    
                    calculate.innerHTML = `${t("Subtotal")} : <span><b>${total}&#8382;</b></span>`
                }
                if (document.querySelector('#cartTableWrapper').getAttribute('listener') !== 'true') {
                    document.querySelector('#cartTableWrapper').addEventListener('click', cart);
                    document.querySelector('#cartTableWrapper').setAttribute('listener', 'true');
                    console.log('event listener attached')
               } else {
                   console.log('event listener already exists')
               }
               
                //document.querySelector('#cartTableWrapper').addEventListener('click', cart);
            });
            $(document).on('click', '.product-cart-con', function(p) {
                p.stopPropagation();
                let elemId = p.target.closest('div[data-product-id]').getAttribute('data-product-id')
                let filteredJson = json.filter(item => item.id == elemId)
                if(isLoggedIn()){
                    console.log('ika')
                    console.log(csrftoken)
                    let data = {action: 'add', productId: filteredJson[0].id}
                    console.log(filteredJson[0].id)
                    fetch('https://spirit.ge:8000/cart/', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        Authorization: `JWT ${localStorage.getItem('token')}`,
                        'X-CSRFToken':  csrftoken,
                        }
                    ,
                    body: JSON.stringify(data),
                    credentials: 'include',
                    })
                    .then(res => {console.log(res)})
                } else {
                    $('#paira-ajax-success-message').modal('show');
                    productPage.cartModal(filteredJson[0]);
                }
                
            });
            if(!isLoggedIn()){
                if(!sessionStorage.getItem('visited')){
                    $('#paira-welcome-newsletter').modal('show'); 
                    sessionStorage.setItem('visited', true)
                }
            }
        },
        initProductPageSort: function(json){
            document.querySelector('#product-sort').addEventListener('change', e => {
                productPage.options.sort = e.target.value;
                productPage.showProducts(productPage.filter(json), 12, 1);
            })
        },
        initProductPageClearFilter: function(){
            document.querySelector("#clearFilters").addEventListener('click', e => {
                /////////////
                window.location.hash = "";
                window.location.reload();
            })
        },
        initProductPageFilter: function(json){
            document.querySelector('#product-filter').addEventListener('change', e => {
                productPage.options.filter = e.target.value;
                productPage.showProducts(productPage.filter(json), 12, 1);
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
            pageStat.innerHTML = `${t("Showing")} : <b>${currentPage} - ${recordsPerPage}</b> ${t('Of')} <b>${json.length}</b>`;
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
        // showLoading: function() {
        //     $(".paira-loading").show()
        // },
        /***************************************************************************************
         * Hide Loading Animation
         ***************************************************************************************/
        // hideLoading: function() {
        //     $(".paira-loading").hide()
        // },
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
        showLoading: function(parentNode, color, id){
            let circleSvg = `<?xml version="1.0" encoding="utf-8"?>
            <svg id="${id}" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" style="margin: auto; display: block; shape-rendering: auto;" width="137px" height="137px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <circle cx="50" cy="50" fill="none" stroke="${color}" stroke-width="11" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
            <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
            </circle>
            </svg>`
            parentNode.insertAdjacentHTML('afterbegin', circleSvg);
    
        },
        hideLoading: function(id){
            let circleSvg = document.querySelector(`#${id}`);
            circleSvg.remove();
        }

    };

    const productWidget = document.querySelector('.product-widget');
    const brandWidget = document.querySelector('.paira-brand');

    const productModalContent = document.querySelector('.pro-content');
    let currentPage = 1;
    
    //paira.loading1();

    
    const productPage = {
        options:{
            filter: "none",
            sort: "sort-def"
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

            /////

            for(let i =0; i < paginatedJson.length; i++){
                let item = paginatedJson[i];
                product += `
                    <div class="col-sm-3 col-md-3 col-xs-6 paira-margin-top-1" data-product-id="${item.id}" >
                        <div class="product text-center" >
                            <div class="block-image position-rela">
                                <a href="#" class="paira-quick-view">
                                    <div class="background-overlay"></div>
                                    <img src="https://spirit.ge:8000/images/${item.image}" alt="IMAGE NOT FOUND" class="img-responsive"; style="display: inline-block; max-width: 265px; max-height: 426px;">
                                </a>
                            </div>
                            <h1 class="font-size-16 paira-margin-top-4 margin-bottom-10"><a href="#" class="paira-quick-view">${dbt(item.name)}</a></h1>
                            <span class="money font-size-16"><b>${item.price}</b>&#8382;</span>
                            <div class="paira-quick-view product-hover" style="cursor: pointer";>
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
            //this.hideProducts();
            let product = "";

            for(let i =0; i < jsonBrands.length; i++){
                let item = jsonBrands[i];
                product += `
                    <a href="collection.html#brand=${item.name}"><img src="https://spirit.ge:8000/images/${item.image}" " alt=""/></a>
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
                        <h4 class="raleway-light full-width text-capitalize margin-top-15">${dbt(data.name)}</h4>
                        <p class="margin-top-15 letter-spacing-2 font-size-14">
                            ${dbt(data.description)}
                        </p>
                        <div class="form-group margin-top-15 col-sm-1 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>${t('vendor')} : </b>${dbt(data.brand_id__name)}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>${t('year')} : </b>${data.year}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>${t('alcohol')} % : </b>${data.alcoholPercent}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>${t('region')} : </b>${dbt(data.region)}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>${t('type')} : </b>${dbt(data.type)}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>${t('color')} : </b>${dbt(data.color)}</h4>
                        </div>
                        <div class="form-group margin-top-15 col-sm-1 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase"><b>${t('variety')} : </b>${dbt(data.variety)}</h4>
                        </div>
                        <div class="quantity margin-top-15 display-inline-b full-width">
                            <h1 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase pull-left" style="font-size: 12px;" id="modalQuantityText"></label></h1>
                        </div>
                        <div class="quantity margin-top-15 display-inline-b half-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase pull-left"><b>${t('Quantity')} : </b></label></h4>
                            <div class=" full-width">
                                <div class="product_quantity_group product-quantity-fix">
                                    <input type="text" class="form-control text-center pull-left font-size-16" value="1" id="modalInput" style="width: 45px" disabled>
                                    <div class="up-down text-center pull-left overflow">
                                        <span class="up" data-direction="up" id="modalCounterUp"><i class="fa fa-angle-up"></i></span>
                                        <span class="down" data-direction="down" id="modalCounterDown"><i class="fa fa-angle-down"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="sub-totals margin-top-15 full-width">
                            <h4 class="font-size-14 letter-spacing-2 pull-left"><label class="text-uppercase pull-left margin-right-10"><b>${t("Subtotal")} : </b></label></h4>
                            <h4 class="money margin-left-5"><span id="modalTotalCost">0</span>&#8382;</h4>
                        </div>
                        <div class="btn-group paira-margin-top-4 full-width pull-left" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-default btn-lg btn-image addToCartModal"><img src="images/cart-3.png" alt=""></button>
                            <button type="button" class="btn btn-default btn-lg color-scheme-2 raleway-light text-uppercase addToCartModal">${t('add to cart')}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            `
        productModalContent.insertAdjacentHTML('beforeend', modalContent);
        document.querySelector(".paira-product.single-varients-product").innerHTML=`<img src="https://spirit.ge:8000/images/${data.image}" style="max-width:374px;max-height:621px;margin-left:90px;margin-top:30px"></img>`
        },
        sortByCost: function(json, by="asc"){
            let sortedJson;
            (by == "asc") ?
            sortedJson = json.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
            :
            sortedJson = json.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
            return sortedJson;
        },
        filter: function(json){

            let filter = this.options.filter;
            let sort = this.options.sort;
            let sortedJson;
            let res;

            const filterData = (data) => {
                if(filter !== "other" && filter !== "none"){
                    res = data.filter(item => {
                        return item.type.toLowerCase().includes(filter);
                    })
                }

                if(filter == "other"){
                    res = data.filter(item => {
                        return  !item.type.toLowerCase().includes("red") &&
                                !item.type.toLowerCase().includes("white") &&
                                !item.type.toLowerCase().includes("dry") &&
                                !item.type.toLowerCase().includes("sweet") &&
                                !item.type.toLowerCase().includes("semi-dry")
                    })
                }
            }



            if(sort === "sort-def"){
                if(filter === "none"){
                    return json
                }
                filterData(json)
            }    

            if(sort === "sort-asc"){
                sortedJson = this.sortByCost(json, "asc");
                if(filter === "none"){
                    return sortedJson
                }
                filterData(sortedJson)
            }
            
            if(sort === "sort-desc"){
                sortedJson = this.sortByCost(json, "desc");
                if(filter === "none"){
                    return sortedJson
                }
                filterData(sortedJson)
            }

            return res;            







            // let hasOption = item => {
            //     if(item.type !== null){
            //         if(option==="other"){
            //             return !item.type.toLowerCase().includes("red") && !item.type.toLowerCase().includes("white")
            //         }
            //         return item.type.toLowerCase().includes(option)
            //     } else {
            //         return false;
            //     }
            // }
            // return json.filter(hasOption)
           
        },
        cartModal: function(data){
            let productName = document.querySelector("#cartProductName");
            let productImage = document.querySelector("#cartProductImg");
            let productId = data.id;
            let quantity = 1

            let goToCartBtn = document.querySelector("#goToCart");

            if (data.selectedQuantity){
                quantity = data.selectedQuantity
            }

            let cartItem = { id: data.id, image: data.image, name: data.name, quantity: quantity, price: data.price };
            productImage.src = `https://spirit.ge:8000/images/${data.image}`;
            productName.innerHTML = `${data.name}`;

            
            let existing = localStorage.getItem('cartItems');


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
            

            const handleGoToCart = (e) => {
                e.stopPropagation();
                e.preventDefault();
                $("#paira-quick-view .close").click()
                $("#paira-ajax-success-message .close").click()
                $(".cart-menu-body").click()
                
            }

            ////
            if(goToCartBtn.getAttribute('listener') !== 'true'){
                goToCartBtn.setAttribute('listener', 'true');   
                goToCartBtn.addEventListener('click', handleGoToCart);
            }
           
        },
        cartCounter: function(){
            let existing = JSON.parse(localStorage.getItem('cartItems'))
            let counter = document.querySelector('#cartCounter')
            if(existing) counter.innerText = existing.length
        },
        displayCartContent: function(data){
            let cartContent = JSON.parse(localStorage.getItem('cartItems'));
            let cartItem = "";
            let cartWidget = document.querySelector('#cartTableWrapper');
            cartWidget.innerHTML = '';
            paira.showLoading(cartWidget, "#fff", 'cartWidgetLoading')
                if(isLoggedIn()){
                    fetch('https://spirit.ge:8000/cart/', {
                        method: 'GET',
                        headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        Authorization: `JWT ${localStorage.getItem('token')}`,
                        'X-CSRFToken':  csrftoken
                        }
                    })
                    .then( res => res.json() )
                    .then( json => {
                        console.log(json.items)
                        let cart = [];
                        console.log(data)
                        for(let i of data){
                            for(let i2 of json.items){
                                if(i.id === i2.product_id){
                                    cart.push({id: i.id, image: i.image, name: i.name, quantity: i2.quantity, price: i.price})
                                }
                            }
                        }

                        // if(window.location.pathname.includes("checkout")){
                        //     checkoutPage.init(cart)
                        // }

                        cart.forEach((item) => {
                            cartItem += `
                                <div class="column full-width overflow paira-margin-bottom-4 cartItem" data-id="${item.id}">
                                <div class="row-1">
                                    <a href="collection.html">
                                        <img src="https://spirit.ge:8000/images/${item.image}" alt="" class="img-responsive center-block">
                                    </a>
                                </div>
                                <div class="row-2"><p><a href="#">${item.name}</a></p></div>
                                <div class="row-3"><p>${item.price}&#8382;<br class="totalItem">Total : ${item.price}&#8382</p></div>
                                <div class="row-4">
                                    <div class="quantity">
                                        <div class="quantity-fix display-inline-b">
                                            <button class="btn-default btn" data-direction="down" id="cartDown" data-id="${item.id}"><i class="fa fa-angle-down"></i></button>
                                            <input type="text" value="${item.quantity}" class="text-center product_quantity_text" id="cartInput" data-id="${item.id}" disabled>
                                            <button class="btn-success btn" data-direction="up" id="cartUp" data-id="${item.id}"><i class="fa fa-angle-up"></i></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="row-5"><p><a href="#" class="remove"><i class="fa fa-trash fa-2x" id="removeItem" data-id="${item.id}"></i></a>
                                </p></div>
                                </div>
                            `
                        });
                        paira.hideLoading('cartWidgetLoading')
                        cartWidget.insertAdjacentHTML('beforeend', cartItem);
                    })
                
                console.log(cartContent)
                } else {
                    cartContent.forEach((item, i) => {
                        cartItem += `
                            <div class="column full-width overflow paira-margin-bottom-4 cartItem" data-id="${item.id}">
                            <div class="row-1">
                                <a href="product.html">
                                    <img src="https://spirit.ge:8000/images/${item.image}" alt="" class="img-responsive center-block">
                                </a>
                            </div>
                            <div class="row-2"><p><a href="#">${item.name}</a></p></div>
                            <div class="row-3"><p>${item.price}&#8382;<br class="totalItem">${t("Total")} : ${item.price}&#8382</p></div>
                            <div class="row-4">
                                <div class="quantity">
                                    <div class="quantity-fix display-inline-b">
                                        <button class="btn-default btn" data-direction="down" id="cartDown" data-id="${item.id}"><i class="fa fa-angle-down"></i></button>
                                        <input type="text" value="${item.quantity}" class="text-center product_quantity_text" id="cartInput" data-id="${item.id}" disabled>
                                        <button class="btn-success btn" data-direction="up" id="cartUp" data-id="${item.id}"><i class="fa fa-angle-up"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div class="row-5"><p><a href="#" class="remove"><i class="fa fa-trash fa-2x" id="removeItem" data-id="${item.id}"></i></a>
                            </p></div>
                            </div>
                        `
                    });
                    paira.hideLoading('cartWidgetLoading');
                    cartWidget.insertAdjacentHTML('beforeend', cartItem);
                }

            
            
        }
    }

    let blogCardContainer = document.querySelector('#blogCardContainer');

    

    let blogPage = {
        displayBlogCards: function(data, quantity=null){
            blogCardContainer.innerHTML="";
            let cards = "";

            const createBlogCards = (item, i) => {
                let date = new Date(item.time.split('T')[0])
                let month = date.toLocaleString('default', { month: 'short' });
                let day = date.getDate();
                cards +=`
                <div class="col-md-6 col-sm-12 col-xs-12 paira-margin-top-1">
                    <img alt="" src="https://spirit.ge:8000/images/${item.image}" class="img-responsive">
                    <div class=${(i%2 === 0) ? "blogs1" : "blogs"}>
                        <h3 class="text-uppercase margin-bottom-10">${day} ${month}</h3>
                        <h4 class="paira-margin-bottom-1"><a href="blog-single.html" class="date raleway-light letter-spacing-2">${dbt(item.tittle)}</a></h4>
                        <a href="blog-single.html#${item.id}" class="btn-border font-size-12">${t("Read More")}</a>
                    </div>
                </div>
                `
            }

            if(quantity !== null && data.length !== quantity){
                blogCardContainer.insertAdjacentHTML('afterend',`
                <div class="col-md-12 col-sm-12 col-xs-12 text-capitalize text-center paira-margin-top-3">
                    <div class="see-more">
                        <a href="#" class="btn-border font-size-14" data-lang="see more" id="moreseeid">See More</a>
                    </div>
                </div>
                `)
                document.querySelector('#moreseeid').addEventListener('click', e => {
                    data = data.slice(quantity, 2*quantity);
                    console.log(data)
                    // data.forEach((item,i) => {
                    //     createBlogCards(item, i);
                    // })
                })
            }

            data.forEach((item,i) => {
                createBlogCards(item, i);
            })
            blogCardContainer.insertAdjacentHTML('afterbegin', cards)
        },
        displayBlog: function(json){
            let data = json.blog
            console.log('CURRENT PAGE IS ')
            let page = (+window.location.hash.substring(1)) ? +window.location.hash.substring(1) : 1;
            let currentPage;
            let filteredJson = data.filter( (item,i) => {
                    if(item.id === page){
                        currentPage = i;
                        return true;
                    }
                });
            let prev = document.querySelector("#prevBtn");
            let next = document.querySelector("#nextBtn");
            let blogContainer = document.querySelector('#singleBlogContainer');
            console.log(filteredJson[0])
            let date = new Date(filteredJson[0].time.split('T')[0])
            let month = date.toLocaleString('default', { month: 'short' });
            let day = date.getDate();


            

            blogContainer.innerHTML="";
            let blogContent = `
            <div class="col-md-12 col-sm-12 col-xs-12 paira-margin-top-1">
                <img alt="" src="https://spirit.ge:8000/images/${filteredJson[0].image}" class="img-responsive margin-bottom-20">
                <div class="blogs-detail">
                    <h3 class="text-uppercase margin-top-0 margin-bottom-20">${day} ${month}</h3>
                    <h1 class="margin-bottom-20 date letter-spacing-2">${dbt(filteredJson[0].tittle)}</h1>
                    <p class="margin-bottom-20 letter-spacing-2 margin-bottom-0">
                        ${dbt(filteredJson[0].content)}
                    </p>
                </div>
            </div>
            `
            blogContainer.insertAdjacentHTML('afterbegin', blogContent)
            
                

            console.log(currentPage)
            next.addEventListener('click', e => {
                if(data.length-1 !== data.indexOf(data[currentPage])){
                    window.location.hash = `#${data[currentPage + 1].id}`
                } else {
                    window.location.hash = `#${data[0].id}`
                }
                window.location.reload()
            })
            prev.addEventListener('click', e => {
                if(0 !== data.indexOf(data[currentPage])){
                    window.location.hash = `#${data[currentPage - 1].id}`
                } else {
                    window.location.hash = `#${data[data.length-1].id}`
                }
                window.location.reload()
            })
            
        },
        displayComments: function(data){
            let commentSection = document.querySelector('#commentContainer');
            let page = +window.location.hash.substring(1);
            commentSection.innerHTML = "";
            let commentsJson = data.filter(item => item.blog === page);
            let comment = "";
            
            console.log(commentsJson)
            commentsJson.forEach(item => {
                
                comment += `
                <div class=" col-md-12 col-sm-12 col-xs-12 paira-margin-top-4">
                    <p class="raleway-sbold">${item.username__name}</p>
                    <p class="margin-top-10">${item.comment}</p>
                </div>
                `      
            })
            commentSection.insertAdjacentHTML('afterbegin', comment);
        },
        leaveComment: function(data){
            let comment = document.querySelector('#commentArea')
            let sendBtn = document.querySelector('#sendCommentBtn')

            let page = +window.location.hash.substring(1);
            
            sendBtn.addEventListener('click', e => {
                e.preventDefault();

                let filteredJson = data.filter(item => item.id === page)

                

                let commentJson = {
                    comment: comment.value,
                    blog: filteredJson[0].id
                }

                console.log(commentJson)

                fetch('https://spirit.ge:8000/blog_comment/', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        Authorization: `JWT ${localStorage.getItem('token')}`,
                        'X-CSRFToken':  csrftoken
                        },
                        body: JSON.stringify(commentJson)
                    })
                    .then( resp => console.log(resp))
                    .then( json => console.log(json));

                
            })
        }
    }

    let checkoutPage = {
        init: function(data){
            
            let orderList = document.querySelector("#orderListTable");
            let table = "";
            let orderCalculateTotal = document.querySelector('#orderCalculateTotal');
            let total = 0;
            let customerName = document.querySelector('input[id="orderCustomerName"]');
            let customerPhone = document.querySelector('input[id="orderCustomerPhone"]');
            let customerAddress = document.querySelector('input[id="orderCustomerAddress"]');
            let checkbox = document.querySelector('#invalidCheck');
            let orderBtn = document.querySelector('#placeOrder');
            let checkoutForm = document.querySelector('#checkoutForm');
            let errorMsg = document.querySelector("#errorMsg");
            
            

            let printErrorMsg = (text) => {
                errorMsg.innerText += text
            }
            console.log('lol')
            if(!isLoggedIn()){
                console.log('lol')
                let cartItems = JSON.parse(localStorage.getItem('cartItems'));
                let orderData = { "shipping": { first_last_name: "", phone: "", address: "" }, order: [], language: ""}
                cartItems.forEach( item => {
                    console.log(item)
                    table += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price}</td>
                    </tr>
                    `
                    total += item.quantity * item.price;
                    orderData.order.push({ product_id: item.id, quantity: item.quantity });
                })
                orderList.insertAdjacentHTML('afterbegin', table)
                orderCalculateTotal.innerText = total;
                

                
                
            
                

                let handleFormData = (e) => {
                    e.preventDefault();
                    let valid = true;
                    errorMsg.innerText = "";
                    let i = 0;
                    document.querySelectorAll('#checkoutForm input').forEach(x =>{
                        console.log(i++)
                        if(x !== checkbox) x.removeAttribute('style');
                        switch(x){
                            case customerName:
                                if(x.value === ""){
                                    valid = false;
                                    x.removeAttribute('style');
                                    x.style.border = "1px solid red"
                                    printErrorMsg(t("* Please, enter your name\n"));
                                }
                                break;
                            case customerPhone:
                                if(x.value === ""){
                                    valid = false;
                                    x.style.border = "1px solid red"
                                    printErrorMsg(t("* Please, enter your phone\n"));
                                }
                                break;
                            case customerAddress:
                                if(x.value === ""){
                                    valid = false;
                                    x.style.border = "1px solid red"
                                    printErrorMsg(t("* Please, enter your address\n"));
                                }
                                break;
                            case checkbox:
                                if(!x.checked){
                                    valid = false;
                                    printErrorMsg(t("* You must agree to our terms and conditions\n"))
                                }
                                break;
                                
                        }
                    })
                    console.log(csrftoken)

                    if(valid){
                        orderData["shipping"].first_last_name = customerName.value;
                        orderData["shipping"].phone = customerPhone.value;
                        orderData["shipping"].address = customerAddress.value;
                        orderData.language = localStorage.getItem('language') ? localStorage.getItem('language') : "en";
                        console.log(JSON.stringify(orderData))
                        orderBtn.setAttribute('disabled', true)
                        fetch('https://spirit.ge:8000/buy_process_unregistred', {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'X-CSRFToken':  csrftoken
                            },
                            body: JSON.stringify(orderData)
                        })
                        .then( res => {
                            if(!res.ok) printErrorMsg("Something went wrong, please try again later" + ` (Status Code: ${res.status}, Status Text: ${res.statusText})`)
							return res.json()
                        })
						.then(json => {
							window.location.href = json.link;
						})
                        .finally( res => orderBtn.removeAttribute('disabled') )
                    }
                }

                if(!orderBtn.getAttribute('listener')){
                    orderBtn.addEventListener('click', handleFormData);
                    orderBtn.setAttribute('listener', 'true');
                }
                
            }

            if(isLoggedIn()){
                let phoneDropdownContainer = document.querySelector("#dropdownMenu1Container")
                let addressDropDownContainer = document.querySelector("#dropdownMenu2Container")
                let addressInput = document.querySelector('input[id="addNewAddress"]')
                let phoneInput = document.querySelector('input[id="addNewPhone"]')
                let addAddressBtn = document.querySelector('#addNewAddressBtn')
                let addPhoneBtn = document.querySelector('#addNewPhoneBtn')
                let phoneDropdownBtn = document.querySelector('#dropdownMenu1')
                let addressDropdownBtn = document.querySelector('#dropdownMenu2')


                // add form
                let addNameInput = document.querySelector('#addNewName')
                let addAddressInput = document.querySelector('#addNewAddress');
                let addPhoneInput = document.querySelector('#addNewPhone');
                let addButton = document.querySelector('#addNewInfo')

                let arr = [1, 2, 3, 4]


                // address + button
                // addAddressBtn.addEventListener('click', e => {
                //     if(addressInput.value !== ""){
                    //     fetch('https://spirit.ge:8000/address/', {
                    //         method: 'POST',
                    //         headers: {
                    //             'Content-Type': 'application/json;charset=utf-8',
                    //             Authorization: `JWT ${localStorage.getItem('token')}`,
                    //             'X-CSRFToken':  csrftoken,
                    //         },
                    //         body: JSON.stringify({action: 'add', info: { address: addressInput.value, phone: null, first_last_name: null } })
                    //     })
                    //     console.log('done')
                    // }
                // })

                addButton.addEventListener('click', e => {
                    if(addNameInput.value !== "" && addAddressInput.value !== "" && addPhoneInput.value !== ""){
                        fetch('https://spirit.ge:8000/address/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8',
                                Authorization: `JWT ${localStorage.getItem('token')}`,
                                'X-CSRFToken':  csrftoken,
                            },
                            body: JSON.stringify({action: 'add', info: { address: addAddressInput.value, phone: addPhoneInput.value, first_last_name: addNameInput.value } })
                        })
                    }
                })

                

                let initDropdownListButtons = (listButtons=".address-list", deleteButtons=".address-delete") => {
                    document.querySelectorAll(listButtons).forEach(item => item.addEventListener('click', e => {
                        console.log('what?')
                        addressDropdownBtn.setAttribute('value', `${item.getAttribute('value')}`)
                        addressDropdownBtn.innerText = item.getAttribute('value');
                    }))
    
                    document.querySelectorAll(deleteButtons).forEach(item => item.addEventListener('click', e => {
                        console.log(item.previousSibling.getAttribute('value'))
                        console.log(`action delete ${item.previousSibling.getAttribute('data-address-id')}`)
                        fetch('https://spirit.ge:8000/address/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8',
                                Authorization: `JWT ${localStorage.getItem('token')}`,
                                'X-CSRFToken':  csrftoken,
                            },
                            body: JSON.stringify({ action: 'delete', info: { id: item.previousSibling.getAttribute('data-address-id') } })
                        })
                        console.log('done')
                    }))
                }
                printErrorMsg('test')
                // shipping details
                // arr.forEach((item,i) => addressDropDownContainer.innerHTML += `
                // <span style="width: 100%; display: flex;"><a value="${item}" class="dropdown-item text-color-1 address-list" style="cursor: pointer" data-address-id="${i}" >${item}</a><i class="fa fa-times dropdown-icon address-delete"></i></span>
                // `)
                ///////////////////////////////////////////////
                addressDropdownBtn.addEventListener('click', e => {
                    document.querySelector('body').style.cursor = "wait"
                    fetch('https://spirit.ge:8000/address/', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            Authorization: `JWT ${localStorage.getItem('token')}`,
                            'X-CSRFToken':  csrftoken
                        }
                    })
                    .then(res => res.json())
                    .then(json => {
                        addressDropDownContainer.innerHTML = ""
                        json.items.forEach((item,i) => addressDropDownContainer.innerHTML += `
                        <span style="width: 100%; display: flex;"><a value="${item.address}" class="dropdown-item text-color-1 address-list" style="cursor: pointer" data-address-id="${item.id}" >${item.first_last_name}/${item.address}/${item.phone}</a><i class="fa fa-times dropdown-icon address-delete"></i></span>`
                        )
                        initDropdownListButtons()
                        document.querySelector('body').style.cursor = "default"
                    })
                })

                orderBtn.addEventListener('click', e => {
                    fetch('https://spirit.ge:8000/buy_process', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8',
                                Authorization: `JWT ${localStorage.getItem('token')}`,
                                'X-CSRFToken':  csrftoken,
                            },
                            body: JSON.stringify({ "shipping": { id: "3" }, language: localStorage.getItem('language') ? localStorage.getItem('language') : "en" })
                        })
                        .then(res => res.json())
                        .then(json => window.location.href = json.link)
                    
                })
                // document.querySelectorAll('.address-list').forEach(item => item.addEventListener('click', e => {
                //     console.log('what?')
                //     addressDropdownBtn.setAttribute('value', `${item.getAttribute('value')}`)
                //     addressDropdownBtn.innerText = item.getAttribute('value');
                // }))

                // document.querySelectorAll('.address-delete').forEach(item => item.addEventListener('click', e => {
                //     console.log(item.previousSibling.getAttribute('value'))
                // }))

                let registeredFrom = document.querySelector("#registeredUserForm")
                let nonRegisteredForm = document.querySelector("#nonRegisteredForm")
                nonRegisteredForm.innerHTML = "";
                registeredFrom.setAttribute('style', 'display: block');


                let cartItems = data
                console.log(data)
                
                cartItems.forEach( item => {
                    table += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price}</td>
                    </tr>
                    `
                    total += item.quantity * item.price;
                })
                orderList.insertAdjacentHTML('afterbegin', table)
                orderCalculateTotal.innerText = total;
                
                // $(".dropdown-toggle").dropdown('hide')
                // fetch('https://spirit.ge:8000/buy_process', {
                //     method: 'GET',
                //     headers: {
                //     'Content-Type': 'application/json;charset=utf-8',
                //     Authorization: `JWT ${localStorage.getItem('token')}`,
                //     'X-CSRFToken':  csrftoken
                //     }
                // })
                // .then( res => res.json() )
                // .then( res => console.log(res))
            }
        
        }
    }

    let resetPassword = {
        init: function(){
            let emailInput = document.querySelector("#resetPasswordInput");
            let sendBtn = document.querySelector("#resetSend");
            let message = document.querySelector("#resetMsgText");
            let password = document.querySelector("#newPasswordReset");
            let repeatPassword = document.querySelector("#repeatNewPasswordReset")

            let url = window.location.hash.substring(1).includes('token=');
            
            const printMsg = (msg) => {
                message.innerText = msg;
            } 
            console.log(url)
            if(!url){
                sendBtn.addEventListener('click', e => {
                    
                    if(emailInput.value !== ""){
                        
                        fetch('https://spirit.ge:8000/api/password_reset/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8',
                            },
                            body: JSON.stringify({email: emailInput.value})
                        })
                        .then(res => {
                            if(!res.ok){
                                printMsg(t('Something went wrong, please try again later'))
                            }
                            return res.json();
                        })
                        .then(json => {
                            let checkEmail = json.email ? json.email[0] : ""
                            if(checkEmail === "There is no active user associated with this e-mail address or the password can not be changed"){
                                printMsg(t('There is no active user associated with this e-mail address or the password can not be changed'))
                            }////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                            if(checkEmail === "Enter a valid email address."){
                                printMsg(t('Enter a valid email address'))
                            }
                            if(json.status === "OK"){
                                printMsg(t('Please check your email to change your password'))
                            }
                        })
                    } else {
                        printMsg(t('Please, enter your email'))
                    }
                })
            }
            

            if(url){
                let token = window.location.hash.substring(1).split("=")[1]
                emailInput.parentElement.style = "display: none;"
                password.parentElement.style = "display: block;"

                sendBtn.addEventListener('click', e => {
                    
                    if(password.value !== "" && password.value === repeatPassword.value){
                        fetch('https://spirit.ge:8000/api/password_reset/confirm/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                        },
                        body: JSON.stringify({password: password.value, token: token})
                        })
                        .then(res => {
                            if(!res.ok){
                                printMsg(t('Something went wrong, please try again later'))
                            }
                            return res.json()
                        })
                        .then(json => console.log(json))    
                    } else {
                        printMsg(t('Passwords must match'))
                    }
                    
                })
            }


        }
    }


    // reset-password page
    if(window.location.pathname.includes("reset-password")){
        resetPassword.init()
    }

    // blog page
    if (window.location.href.includes("blog.html") || window.location.href.includes("index.html")){
        paira.showLoading(blogCardContainer, "#000", 'blogCardContainerLoading');
        fetch('https://spirit.ge:8000/blog/')
        .then(resp => resp.json())
        .then(json => {
            //console.log(json.blog)
            paira.hideLoading('blogCardContainerLoading');
            blogPage.displayBlogCards(json.blog);
        })
    }
    // single blog page
    if (window.location.href.includes("blog-single.html")){
        paira.showLoading(document.querySelector('#singleBlogContainer'), '#000', 'singleBlogLoading');
        fetch('https://spirit.ge:8000/blog/')
        .then(resp => resp.json())
        .then(json => {
            paira.hideLoading('singleBlogLoading');
            console.log(json)
            blogPage.displayBlog(json);
            blogPage.displayComments(json.comments);
            blogPage.leaveComment(json.blog);
        })
        
    }
    
    // show products
    if (document.querySelector('.product-widget') != null || undefined){
        paira.showLoading(document.querySelector('.product-widget'), '#000', 'productsLoading');
        fetch('https://spirit.ge:8000/wineproduct/?wine=test')
        .then(resp => {
            resp.json()
            .then(data => {
                paira.hideLoading('productsLoading');
                productPage.showProducts(data.menu, 12, 1);
                paira.initDialogBox(data.menu);

                if (window.location.href.includes("collection.html")){
                    if(window.location.hash.substring(1).split("=")[0] === "search"){
                        let searchVal = decodeURI(window.location.hash.substring(1).split("=")[1]);
                        console.log(searchVal)
                        let filteredJson = data.menu.filter( item => item.name.toLowerCase().includes(searchVal.toLowerCase()));
                        productPage.showProducts(filteredJson, 12, 1)
                    }
                    if(window.location.hash.substring(1).split("=")[0] === "brand"){
                        let searchVal = decodeURI(window.location.hash.substring(1).split("=")[1]);
                        console.log(searchVal)
                        let filteredJson = data.menu.filter( item => item.brand_id__name.toLowerCase().includes(searchVal.toLowerCase()));
                        productPage.showProducts(filteredJson, 12, 1)
                    }
                    if(window.location.hash.substring(1).split("=")[0] === "id"){
                        let searchVal = decodeURI(window.location.hash.substring(1).split("=")[1])
                        console.log(searchVal)
                        let filteredJson = data.menu.filter( item => item.id === +searchVal )
                        productPage.showProducts(filteredJson, 12, 1)
                    }
                    if(window.location.hash.substring(1).split("=")[0] === "type"){
                        let searchVal = decodeURI(window.location.hash.substring(1).split("=")[1]);
                        console.log(searchVal)
                        let filteredJson = data.menu.filter( item => item.type.toLowerCase().includes(searchVal.toLowerCase()));
                        productPage.showProducts(filteredJson, 12, 1)
                    }
                    paira.initProductPagination(data.menu, 1, 12);
                    paira.initProductPageSort(data.menu);
                    paira.initProductPageFilter(data.menu);
                    paira.initProductPageClearFilter();
                }
                console.log(productPage.state)
            })
        })
        .catch(function(error){
            console.log(error)
        });
    } else {
        fetch('https://spirit.ge:8000/wineproduct/?wine=test')
        .then(resp => resp.json())
        .then(data => {
            paira.initDialogBox(data.menu);
            if(window.location.pathname.includes('checkout')){
                loadCheckoutPage(data.menu);
            }
        })  
    }

    // show brands
    if ( document.querySelector('.paira-brand') != null ) {
        paira.showLoading(document.querySelector('.paira-brand'), '#000', 'brandCarLoading');
        fetch('https://spirit.ge:8000/brandlist/').then(resp => {
        resp.json()
        .then(data => {
            paira.hideLoading('brandCarLoading')
            productPage.showBrands(data.menu);
            console.log(data.menu)
            paira.initOwlCarousel();
            console.log("doneCar")
            // paira.initDialogBox(data.menu);
        })
        })
    }
    // show banner 
    if( document.querySelector('.carousel-inner')){
        console.log('started showbanner')
        fetch('https://spirit.ge:8000/banners/')
        .then(res => res.json())
        .then(json => showBanner(json))
        

        function showBanner(data){
            let banner = document.querySelector('.carousel-inner');
            let bannerDots = document.querySelector('.carousel-indicators');
            let bannerContent = "";
            let dotsContent = "";

            banner.innerHTML = "";
            bannerDots.innerHTML = "";
            
            // <h1 class="text-uppercase paira-animation animated fadeInRight" data-paira-animation="fadeInLeft" data-paira-animation-delay="0.1s">${text[1]}</h1>
            // <h1 class="text-uppercase paira-animation animated fadeInRight" data-paira-animation="fadeInLeft" data-paira-animation-delay="0.2s">${text[2]}</h1>


            
            data.forEach((item,i) => {
                let text = item.text.split(' '); 
                bannerContent += `
                <div class="item ${i === 0 ? "active": ""}">
                    <img alt="Third slide" src="https://spirit.ge:8000/images/${item.img}">
                    <div class="container">
                        <div class="carousel-caption carousel-caption1">
                            <h1 class="text-uppercase paira-animation animated fadeInRight margin-top-0" data-paira-animation="fadeInLeft" data-paira-animation-delay="0.0s">${text[0]}</h1>
                            <a href=collection.html#id=${item.product_id} class="btn-border margin-top-20 paira-animation animated fadeInRight" data-paira-animation="fadeInLeft" data-paira-animation-delay="0.3s">Shop Now</a>
                        </div>
                    </div>
                </div>
                `
                dotsContent += `
                <li data-target="#carousel" data-slide-to="${i}" class="${i === 0 ? "active": ""}"></li>
                `
            })
            banner.insertAdjacentHTML('afterbegin', bannerContent);
            bannerDots.insertAdjacentHTML('afterbegin', dotsContent);
        }

        console.log('done showbanner')
    }
   //show blog
        //    fetch('https://spirit.ge:8000/blog/')
        //     .then(resp => resp.json())
        //     .then(json => {

        //     })


    // * checkout

    let orderHistoryPage = {
        init: function(data){
            let deliveredCardWrapper = document.querySelector("#orderHistoryDeliveredCardWrapper");
            let notDeliveredCardWrapper = document.querySelector("#orderHistoryNotDeliveredCardWrapper");
            let isDelivered;

            data.forEach(item => {
                isDelivered = item.complete
                if(!isDelivered) deliveredCardWrapper.insertAdjacentHTML('afterbegin', this.createCards(item));
                if(isDelivered) notDeliveredCardWrapper.insertAdjacentHTML('afterbegin', this.createCards(item));
            })
        },
        createCards: function(item){
            let cards = ""
            
            
            cards += `
            <li class="list-group-item">
                <div class="order-header">
                    <div class="order-id">${t("Order No.")}
                        <span class="order-number">
                            ${item.id}
                        </span>
                    </div>
                    <div class="order-status-container">${t("Status")}:
                        <span class="${item.complete ? "order-status-delivered": "order-status"}">
                            ${item.complete ? t("Delivered") : t("Ongoing")}
                        </span>
                    </div>
                </div>
                <div class="order-items-container">
                    <div class="container">
                        <div class="row columns">
                            <div class="col-xs-5">${t("Item Name")}</div>
                            <div class="col-xs-3">${t("Quantity")}</div>
                            <div class="col-xs-4">${t("Price")}</div>
                        </div>
                    </div>
                    <div class="container">
                        ${this.createProductList(item)}
                    </div>
                </div>
                <div class="order-footer">
                    <div class="order-date">
                        ${t("Ordered on")}:
                        <span>
                            ${item.date_order.split("T")[0]}
                        </span>
                    </div>
                    <div class="order-total-price">
                        ${t("Total Price")}:
                        <span>${item.total_price}</span>
                    </div>
                </div>
            </li>
            `
            return cards;
        },
        createProductList: function(data){
            let productList = '';
            data.order_products.forEach(item => {
                productList += `
                <div class="row item">
                    <div class="col-xs-5">${item.product__name}</div>
                    <div class="col-xs-3">${item.quantity}</div>
                    <div class="col-xs-4">${item.product__price}</div>
                </div>
                `
            })
            return productList;
        }
        
    }


    if(window.location.pathname.includes("order-history")){
        paira.showLoading(document.querySelector('#orderHistoryDeliveredCardWrapper'), "#000", "deliveredCardsLoading");
        paira.showLoading(document.querySelector('#orderHistoryNotDeliveredCardWrapper'), "#000", "notDeliveredCardsLoading");
        fetch('https://spirit.ge:8000/history/', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: `JWT ${localStorage.getItem('token')}`,
            'X-CSRFToken':  csrftoken
            }
        })
        .then(res => res.json())
        .then(json => {
            paira.hideLoading("deliveredCardsLoading");
            paira.hideLoading("notDeliveredCardsLoading");
            orderHistoryPage.init(json)
        })
    }

    let loadCheckoutPage = (data) => {
        if(isLoggedIn()){
            fetch('https://spirit.ge:8000/cart/', {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Authorization: `JWT ${localStorage.getItem('token')}`,
                'X-CSRFToken':  csrftoken
                }
            })
            .then( res => res.json() )
            .then( json => {
                console.log(json.items)
                let cart = [];
                for(let i of data){
                    for(let i2 of json.items){
                        if(i.id === i2.product_id){
                            cart.push({id: i.id, image: i.image, name: i.name, quantity: i2.quantity, price: i.price})
                        }
                    }
                }
                checkoutPage.init(cart)
            })
        }
        if(!isLoggedIn()){
            checkoutPage.init()
        }
    }

    









// i18n object

    const geo = {
        "index":{
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //index specific
            "see more": "მეტის ნახვა",
            "featured brands": "პარტნიორი ბრენდები",
            "instagram": "ინსტაგრამი",
            "latest blog": "უახლესი ბლოგები",
            //modals
            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
            //newsletter
            "require 18": "ჩვენ გვსურს დავრწმუნდეთ, რომ ყველა მყიდველი მინიმუმ 18 წლიაა",
            "are you 18": "ხართ 18+ წლის?",
            "illegal age": "საიტის მოხმარებისთვის, თქვენ უნდა იყოთ მინიმუმ 18 წლის",
            "18-": "სამწუხაროდ თქვნთვის საიტზე შემოსვლა აკრძალულია. ჩვენ გვაქვს ასაკის შეზღუდვა.",
            "yes": "კი",
            "no": "არა",
        },
        "shop":{
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            // shop specific
            "products": "პროდუქტები",
            "shop": "მაღაზია",
            "home": "მთავარი",
            // filter
            "filter by": "გაფილტრვა: ",
            "no filter": "უფილტრო",
            "red wine": "წითელი ღვინო",
            "white wine": "თეთრი ღვინო",
            "dry wine": "მშრალი ღვინო",
            "sweet wine": "ტკბილი ღვინო",
            "semi-dry wine": "ნახევრად მშრალი",
            "other": "სხვა",
            // sort
            "sort by": "დაწყობა: ",
            "not sorted": "დაუწყობელი",
            "asc": "\uf176 ზრდით",
            "desc": "\uf175 კლებით",
            //pagination
            "prev": "წინა",
            "next": "მომდევნო",
            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "blog":{
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //blog specific
            "home": "მთავარი",
            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "contact": {
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //contact specific
            "home": "მთავარი",
            "get in touch": "შეგვეხმიანეთ",
            "email": "ელ.ფოსტა:",
            "phone": "ტელეფონი:",
            "instagram": "ინსტაგრამი:",
            "facebook": "ფეისბუკი:",

            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "blog-single": {
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //contact specific
            "home": "მთავარი",
            "prev post": "წინა პოსტი",
            "next post": "მომდევნო პოსტი",
            "comments": "კომენტარები",
            "comment": "კომენტარი",
            "leave a comment": "კომენტარის გაკეთება",
            "send comment": "კომენტარის გაგზავნა",

            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "register": {
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //contact specific
            "home": "მთავარი",
            "register": "რეგისტრაცია",
            "create an account": "ანგარიშის შექმნა",
            "first name": "სახელი",
            "last name": "გვარი",
            "email": "ელ.ფოსტა",
            "username": "მომხ. სახელი",
            "password": "პაროლი",

            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "checkout": {
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //contact specific
            "home": "მთავარი",
            "item": "პროდუქტი",
            "quantity": "რაოდენობა",
            "price": "ღირებულება",
            "order details": "შეკვეთის დეტალები",
            "first & last name": "სახელი & გვარი",
            "address": "მისამართი",
            "i agree": "ვეთანხმები",
            "phone": "ტელ. ნომერი",
            "terms and conditions": "წესებს და პირობებებს",
            "place order": "შეკვეთის გაკეთება", 
            "select order details": "აირჩიეთ შეკვეთის დეტალები",
            "select": "არჩევა",
            "or": "ან",
            "add new address": "დაამატეთ ახალი მისამართი",
            "add": "დამატება",
            "address": "მისამართი",
            "phone": "ტელეფონის ნომერი",
            "first & last name": "სახელი, გვარი",
            "fill all": "გთხოვთ შეავსოთ ყველა ველი",
            "choose": "აირჩიეთ სასურველი შეკვეთის დეტალები",
            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "order-history": {
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //contact specific
            "home": "მთავარი",
            "history": "ისტორია",
            "ongoing orders": "მიმდინარე შეკვეთები",
            "delivered orders": "მიტანილი შეკვეთები",
            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "dynamic": {
            //ee
            "Welcome back": "კეთილი იყოს თქვენი დაბრუნება",
            "Read More": "მეტის წაკითხვა",
            "Total": "სულ",
            "Subtotal": "სულ",
            "vendor": "მწარმოებელი",
            "year": "წელი",
            "alcohol": "ალკოჰოლის",
            "region": "რეგიონი",
            "type": "ტიპი",
            "color": "ფერი",
            "variety": "ჯიში",
            "Quantity": "რაოდენობა",
            "Username & password fields are blank": "მომხმარებლის სახელის და პაროლის ველი ცარიელია",
            "Username field is blank": "მომხმარებლის სახელის ველი ცარიელია",
            "Password field is blank": "პაროლის ველი ცარიელია",
            "add to cart": "კალათაში დამატება",
            "Your password & username is wrong!": "თქვენი პაროლი ან მომხმარებლის სახელი არასწორია!",
            "Log Out": "ანგარიშიდან გამოსვლა",
            "Unfortunately, required quantity is out of stock": "სამწუხაროდ ეს ღვინო მოთხოვნილ რაოდენობაში არ გვაქ",
            "Order No.": "შეკვეთის ნომერი",
            "Status": "სტატუსი",
            "Ordered on": "შეკვეთა გაკეთდა",
            "Total Price": "სრული ღირებულება",
            "Price": "ფასი",
            "Item Name": "პროდუქტის სახელი",
            "Ongoing": "მიმდინარე",
            "Delivered": "მიტანილი",
            "Please, check your mail to reset your password": "გთხოვთ შეამოწმოთ თქვენი ელ.ფოსტა რათა შეცვალოთ პაროლი",
            'Something went wrong, please try again later': "დაფიქსირდა ხარვეზები, გთხოვთ ცადოთ მოგვიანებით",
            'Passwords must match': "პაროლები უნდა ემთხვეოდეს",
            "* Please, enter your name\n": "* გთხოვთ შეიყვანოთ სახელი\n",
            "* Please, enter your phone\n": "* გთხოვთ შეიყვანოთ ტლეფონის ნომერი\n",
            "* Please, enter your address\n": "* გთხოვთ შეიყვანოთ მისამართი\n",
            "* You must agree to our terms and conditions\n": "* თქვენ უნდა დათანმხდეთ ჩვენ წესებს და პირობებს\n",
            "Showing": "ნახულობთ",
            "Of": ", რაოდენობა:",
            "Please check your email to activate your account": "გთხოვთ შეამოწმეთ თქვენი ელ.ფოსტა რათა გააქტიუროთ ანგარიში",
            "There is no active user associated with this e-mail address or the password can not be changed": "მითითებულ ელ.ფოსტაზე მომხმარებელი არ არსებობს ან პაროლის შეცვლა შეუძლებელია",
            'Enter a valid email address': "შეიყვანეთ ვალიდური ელ.ფოსტა",
            "Please check your email to change your password": "გთხოვთ შეამოწმოთ თქვენი ელ.ფოსტა "
        },
        "404": {
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //contact specific
            "home": "მთავარი",
            "page not found": "გვერდი ვერ მოიძებნა",
            "sorry not found": "სამწუხაროდ თქვენი გვერდი ვერ მოიძებნა",
            "go back": "გთხოვთ დაბრუნდეთ უკან",
            "shop now": "დაიწყე შოპინგი",
            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        },
        "reset-password": {
            // navbar
            "shop": "მაღაზია",
            "blog": "ბლოგი",
            "contact": "დაგვიკავშირდით",
            "login/register": "ავტორიზაცია/რეგისტრაცია",
            "latest product": "ახალი პროდუქცია",
            //contact specific
            "home": "მთავარი",
            "create new pass": "შექმენით ახალი პაროლი",
            "email": "ელ.ფოსტა",
            "new password": "ახალი პაროლი",
            "repeat password": "გაიმეორეთ პაროლი",
            "send": "გაგზავნა",
            "cancel": "შეწყვეტა",
            "or": "ან",
            "reset password": "პაროლის აღდგენა",
            //login
            "customer login": "მომხმარებლის ავტორიზაცია",
            "forget password": "დაგავიწყდათ პაროლი?",
            "login": "ავტორიზაცია",
            "new customer": "ახალი მომხმარებელი",
            "register": "რეგისტრაცია",
            //cart
            "shopping cart": "სასყიდლების კალათა",
            "subtotal": "სულ:",
            "Shipping/tax": "მიტანის & გადასახადების დაანგარიშება შეკვეთისას",
            "continue shopping": "ყიდვების გაგრძელება",
            "checkout": "შეკვეთა",
        }

    }
    
    const t = (text) => {
        if(localStorage.getItem('language') === 'ge' && localStorage.getItem('language') !== null){
            return geo['dynamic'][text];
        } else {
            return text;
        }
    }




    const handleLanguageChange = (e) => {
        let currentPath = window.location.pathname;
        let language = document.querySelector('.navbar-language-container').querySelector(".navbar-language-change");

        const handlePageTranslation = page => {
            document.querySelectorAll('*[data-lang]').forEach(item => {
                item.innerText = geo[page][`${item.getAttribute('data-lang')}`]; 
            })
        } 


        if(language){
            switch(currentPath){
                case "/":
                case "/index.html":
                    handlePageTranslation("index");
                    break;
                case "/collection.html":
                    handlePageTranslation("shop");
                    break;
                case "/blog.html":
                    handlePageTranslation("blog");
                    break;
                case "/blog-single.html":
                    handlePageTranslation("blog-single");
                    break;
                case "/contact.html":
                    handlePageTranslation("contact");
                    break;
                case "/register.html":
                    handlePageTranslation("register");
                    break;
                case "/checkout.html":
                    handlePageTranslation("checkout");
                    break;
                case "/order-history.html":
                    handlePageTranslation("order-history");
                    break;
                case "/404.html":
                    handlePageTranslation("404");
                    break;
                case "/reset-password.html":
                    handlePageTranslation("reset-password");
                    break;
            }

            language.classList.add('navbar-language-change-ge');
            language.classList.remove('navbar-language-change');
            language.nextElementSibling.innerText = "EN";

            localStorage.setItem('language', 'ge')

        } else {
            window.location.reload();
            localStorage.setItem('language', 'en')
        }

    }

    document.querySelector('.navbar-language-container').addEventListener('click', (e) => handleLanguageChange(e) );
    if(localStorage.getItem('language') === 'ge' && localStorage.getItem('language') !== null){
        handleLanguageChange();
    }

    if(isLoggedIn()){
        let userSection = `
        <section class="breadcrumb-container paira-padding-bottom-1" id="userSection">
            <div class="container">
                <div class="row">
                    <div class="col-md-12 text-center" style="font-size:16px;">
                    ${t("Welcome back")}, <a href="order-history.html"><i class="fa fa-user-circle" aria-hidden="true" style="margin-right:3px;"></i><b>${sessionStorage.getItem('username')}</b></a>!
                    </div>
                </div>
            </div>
        </section>
        `
        document.querySelector('#loginBtn').remove()
        document.getElementsByTagName('main')[0].insertAdjacentHTML('afterBegin', userSection)
        document.querySelector('#loginContainer').innerHTML = `<a href="#" id="logOutBtn">${t("Log Out")}</a>`

        document.querySelector('#logOutBtn').addEventListener('click', e => {
            localStorage.removeItem('token');
            sessionStorage.setItem('logged_in' ,"false")
            sessionStorage.setItem('username' ,"")
            location.reload();
        })
        
    }

    
    

}(window.jQuery, window, document));
/**********************************************************************************************
 * The global jQuery object (window.jQuery, window, document) is passed as a parameter
 **********************************************************************************************/
