'use strict';

angular.module('tonightplansApp.auth', [
  'tonightplansApp.constants',
  'tonightplansApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
