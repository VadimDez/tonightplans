'use strict';

describe('Service: placesService', function () {

  // load the service's module
  beforeEach(module('tonightplansApp'));

  // instantiate service
  var placesService;
  beforeEach(inject(function (_placesService_) {
    placesService = _placesService_;
  }));

  it('should do something', function () {
    expect(!!placesService).toBe(true);
  });

});
