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

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('ProfileCtrl', function ($scope, ngFB) {
  ngFB.api({
    path: '/me',
    params: {fields: 'id,name'}
  }).then(
  function (user) {
    $scope.user = user;
  },
  function (error) {
    alert('Facebook error: ' + error.error_description);
  });
})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
  var options = {timeout: 10000, enableHighAccuracy: true};

  place_marker(42.358741, -71.095807);
  var marker;
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    where = latLng

    defaultLatLng = {lat: 42.358741, lng: -71.095807};

    var mapOptions = {
      center: defaultLatLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);


    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      marker = new google.maps.Marker({
        map: $scope.map,
        position: defaultLatLng,
        center: defaultLatLng,
        zoom: 1
      });

      var infoWindow = new google.maps.InfoWindow({
        content: "You are located here"
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open($scope.map, marker);
      });

    });
  }, function(error){
    console.log("Could not get location");
  });

  setInterval(function () {

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      var livelatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      marker.setPosition(livelatLng);

      var liveinfoWindow = new google.maps.InfoWindow({
        content: "You are located here"
      });

      google.maps.event.addListener(marker, 'click', function () {
        liveinfoWindow.open($scope.map, marker);
      });
      console.log(livelatLng);
    }, function(error){
      console.log("Could not get location");
    });
}, 8000);


  function place_marker(chargeLat, chargeLng) {
    var positionVal = {lat: chargeLat, lng: chargeLng};

    var marker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      position: positionVal,
    });
  }

});
