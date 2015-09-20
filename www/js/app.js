// Ionic Starter App



// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
Parse.initialize("pelE80NCz6F6CzySUtgXspDGXVEm6rA4MDThhLCM", "0OoJKprEh2IIxF81RlbwLZzHQjQqdMTLvOP0xVXT");

// the cool shit goes here
var getFrom
var fromRef
var myLoc
var looking = false

var getCharger = function() {
    navigator.geolocation.getCurrentPosition(function(position) {
        looking = true
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
        query.withinMiles("loc", geoPoint, 5)
        query.limit(1)

        query.find().then(function(results) {
            console.log(results)

            if(results.length < 1) {
                console.error("no results :(")

                var query = new Parse.Query("Users")
                query.equalTo("status", 2)
                query.limit(1)

                query.find().then(function(results) {
                    fromRef = results[0]
                    getFrom = extractResults(results[0])
                    setChargerStatus()
                })
                return
            }

            fromRef = results[0]
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

    fromRef.set('status', 3)
    fromRef.save()
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
        if(!window.meRef)
            return

        meRef.set('loc', new Parse.GeoPoint({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }))
        meRef.set('status', 2)
        meRef.save()

        cordova.plugins.backgroundMode.configure({
            title: "Done with charger",
            ticker: "Done with charger",
            text:  "Your charger is ready for pickup"
        })
    })
}

var foundCharger = function() {
    looking = false
    fromRef.set('status', 0)
    fromRef.save()
    meRef.set('status', 1)
    meRef.save()

    cordova.plugins.backgroundMode.configure({
        title: "Now charging",
        ticker: "Now charging",
        text:  "Enjoy your charge"
    })
}

var dist = function(lon1, lon2, lat1, lat2) {
    var R, dlon, dlat, a, c, d
    lon1 *= Math.PI/180
    lon2 *= Math.PI/180
    lat1 *= Math.PI/180
    lat2 *= Math.PI/180
    R = 3959
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2),2)
    c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) )
    d = R * c
    return d
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

        if (window.localStorage.getItem('meid')) {
            console.log('has')
            var q = new Parse.Query("Users")
            q.get(window.localStorage.getItem('meid'), {
                success: function(obj){
                    window.meRef = obj
                    window.me = extractResults(obj)
                    console.log('storage', window.me)
                },

                error: function(a,b) {
                    console.log('error',a,b)
                }
            })
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
                if((info.level > 80 && !info.isPlugged || info.level > 95 && info.isPlugged)
                        && window.meRef && window.meRef.get('state') == 1) {
                    console.log("Level is high, we should say we're available")
                    chargerAvail()
                }
                if(info.isPlugged && looking) {
                    console.log("Looks like they received the charger")
                    foundCharger()
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


   .state('app.deliverymap', {
        url: '/deliverymap',
        views: {
            'menuContent': {
                templateUrl: 'templates/deliverymap.html',
                controller: 'deliverymapCtrl'
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
   })
  .state('app.notifications', {
    url: "/notifications",
    views: {
        'menuContent': {
            templateUrl: "templates/notifications.html",

        }
    }
   })
  .state('app.aboutus', {
    url: "/aboutus",
    views: {
        'menuContent': {
            templateUrl: "templates/aboutus.html",
        }
    }
   })
  .state('app.accountinfo', {
    url: "/accountinfo",
    views: {
        'menuContent': {
            templateUrl: "templates/accountinfo.html",
        }
    }
   })
  .state('app.notificationpreferences', {
    url: "/notificationpreferences",
    views: {
        'menuContent': {
            templateUrl: "templates/notificationpreferences.html",
        }
    }
   })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
