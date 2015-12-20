'use strict';

angular.module('tonightplansApp', [
  'tonightplansApp.auth',
  'tonightplansApp.admin',
  'tonightplansApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'validation.match'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
