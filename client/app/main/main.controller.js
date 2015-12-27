'use strict';

(function() {

class MainController {

  constructor(placesService, Auth, $cookies) {
    var cookieLocation;
    this.places = [];
    this.placesService = placesService;
    this.$cookies = $cookies;
    this.searchString = '';
    this.loading = false;

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
    this.loading = true;
    this.places = [];
    this.$cookies.put('lastLocation', location);
    this.placesService.search(location)
      .then(data => {
        this.loading = false;
        this.places = data.data;
      })
      .catch(() => {
        this.loading = false;
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
