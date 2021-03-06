var appCtrls;
var angular = require('angular');
require('@uirouter/angularjs');
require('angular-messages');

appCtrls = angular.module('app.controllers', ['ngMessages', 'ui.router', 'app.services']);

appCtrls.controller('RebootController', function RebootController($scope, $state, $interval, StateService, VIEW_STATES, API_STATES) {
  var waitPromise;

  function waitReboot() {
    var FIVE_SECONDS = 5000;

    waitPromise = $interval(function onInterval() {
      StateService.loadState(); // when successful, will trigger a state change
    }, FIVE_SECONDS);
  }

  $scope.$on('$destroy', function onDestroy() {
    if (waitPromise) {
      $interval.cancel(waitPromise);
    }
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD_SECURITY, function onConfigurationCloudSecurity() {
    $state.go(VIEW_STATES.CONFIG_CLOUD_SECURITY);
  });

  $scope.$on(API_STATES.CONFIGURATION_USER, function onConfigurationUser() {
    $state.go(VIEW_STATES.CONFIG_USER);
  });

  waitReboot();
});

appCtrls.controller('ConfigController', function ConfigController($scope, $state, VIEW_STATES, API_STATES) {
  $scope.$on(API_STATES.REBOOTING, function onRebooting() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.FACTORY_RESET, function onFactoryReset() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD_SECURITY, function onConfigurationCloudSecurity() {
    $state.go(VIEW_STATES.CONFIG_CLOUD_SECURITY);
  });

  $scope.$on(API_STATES.CONFIGURATION_USER, function onConfigurationUser() {
    $state.go(VIEW_STATES.CONFIG_USER);
  });
});

appCtrls.controller('AppController', function AppController($scope, $state, AuthService, AUTH_EVENTS, VIEW_STATES, API_STATES) {
  $scope.signout = function signout() {
    AuthService.signout();
  };

  $scope.$on(AUTH_EVENTS.NOT_AUTHENTICATED, function onNotAuthenticated() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.REBOOTING, function onRebooting() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.FACTORY_RESET, function onFactoryReset() {
    $state.go(VIEW_STATES.REBOOT);
  });

  $scope.$on(API_STATES.READY, function onReady() {
    $state.go(VIEW_STATES.SIGNIN);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD, function onConfigurationCloud() {
    $state.go(VIEW_STATES.CONFIG_CLOUD);
  });

  $scope.$on(API_STATES.CONFIGURATION_CLOUD_SECURITY, function onConfigurationCloudSecurity() {
    $state.go(VIEW_STATES.CONFIG_CLOUD_SECURITY);
  });

  $scope.$on(API_STATES.CONFIGURATION_USER, function onConfigurationUser() {
    $state.go(VIEW_STATES.CONFIG_USER);
  });
});

appCtrls.controller('SigninController', function SigninController($scope, $state, AuthService, VIEW_STATES) {
  $scope.$api = {};
  $scope.form = {
    email: null,
    password: null
  };

  $scope.signin = function signin() {
    return AuthService
      .signin($scope.form)
      .then(function onSuccess() {
        $state.go(VIEW_STATES.APP_DEVICES);
      });
  };
});

appCtrls.controller('SignupController', function SignupController($scope, $state, IdentityApi, GatewayApi, AuthService, StateService, VIEW_STATES, API_STATES) {
  $scope.$apiBack = {};
  $scope.$apiSignup = {};
  $scope.progressBarValue = 50;
  $scope.form = {
    email: null,
    password: null,
    passwordConfirmation: null
  };

  function init() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.platform = result.platform;
          if (!result.disableSecurity) {
            $scope.progressBarValue = 66;
          }
        }
      });
  }

  $scope.back = function back() {
    return StateService.changeState(API_STATES.CONFIGURATION_CLOUD);
  };

  $scope.signup = function signup() {
    return IdentityApi
      .signup($scope.form)
      .then(function onSignedUp() {
        if ($scope.platform === 'KNOT_CLOUD') {
          StateService.changeState(API_STATES.REBOOTING);
        } else if ($scope.platform === 'FIWARE') {
          StateService.changeState(API_STATES.REBOOTING);
        }
      });
  };

  init();
});

appCtrls.controller('ModalController', function ModalController($scope, GatewayApi, StateService, $uibModalInstance, API_STATES) {
  $scope.gatewayName = null;
  $scope.$activateApi = {};

  $scope.next = function next() {
    return GatewayApi.createGateway($scope.gatewayName)
      .then(function onSuccess() {
        $uibModalInstance.dismiss('cancel');
        return StateService.changeState(API_STATES.REBOOTING);
      });
  };

  $scope.cancel = function cancel() {
    $uibModalInstance.dismiss('cancel');
  };
});

appCtrls.controller('CloudController', function CloudController($scope, $state, GatewayApi, StateService, VIEW_STATES, API_STATES, CLOUD_PLATFORMS) {
  $scope.$api = {};
  $scope.form = {
    disableSecurity: true,
    knotCloud: {
      protocol: 'amqp',
      hostname: 'broker.knot.cloud',
      port: 5672,
      path: '/',
      username: '',
      password: ''
    },
    apiGateway: {
      protocol: 'https',
      hostname: 'api.knot.cloud',
      port: 443,
      path: '/'
    }
  };

  $scope.cloudPlatforms = [
    { name: 'KNOT_CLOUD', src: CLOUD_PLATFORMS.KNOT_CLOUD, selected: false },
    { name: 'FIWARE', src: CLOUD_PLATFORMS.FIWARE, selected: false }
  ];

  $scope.selectPlatform = function selectPlatform(platform) {
    $scope.form.platform = platform;
    $scope.cloudPlatforms.forEach(function onCloudPlatform(element) {
      if (element.name === $scope.form.platform) {
        element.selected = true;
      } else {
        element.selected = false;
      }
    });
  };

  function init() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.disableSecurity = result.disableSecurity;
          if (result.platform === 'KNOT_CLOUD') {
            $scope.form.knotCloud = result.knotCloud;
            $scope.form.apiGateway = result.apiGateway;
          } else if (result.platform === 'FIWARE') {
            $scope.form.iota = result.iota;
            $scope.form.orion = result.orion;
          }
          $scope.selectPlatform(result.platform);
        }
      });
  }

  $scope.save = function save() {
    return GatewayApi
      .saveCloudConfig($scope.form)
      .then(function onCloudConfigSaved() {
        return StateService.changeState(API_STATES.CONFIGURATION_USER);
      });
  };

  $scope.$watch('form.knotCloud.protocol', function onProtocolChanged(protocol) {
    // Only change if using the default ports
    if (protocol === 'amqps' && $scope.form.knotCloud.port === 5672) {
      $scope.form.knotCloud.port = 5671;
    } else if (protocol === 'amqp' && $scope.form.knotCloud.port === 5671) {
      $scope.form.knotCloud.port = 5672;
    }
  });

  $scope.$watch('form.apiGateway.protocol', function onProtocolChanged(protocol) {
    // Only change if using the default ports
    if (protocol === 'https' && $scope.form.apiGateway.port === 80) {
      $scope.form.apiGateway.port = 443;
    } else if (protocol === 'http' && $scope.form.apiGateway.port === 443) {
      $scope.form.apiGateway.port = 80;
    }
  });

  init();
});

appCtrls.controller('CloudSecurityController', function CloudSecurityController($scope, $state, GatewayApi, StateService, VIEW_STATES, API_STATES) {
  $scope.$apiBack = {};
  $scope.$api = {};
  $scope.form = {};

  $scope.back = function back() {
    return StateService
      .changeState(API_STATES.CONFIGURATION_CLOUD);
  };

  function init() {
    GatewayApi.getCloudSecurityConfig()
      .then(function onSuccess(result) {
        if (result) {
          $scope.form.hostname = result.hostname;
          $scope.form.port = result.port;
          $scope.form.clientId = result.clientId;
          $scope.form.clientSecret = result.clientSecret;
          $scope.form.callbackUrl = result.callbackUrl;
          $scope.form.code = result.code;
        }
      });
  }

  $scope.save = function save() {
    GatewayApi.getCloudConfig()
      .then(function onSuccess(result) {
        $scope.platform = result.platform;
      })
      .then(function onSuccess() {
        return GatewayApi.saveCloudSecurityConfig($scope.form, $scope.platform);
      })
      .then(function onCloudSecurityConfigSaved() {
        return StateService.changeState(API_STATES.CONFIGURATION_USER);
      });
  };

  init();
});

appCtrls.controller('AdminController', function AdminController($scope, GatewayApi, StateService, API_STATES, CLOUD_PLATFORMS) {
  $scope.$api = {};
  $scope.credentials = {};

  function init() {
    GatewayApi.me()
      .then(function onSuccess(user) {
        $scope.credentials.user = user;
      });
    GatewayApi.getGatewayConfig()
      .then(function onSuccess(gateway) {
        $scope.credentials.gateway = gateway;
      });
    GatewayApi.getCloudConfig()
      .then(function onCloudConfig(config) {
        $scope.shouldShowGatewayCred = config.platform === 'KNOT_CLOUD';
        if (config.platform === 'KNOT_CLOUD') {
          $scope.platformSrcImg = CLOUD_PLATFORMS.KNOT_CLOUD;
        } else if (config.platform === 'FIWARE') {
          $scope.platformSrcImg = CLOUD_PLATFORMS.FIWARE;
        }
      });
  }

  $scope.reboot = function reboot() {
    return StateService.changeState(API_STATES.REBOOTING);
  };

  $scope.factoryReset = function factoryReset() {
    return StateService.changeState(API_STATES.FACTORY_RESET);
  };

  init();
});

appCtrls.controller('NetworkController', function NetworkController($scope, GatewayApi) {
  $scope.$api = {};
  $scope.form = {
    hostname: null
  };
  $scope.successAlertVisible = false;

  function showSuccessAlert() {
    $scope.successAlertVisible = true;
  }

  function hideSuccessAlert() {
    $scope.successAlertVisible = false;
  }

  function init() {
    GatewayApi.getNetworkConfig()
      .then(function onSuccess(result) {
        $scope.form.hostname = result.hostname !== '' ? result.hostname : null;
      });
  }

  $scope.hideSuccessAlert = hideSuccessAlert;

  $scope.save = function save() {
    return GatewayApi
      .saveNetworkConfig($scope.form)
      .then(function onSuccess() {
        showSuccessAlert();
      });
  };

  init();
});

appCtrls.controller('DevicesController', function DevicesController($scope, $interval, GatewayApi, GatewayApiErrorService) {
  var refreshPromise;
  $scope.$api = {};
  $scope.nearbyDevices = [];
  $scope.myDevices = [];

  function reloadDevices() {
    var promise = GatewayApi.getDevices()
      .then(function onSuccess(devices) {
        var pairedDevices = devices
          .filter(function isPaired(device) {
            return device.paired;
          });

        $scope.nearbyDevices = devices.filter(function isNearby(device) {
          return !device.registered && !device.paired;
        });

        return pairedDevices;
      })
      .then(function onSuccess(myDevices) {
        $scope.myDevices = myDevices;
      });

    promise.catch(function onFailure() {
      $scope.myDevices = [];
      $scope.nearbyDevices = [];
    });

    GatewayApiErrorService.updateStateOnResponse($scope.$api, promise);

    return promise;
  }

  function startRefresh() {
    refreshPromise = $interval(reloadDevices, 2000);
  }

  function stopRefresh() {
    $interval.cancel(refreshPromise);
  }

  function init() {
    reloadDevices();
    startRefresh();
  }

  $scope.allow = function allow(device) {
    device.paired = true;
    return GatewayApi.updateDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      });
  };

  $scope.forget = function forget(device) {
    device.paired = false;
    return GatewayApi.updateDevice(device)
      .then(function onFulfilled() {
        return reloadDevices();
      });
  };

  $scope.$on('$destroy', function onDestroy() {
    stopRefresh();
  });

  init();
});
