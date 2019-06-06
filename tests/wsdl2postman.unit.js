var assert = require('assert'),
    soap = require('soap'),
    wsdl2postman = require('../wsdl2postman');

describe('wsdl2postman Tests', function () {
    describe('expand', function () {
        it('Null Args', function () {
            assert(wsdl2postman.expand() == null);
        });
        it('String Arg', function () {
            assert(wsdl2postman.expand("test") != null);
        });
        it('Int Arg', function () {
            assert(wsdl2postman.expand(1) != null);
        });
        it('Array Arg', function () {
            assert(wsdl2postman.expand([]) != null);
        });
        it('Object Arg', function () {
            assert(wsdl2postman.expand({}) != null);
        });
    });
    describe('parsePort', function () {
        it('Null Args', function () {
            assert(wsdl2postman.parsePort() == null);
        });
        it('Only PortDescription Arg', function () {
            assert(wsdl2postman.parsePort(null, null, null, {}) == null);
        });
        it('Only PortDescription Arg - String value', function () {
            var portDescription = "test",
                array = wsdl2postman.parsePort(null, null, null, portDescription);
            assert(array != null && array.length == portDescription.length);
        });
        it('client & client.httpClient and PortDescription Arg - String value', function () {
            var client = {},
                portDescription = "test";
            client.httpClient = "test";
            var array = wsdl2postman.parsePort(client, null, null, portDescription);
            assert(array != null && array.length == portDescription.length);
        });
        it('client & client.httpClient & portName and PortDescription Arg - String value', function () {
            var client = {},
                portDescription = "test",
                portName = "test";
            client.httpClient = "test";
            var array = wsdl2postman.parsePort(client, null, portName, portDescription);
            assert(array != null && array.length == portDescription.length);
        });
        it('With Every Args', function () {
            var client = {},
                portDescription = "test",
                serviceName = "test",
                portName = "test";
            client.httpClient = "test";
            var array = wsdl2postman.parsePort(client, serviceName, portName, portDescription);
            assert(array != null && array.length == portDescription.length);
        });
    });
    describe('parseService', function () {
        it('Null Args', function () {
            assert(wsdl2postman.parseService() == null);
        });
        it('With only ServiceDescription', function () {
            var serviceDescription = "test",
                array = wsdl2postman.parseService(null, null, serviceDescription);
            assert(array != null && array.length == serviceDescription.length);
        });
        it('With client & ServiceDescription', function () {
            var serviceDescription = "test",
                client = "test",
                array = wsdl2postman.parseService(client, null, serviceDescription);
            assert(array != null && array.length == serviceDescription.length);
        });
        it('With serviceName & ServiceDescription', function () {
            var serviceDescription = "test",
                serviceName = "test",
                array = wsdl2postman.parseService(null, serviceName, serviceDescription);
            assert(array != null && array.length == serviceDescription.length);
        });
        it('With Every Args', function () {
            var serviceDescription = "test",
                serviceName = "test",
                client = "test",
                array = wsdl2postman.parseService(client, serviceName, serviceDescription);
            assert(array != null && array.length == serviceDescription.length);
        });
    });
    describe('convertResource', function () {
        it('Null Args', function (done) {
            wsdl2postman.convertResource().then(res => {
                done(new Error());
            }).catch(e => {
                done();
            });
        });
        it('With Every Args', function (done) {
            var client = {
                wsdl: {
                    uri: "test"
                },
                describe: function () {
                    return "test";
                }
            };

            wsdl2postman.convertResource(client).then(res => {
                done();
            }).catch(e => {
                done(new Error());
            });
        });
    });
    describe('getResources', function () {
        it('Null Args', function (done) {
            wsdl2postman.getResources().then(res => {
                done(new Error());
            }).catch(e => {
                done();
            });
        });
        it('Invalid Client', function (done) {
            var url = "test";
            soap.createClientAsync(url).then(client =>{
                wsdl2postman.getResources([client]).then(res => {
                    done(new Error());
                }).catch(e => {
                    done();
                });
            }).catch(e =>{
                done();
            });
        });
        it('Valid Client', function (done) {
            var url = "http://localhost/CxWebInterface/SDK/CxSDKWebService.asmx?WSDL";
            soap.createClientAsync(url).then(client =>{
                wsdl2postman.getResources([client]).then(res => {
                    done();
                }).catch(e => {
                    done(new Error());
                });
            }).catch(e =>{
                done(new Error());
            });
        });
    });
    describe('getClients', function () {
        it('Null Args', function (done) {
            wsdl2postman.getClients().then(res => {
                done();
            }).catch(e => {
                done(new Error());
            });
        });
    });
    describe('writeFile', function () {
        it('Null Args', function (done) {
            wsdl2postman.writeFile().then(res => {
                done(new Error());
            }).catch(e => {
                done();
            });
        });
        it('Null Content', function (done) {
            var filename = "test";
            wsdl2postman.writeFile(filename, null).then(res => {
                done(new Error());
            }).catch(e => {
                done();
            });
        });
        it('Null Filename', function (done) {
            var content = "test";
            wsdl2postman.writeFile(null, content).then(res => {
                done(new Error());
            }).catch(e => {
                done();
            });
        });
        it('Valid Filename and content', function (done) {
            var filename = "test",
                content = "test";
            wsdl2postman.writeFile(filename, content).then(res => {
                done();
            }).catch(e => {
                done(new Error());
            });
        });
    });
});