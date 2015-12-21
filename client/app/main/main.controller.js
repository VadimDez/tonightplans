'use strict';

(function() {

class MainController {

  constructor(placesService) {
    this.places = [];
    this.placesService = placesService;
  }

  search(location) {
    this.placesService.search(location).then(data => {
      this.places = data.data.businesses;
    });
  }
}

angular.module('tonightplansApp')
  .controller('MainController', MainController);

})();
