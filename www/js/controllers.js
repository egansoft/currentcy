angular.module('starter.controllers', ['ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, ngFB) {

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
        },
        error: function(error) {
          alert('Facebook error: ' + error.error_description);
        }
      });
      $state.go("app.home",{},{reload:true});
    } else {
      alert('Facebook login failed');
    }
  },
  {scope: 'email,publish_actions,user_friends'})
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
  
  place_marker(39.256116, -76.710749);

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);


    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      var marker = new google.maps.Marker({
        map: $scope.map,
        position: latLng,
        center: latLng,
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

      var livemarker = new google.maps.Marker({
        map: $scope.map,
        position: livelatLng,
        center: livelatLng,
        zoom: 1
      });      

      var liveinfoWindow = new google.maps.InfoWindow({
        content: "You are located here"
      });

      google.maps.event.addListener(livemarker, 'click', function () {
        liveinfoWindow.open($scope.map, livemarker);
      });
      console.log(livelatLng);
    }, function(error){
      console.log("Could not get location");
    });
  }, 3000);


  function place_marker(chargeLat, chargeLng) {
    var positionVal = {lat: chargeLat, lng: chargeLng};

    var marker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      position: positionVal,
    });      
  }

});


