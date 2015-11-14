angular.module('coders', ['ngRoute']).config([
  '$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/home.html'
    });
    $routeProvider.when('/teste', {
      templateUrl: 'views/teste.html'
    }).otherwise({
      redirectTo: '/'
    });
  }
]);