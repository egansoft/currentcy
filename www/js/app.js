// Ionic Starter App



// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
Parse.initialize("pelE80NCz6F6CzySUtgXspDGXVEm6rA4MDThhLCM", "0OoJKprEh2IIxF81RlbwLZzHQjQqdMTLvOP0xVXT");

// the cool shit goes here
var getFrom
var myLoc
var getCharger = function() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var geoPoint = new Parse.GeoPoint({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
        myLoc = {
            _latitude: position.coords.latitude,
            _longitude: position.coords.longitude
        }
        console.log("position", position)

        var query = new Parse.Query("Users")
        query.equalTo("status", 2)
        query.near("loc", geoPoint)
        query.limit(1)

        query.find().then(function(results) {
            console.log(results)

            if(results.length < 1) {
                console.error("no results :(")

                var query = new Parse.Query("Users")
                query.equalTo("status", 2)
                query.limit(1)

                query.find().then(function(results) {
                    getFrom = extractResults(results[0])
                    setChargerStatus()
                })
            }

            getFrom = extractResults(results[0])
            setChargerStatus()

        }, function(error) {
            console.log('oh no')
        })
    })
}

var setChargerStatus = function() {
    console.log("getFrom", getFrom)
    cordova.plugins.backgroundMode.configure({
        title: "Charger ready",
        ticker: getFrom.name + " has a charger ready",
        text:  getFrom.name + " has a charger ready"
    })
}

function extractResults(r) {
    return  {
        id: r.id,
        name: r.get('name'),
        updatedAt: r.get('updatedAt'),
        facebook: r.get('facebook'),
        picture: r.get('picture'),
        status: r.get('status'),
        loc: r.get('loc')
    }
}

var chargerAvail = function() {
    navigator.geolocation.getCurrentPosition(function(position) {

    })
}

angular.module('starter', ['ionic', 'starter.controllers', 'ngOpenFB', 'ngCordova'])

.run(function($ionicPlatform, ngFB) {
    ngFB.init({appId: '1100220343329968'});
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        // do these things only when we're on a device
        if(window.cordova) {
            cordova.plugins.backgroundMode.setDefaults({
                title:  "Currentcy",
                ticker: "Currentcy",
                text: ""
            })

            cordova.plugins.backgroundMode.enable()
            window.addEventListener("batterystatus", onBatteryStatus, false);

            function onBatteryStatus(info) {
                // Handle the online event
                console.log("Level: " + info.level + " isPlugged: " + info.isPlugged);
                if(info.level < 15 && !info.isPlugged) {
                    console.log("Level is low, we should do a request thing now")
                    getCharger()
                }
                if(info.level > 80 && !info.isPlugged || info.level > 95 && info.isPlugged) {
                    console.log("Level is high, we should say we're available")
                    chargerAvail()
                }
            }
        }


    });
})

.config(function($stateProvider, $urlRouterProvider) {

  openFB.init({appId: '699992913443805'});

    $stateProvider


        .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html'
            }
        }
    })

    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            }
        }
    })

      .state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings.html'
            }
        }
    })

   .state('app.map', {
        url: '/map',
        views: {
            'menuContent': {
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            }
        }
    })
  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  })
  .state('app.profile', {
    url: "/profile",
    views: {
        'menuContent': {
            templateUrl: "templates/profile.html",
            controller: "ProfileCtrl"
        }
    }
   });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
