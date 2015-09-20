function extractResults(r) {
  return  {
    id: r.id,
    name: r.get('name'),
    updatedAt: r.get('updatedAt'),
    facebook: r.get('facebook'),
    picture: r.get('picture'),
    status: r.get('status'),
    loc: r.get('loc'),
    phone: r.get('phone')
  }
}
var where

angular.module('starter.controllers', ['ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, ngFB, $state, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.fbLogin = function () {
    // ngFB.login({scope: 'email, public_profile'}).then(
    //     function (response) {
    //         if (response.status === 'connected') {
    //             console.log('Facebook login succeeded');
    //             $scope.closeLogin();
    //         } else {
    //             alert('Facebook login failed');
    //         }
    //     });
openFB.login(
  function(response) {
    if (response.status === 'connected') {
      console.log('Facebook login succeeded');
      openFB.api({
        path: '/me',
        params: {fields: 'id,name,picture,email'},
        success: function(FBuser) {
          console.log(FBuser)

          var query = new Parse.Query("Users")
          query.equalTo("facebook", FBuser.id)
          query.limit = 1
          query.find().then(function(results) {
            if(results.length == 0) {
                            // user doesn't exist yet
                            var me = new Parse.Object('Users')
                            me.set('name', FBuser.name)
                            me.set('email', FBuser.email)
                            me.set('picture', FBuser.picture.data.url)
                            me.set('status', 0)
                            me.set('facebook', FBuser.id)
                            me.set('loc', new Parse.GeoPoint({
                              latitude: (where ? where.H : myLoc.latitude || 0),
                              longitude: (where? where.L : myLoc.longitude || 0)
                            }))

                            me.save().then(function(obj) {
                              window.me = extractResults(obj)
                              window.meRef = obj
                              window.localStorage.setItem('meid', obj.id)
                              console.log(obj)
                            })
                          } else {
                            // user exists
                            window.me = extractResults(results[0])
                            window.meRef = results[0]
                            console.log(results[0])
                            window.localStorage.setItem('meid', results[0].id)
                          }
                        })

},
error: function(error) {
  alert('Facebook error: ' + error.error_description);
}
});
} else {
  alert('Facebook login failed');
}
}
)
}
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
  { title: 'Reggae', id: 1 },
  { title: 'Chill', id: 2 },
  { title: 'Dubstep', id: 3 },
  { title: 'Indie', id: 4 },
  { title: 'Rap', id: 5 },
  { title: 'Cowbell', id: 6 }
  ];
})

.controller('LoginCtrl', function($scope) {
})

.controller('notificationsCtrl', function($scope) {
  $scope.notif=window.notif

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('MenuCtrl', function($scope) {
  $scope.notifnum = window.notifnum
})


.controller('ProfileCtrl', function ($scope, ngFB) {
  if(!window.localStorage.getItem('meid'))  {
    window.location = '#/app/login';
  }
})

.controller('EditProfileCtrl', function ($scope, ngFB) {
  $scope.me = window.me

})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $window) {
    if(!window.localStorage.getItem('meid'))  {
      window.location = '#/app/login';
    }

    $scope.lowBatt = getCharger

    $scope.from = window.getFrom
    console.log('loading ctrl')
    window.doShit = function() {
        console.log('resume')
        $scope.from = window.getFrom
        if (!$scope.$$phase) { // check if digest already in progress
            $scope.$digest(); // launch digest;
        }
        if(getFrom && place_marker) {
            var mark = place_marker(getFrom.loc._latitude, getFrom.loc._longitude, true)

            var directionsService = new google.maps.DirectionsService();
            var directionsDisplay = new google.maps.DirectionsRenderer();

            var request = {
              origin : myMarker.center,
              destination : mark.center,
              travelMode : google.maps.TravelMode.WALKING
            };
            directionsService.route(request, function(response, status) {
              if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
              }
            });

            directionsDisplay.setMap(homeMap);
        }
        // $window.location.reload();
        // var $ = function(i) {
        //     return document.getElementById(i)
        // }
        // $('fromImg').setAttribute('src', window.from.picture)
        // $('fromName').setAttribute('src', window.from.name)
        // $('fromPhone').setAttribute('src', window.from.phone)


    }

    // document.addEventListener("resume", doShit, false);

  var options = {timeout: 10000, enableHighAccuracy: true};

  var marker;
  navigator.geolocation.getCurrentPosition(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    where = latLng

    defaultLatLng = {lat: 42.358741, lng: -71.095807};

    var mapOptions = {
      center: defaultLatLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    window.homeMap = $scope.map


    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      var image = 'img/15-person-icon.png';
      marker = new google.maps.Marker({
        map: $scope.map,
        position: defaultLatLng,
        center: defaultLatLng,
        zoom: 1,
        icon: image
      });
      window.myMarker = marker

      var infoWindow = new google.maps.InfoWindow({
        content: "You are located here"
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open($scope.map, marker);
      });

    });
    window.place_marker = function(chargeLat, chargeLng, colored) {
      var positionVal = {lat: chargeLat, lng: chargeLng};

      personMarker = new google.maps.Marker({
          map: $scope.map,
          position: positionVal,
          center: positionVal,
          zoom: 1
        });
        if(colored)
            personMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')

        return personMarker
    }
  place_marker(42.356241, -71.098707);
  place_marker(42.357241, -71.094707);
  place_marker(42.357341, -71.094907);
  place_marker(42.360341, -71.104907);
  place_marker(42.359341, -71.0884907);
  }, function(error){
    console.log("Could not get location");
})})

//   setInterval(function () {
//
//     // $cordovaGeolocation.getCurrentPosition(options).then(function(position){
//     navigator.geolocation.getCurrentPosition(function(position){
//       var livelatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//       marker.setPosition(livelatLng);
//
//       var liveinfoWindow = new google.maps.InfoWindow({
//         content: "You are located here"
//       });
//
//       google.maps.event.addListener(marker, 'click', function () {
//         liveinfoWindow.open($scope.map, marker);
//       });
//       console.log(livelatLng);
//     }, function(error){
//       console.log("Could not get location");
//     });
//   }, 8000);
//
//
//   function place_marker(chargeLat, chargeLng) {
//     var positionVal = {lat: chargeLat, lng: chargeLng};
//
//     var marker = new google.maps.Marker({
//       map: $scope.map,
//       animation: google.maps.Animation.DROP,
//       position: positionVal,
//     });
//   }
//
// })

.controller('deliverymapCtrl', function($scope, $ionicLoading, $compile) {

  var site = new google.maps.LatLng(55.8934378,-4.2301905);
  var hospital = new google.maps.LatLng(55.8934378,-4.2201905);

  function initialize() {

    var mapOptions = {
      streetViewControl:true,
      center: site,
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    var map = new google.maps.Map(document.getElementById("map"),
      mapOptions);

        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: site,
          map: map,
          title: 'Strathblane (Job Location)'
        });

        var hospitalRoute = new google.maps.Marker({
          position: hospital,
          map: map,
          title: 'Hospital (Stobhill)'
        });

        var infowindow = new google.maps.InfoWindow({
         content:"My Location"
       });

        infowindow.open(map,marker);

        var hospitalwindow = new google.maps.InfoWindow({
         content:"Charger Location"
       });

        hospitalwindow.open(map,hospitalRoute);

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;

        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();

        var request = {
          origin : site,
          destination : hospital,
          travelMode : google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });

        directionsDisplay.setMap(map);

      }

      google.maps.event.addDomListener(window, 'load', initialize());

      $scope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };

      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
      };

    });
