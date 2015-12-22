'use strict';

class placesService {
  constructor($http) {
    this.$http = $http;
  }

  search(location) {
    return this.$http({
      url: '/api/places',
      method: 'GET',
      params: {location: location}
      //paramSerializer: '$httpParamSerializerJQLike'
    });
  }
}

angular.module('tonightplansApp')
  .service('placesService', placesService);
