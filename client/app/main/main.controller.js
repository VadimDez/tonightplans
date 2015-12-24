'use strict';

(function() {

class MainController {

  constructor(placesService, Auth, $cookies) {
    var cookieLocation;
    this.places = [];
    this.placesService = placesService;
    this.$cookies = $cookies;
    this.searchString = '';

    this.isAuthenticated = Auth.isLoggedIn;

    if (this.isAuthenticated) {
      cookieLocation = $cookies.get('lastLocation');
      if (cookieLocation) {
        this.searchString = cookieLocation;
        this.search(cookieLocation);
      }
    }
  }

  search(location) {
    this.$cookies.put('lastLocation', location);
    this.placesService.search(location).then(data => {
      this.places = data.data;
    });
  }

  patch(place) {
    this.placesService.patch(place._id).then(data => {
      var index = this.places.indexOf(place);
      this.places.splice(index, 1, data.data);
    });
  }
}

angular.module('tonightplansApp')
  .controller('MainController', MainController);

})();
