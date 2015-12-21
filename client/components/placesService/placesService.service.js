'use strict';

class placesService {
  constructor($http) {
    this.$http = $http;
  }

  search(location) {
    return this.$http.get('/api/places', {location: 'test'});
  }
}

angular.module('tonightplansApp')
  .service('placesService', placesService);
