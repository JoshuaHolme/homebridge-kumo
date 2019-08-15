var request = require('request');

//Variables for Homebridge
var Service, Characteristic;

//Kumocloud Service
const KumoLoginURL = 'https://geo-c.kumocloud.com/login';
const KumoUpdateURL = 'https://geo-c.kumocloud.com/getDeviceUpdates'
const KumoSendCommandURL = 'https://geo-c.kumocloud.com/sendDeviceCommands/v2'

module.exports = function( homebridge ) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-kumo", "Kumo", Kumo);
};

function Kumo(log, config) {
    this.log = log;
    //geturl
    //posturl

    this.name = config.name;

    //Kumo Cloud Token
    this.token = null;

    //Mini-Split Informaiton
    this.serial = config.serial || null;
    this.manufacturer = config.manufacturer || null;
    this.model = config.model || null;

    //Get Username and Password From Config
    this.username = config.username || null;
    this.password = config.password || null;

    //Login
    if( null != this.username && null != this.password ) {

        //Request Login
        request.post(
            KumoLoginURL,
            { json: {"username":this.username, "password":this.password, "appVersion":"2.2.0"} },
            function (error, response, body ) {

                //Handle Response From Login
                console.log("Token Status Code: " + response.statusCode);

                if( !error && 200 == response.statusCode ) {
                    //Got a good response, get token
                    this.token = body[0].token;

                    console.log("Token: " + this.token);

                    //Todo: Parse "Device Update" data
                }
            }.bind(this)
        );
    }

    this.service = new Service.Thermostat(this.name);
}

Kumo.prototype = {
    identity: function(callback) {
        console.log("Request Identity!");
        callback(null);
    },

    getCurrentHeatingCoolingState: function(callback) { // WORKING
        request.post(
            KumoUpdateURL,
            { body: '["' + this.token + '",["' + this.serial + '"]]' },
            function (error, response, body ) {

                if( !error && 200 == response.statusCode ) {

                    // Save parsed body to a variable
                    var data = JSON.parse(body);

                    var mode = data[2][0][0].operation_mode

                    switch(mode) {
                      case 1:
                          callback( null, Characteristic.TargetHeatingCoolingState.HEAT);
                          break;
                      case 3:
                          callback( null, Characteristic.TargetHeatingCoolingState.COOL);
                          break;
                      default:
                          callback( null, Characteristic.TargetHeatingCoolingState.OFF);
                          break;
                    }
                }
                else {
                    callback( error );
                }
            }.bind(this)
        );
    },

    getTargetHeatingCoolingState: function(callback) { // WORKING
      request.post(
          KumoUpdateURL,
          { body: '["' + this.token + '",["' + this.serial + '"]]' },
          function (error, response, body ) {

              if( !error && 200 == response.statusCode ) {

                  // Save parsed body to a variable
                  var data = JSON.parse(body);

                  var mode = data[2][0][0].operation_mode

                  switch(mode) {
                    case 1:
                        callback( null, Characteristic.TargetHeatingCoolingState.HEAT);
                        break;
                    case 3:
                        callback( null, Characteristic.TargetHeatingCoolingState.COOL);
                        break;
                    default:
                        callback( null, Characteristic.TargetHeatingCoolingState.OFF);
                        break;
                  }
              }
              else {
                  callback( error );
              }
          }.bind(this)
      );
    },

    setTargetHeatingCoolingState: function(callback) { // WORKING
      //Request Login

      // Print out the current temperature
      var mode = this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState).value;

        request.post(
            KumoSendCommandURL,
            { body: '["' + this.token + '",{"' + this.serial + '":{"power":1,"operationMode":3}}]' },
            function (error, response, body ) {
              if( !error && 200 == response.statusCode ) {

                  console.log("Success Heat");
              }
              else {
                  console.log( "Error Heat" );
              }
            }.bind(this)
        );
        console.log(request);
        console.log(this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState));
      // switch(mode) {
      //   case 1:
      //   request.post(
      //       KumoSendCommandURL,
      //       { body: '["' + this.token + '",{"' + this.serial + '":{"power":1,"operationMode":1}}]' },
      //       function (error, response, body ) {
      //         if( !error && 200 == response.statusCode ) {
      //
      //             console.log("Success Heat");
      //         }
      //         else {
      //             console.log( "Error Heat" );
      //         }
      //       }.bind(this)
      //   );
      //   console.log(request);
      //   console.log(this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState));
      //       break;
      //   case 3:
      //       request.post(
      //           KumoSendCommandURL,
      //           { body: '["' + this.token + '",{"' + this.serial + '":{"power":1,"operationMode":3}}]' },
      //           function (error, response, body ) {
      //             if( !error && 200 == response.statusCode ) {
      //
      //                 console.log("Success CooL");
      //             }
      //             else {
      //                 console.log( "Error Cool" );
      //             }
      //           }.bind(this)
      //       );
      //       console.log(request);
      //       console.log(this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState));
      //       break;
      //   default:
      //       request.post(
      //           KumoSendCommandURL,
      //           { body: '["' + this.token + '",{"' + this.serial + '":{"power":0}}]' },
      //           function (error, response, body ) {
      //             if( !error && 200 == response.statusCode ) {
      //
      //               console.log("Success Off");
      //           }
      //           else {
      //               console.log( "Error Off" );
      //
      //           }
      //           }.bind(this)
      //       );
      //       console.log(request);
      //       console.log(this.service.getCharacteristic(Characteristic.TargetHeatingCoolingState));
      //       break;
      // }
    },

    getCurrentTemperature: function(callback) { // WORKING
        request.post(
            KumoUpdateURL,
            { body: '["' + this.token + '",["' + this.serial + '"]]' },
            function (error, response, body ) {

                if( !error && 200 == response.statusCode ) {

                    // Save parsed body to a variable
                    var data = JSON.parse(body);

                    //Return the current temperature
                    callback( null, data[2][0][0].room_temp );
                }
                else {
                    callback( error );
                }
            }.bind(this)
        );
    },

    getTargetTemperature: function(callback) { // WORKING
        request.post(
            KumoUpdateURL,
            { body: '["' + this.token + '",["' + this.serial + '"]]' },
            function (error, response, body ) {

                if( !error && 200 == response.statusCode ) {

                    // Save parsed body to a variable
                    var data = JSON.parse(body);

                    // Print out the current temperature
                    var mode = data[2][0][0].operation_mode

                    switch(mode) {
                      case 1:
                          callback( null, data[2][0][0].sp_heat);
                          break;
                      case 3:
                          callback( null, data[2][0][0].sp_cool);
                          break;
                      default:
                          callback( null, data[2][0][0].room_temp);
                          break;
                    }
                }
                else {
                    callback( error );
                }
            }.bind(this)
        );
    },

    setTargetTemperature: function(value, callback) {
      request.post(
          KumoSendCommandURL,
          { body: '["' + this.token + '",["' + this.serial + '"]]' },
          function (error, response, body ) {

              if( !error && 200 == response.statusCode ) {

                  // Print out the current temperature
                  var mode = this.service.getCharacteristic(Characteristic.CurrentHeatingCoolingState).value;

                  switch(mode) {
                    case 1:
                        callback( null, [true,null,[["9534P008J100004F","2252448353749311"]]]);
                        break;
                    case 3:
                        callback( null, [true,null,[["9534P008J100004F","2252448353749311"]]]);
                        break;
                    default:
                        callback(null, [true,null,[["9534P008J100004F","2252448353749311"]]]);
                        break;
                  }
              }
              else {
                  callback( error );
              }
          }.bind(this)
      );
    },

    getServices: function() {
        let informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic( Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic( Characteristic.Model, this.model)
            .setCharacteristic( Characteristic.SerialNumber, this.serial);

        this.service
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
                .on('get', this.getCurrentHeatingCoolingState.bind(this));  // WORKING

        this.service
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
                .on('get', this.getTargetHeatingCoolingState.bind(this)) // WORKING
                .on('set', this.setTargetHeatingCoolingState.bind(this));


        this.service
            .getCharacteristic(Characteristic.CurrentTemperature)
                .on('get', this.getCurrentTemperature.bind(this));  // WORKING

        this.service
            .getCharacteristic(Characteristic.TargetTemperature)
                .on('get', this.getTargetTemperature.bind(this))  //WORKING
                .on('set', this.setTargetTemperature.bind(this));

        return [informationService, this.service];
    }
};
