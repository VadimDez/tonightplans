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

  patch(id) {
    return this.$http.patch('/api/places/' + id);
  }
}

angular.module('tonightplansApp')
  .service('placesService', placesService);
