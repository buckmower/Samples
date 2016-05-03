// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('fa_opener', ['ionic', 'firebase'])
.constant("baseurl", "https://blazing-inferno-2815.firebaseapp.com")
.config(["baseurl", "$stateProvider",   "$urlRouterProvider",
 function(baseurl, $stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller
  $stateProvider

    .state('home', {
      url: "/",
      templateUrl: "templates/home.html",
      controller: "HomeCtrl",
    })
    .state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: 'LoginCtrl',
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl',
    })
    .state('play', {
      url: '/play',
      templateUrl: 'templates/play.html',
      controller: 'PlayCtrl',
    })
    .state('settings', {
      url: '/settings',
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl',
    })
    .state('editprofile', {
      url: '/editprofile',
      templateUrl: 'templates/editprofile.html',
      controller: 'EditProfileCtrl',
    })
    .state('discoverypreferences', {
      url: '/discoverypreferences',
      templateUrl: 'templates/discoverypreferences.html',
      controller: 'DiscoveryPreferencesCtrl',
    })
    .state('appsettings', {
      url: '/appsettings',
      templateUrl: 'templates/appsettings.html',
      controller: 'AppSettingsCtrl',
    })
    .state('chat', {
      url: '/chat',
      templateUrl: 'templates/chat.html',
      controller: 'ChatCtrl',
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
}])
.controller('HomeCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
  function HomeCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
  $scope.baseurl = baseurl;
  var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
  var isAuth = ref.getAuth();
  if(isAuth !== null) {
    $state.go("play");
  }
  else {
    $scope.goToSignup = function() {
        $state.go('signup');
      };
    $scope.goToLogin = function() {
      $state.go('login');
    };
  }
}])
.controller('LoginCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
 function LoginCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
  $scope.baseurl = baseurl;
  var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
  var isAuth = ref.getAuth();
  if(isAuth !== null) {
    $state.go("play");
  }
  else { 
    $scope.tryLogin = function(login) {
      var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com");
      ref.authWithPassword({
        email    : angular.copy(login.email),
        password : angular.copy(login.password)
      }, function(error, authData) { 
        if (error) {
          console.log("Error logging in user user:", error);
        } else {
          $state.go("play");
          console.log("Successfully logged in user account with uid:", authData.uid);
        }
      }, {
        remember: "sessionOnly"
      });
    };
    $scope.goToSignup = function() {
        $state.go('signup');
    };
    $scope.goToHome = function() {
        $state.go('home');
    };
  }
}])
.controller('SignupCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
 function SignupCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
  $scope.baseurl = baseurl;
  var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
  var isAuth = ref.getAuth();
  if(isAuth !== null) {
    $state.go("play");
  }
  else {  
    $scope.trySignup = function(signup) {
      var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com");
      ref.createUser({
        email    : angular.copy(signup.email),
        password : angular.copy(signup.password)
      }, function(error, userData) {
        if (error) {
          console.log("Error creating user:", error);
        } else {
          $state.go("play");
          console.log("Successfully created user account with uid:", userData.uid);
        }
      });
    };
    $scope.goToLogin = function() {
        $state.go('login');
    };
    $scope.goToHome = function() {
        $state.go('home');
    };
  }
}])
.controller("PlayCtrl", ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
 function PlayCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
  var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
  var isAuth = ref.getAuth();
  if(isAuth === null) {
    $state.go("home");
  } 
  else {
    $scope.goToSettings = function() {
      $state.go("settings");
    };
    $scope.goToChat = function() {
      $state.go("chat");
    };
    // create an AngularFire reference to the data
    var sync = $firebase(ref);

    // download the data into a local object
    //$scope.data = sync.$asObject();
    //syncObject.$bindTo($scope, "data");
    //download the data into an array
    //$scope.golfers = sync.$asArray();
    $scope.SortYesOrNo = function(yesorno) {
    $scope.golfers.$add({sortyesorno: yesorno});
    }
  }
}])
.controller('SettingsCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
  function SettingsCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
    var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
    var isAuth = ref.getAuth();
    if(isAuth === null) {
      $state.go("home");
    } 
    else {
      $scope.goToPlay = function() {
        $state.go("play");
      };
      $scope.goToEditProfile = function() {
        $state.go("editprofile");
      };
      $scope.goToDiscoveryPreferences = function() {
        $state.go("discoverypreferences");
      };
      $scope.goToAppSettings = function() {
        $state.go("appsettings");
      };
    }
}])
.controller('EditProfileCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
  function SettingsCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
    var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
    var isAuth = ref.getAuth();
    if(isAuth === null) {
      $state.go("home");
    } 
    else {
      $scope.goToPlay = function() {
        $state.go("play");
      };
      $scope.goToSettings = function() {
        $state.go("settings");
      };
    }
}])
.controller('DiscoveryPreferencesCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
  function DiscoveryPreferencesCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
    var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
    var isAuth = ref.getAuth();
    if(isAuth === null) {
      $state.go("home");
    } 
    else {
      $scope.goToPlay = function() {
        $state.go("play");
      };
      $scope.goToSettings = function() {
        $state.go("settings");
      };
    }
}])
.controller('AppSettingsCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
  function AppSettingsCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
    var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
    var isAuth = ref.getAuth();
    if(isAuth === null) {
      $state.go("home");
    } 
    else {
      $scope.goToPlay = function() {
        $state.go("play");
      };
      $scope.goToSettings = function() {
        $state.go("settings");
      };
      $scope.logout = function() {
        ref.unauth();
        $state.go("home");
      };
    }
}])
.controller('ChatCtrl', ["baseurl", "$scope", "$state", "$firebase", "$firebaseAuth",
  function ChatCtrl(baseurl, $scope, $state, $firebase, $firebaseAuth) {
    var ref = new Firebase("https://blazing-inferno-2815.firebaseio.com/");
    var isAuth = ref.getAuth();
    if(isAuth === null) {
      $state.go("home");
    } 
    else {
      $scope.goToPlay = function() {
        $state.go("play");
      };
      $scope.goToChatDetail = function() {
        $state.go("chatdetal");
      };
    }
}]);
/*
.run(function($rootScope, $firebaseSimpleLogin, $state, $window) {

  var dataRef = new Firebase("https://ionic-firebase-login.firebaseio.com/");
  var loginObj = $firebaseSimpleLogin(dataRef);

  loginObj.$getCurrentUser().then(function(user) {
    if(!user){ 
      // Might already be handled by logout event below
      $state.go('login');
    }
  }, function(err) {
  });

  $rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
    $state.go('home_landing');
  });

  $rootScope.$on('$firebaseSimpleLogin:logout', function(e, user) {
    console.log($state);
    $state.go('login');
  });
});
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at 
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
  */