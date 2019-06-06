var fs = require('fs'),
    path = require('path'),
    pd = require('pretty-data').pd,
    soap = require('soap'),
    uuid = require('uuid'),
    log4js = require("log4js"),
    POSTMAN_SCHEMA = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    FILE_EXTENSION = ".json",
    WS_POSTFIX = "?WSDL",
    DEFAULT_FOLDER = "generated",
    DEFAULT_COLLECTION_NAME = "collection",
    getLogger = function (name) {
        log4js.configure({
            appenders: {
                console: {
                    type: "console",
                    layout: {
                        type: "basic"
                    }
                }
            },
            categories: {
                default: {
                    appenders: ["console"],
                    level: "trace"
                }
            }
        });
        if (!name) {
            name = "Unknown";
        }
        return log4js.getLogger("[" + name.toUpperCase() + "]");
    },
    log = getLogger("wsdl2postman"),
    convert = function (host, hostVariable, webServices, folder, collectionName) {
        const method = arguments.callee.name;
        if (host && webServices) {
            log.info("%s - Starting converting...",method);
            log.info("%s - Host: %s", method, host);
            log.info("%s - Web Services to Convert: %d", method, webServices.length);
            getClients(host, webServices)
                .then(clients => getResources(host, hostVariable, clients, collectionName ? collectionName : DEFAULT_COLLECTION_NAME))
                .then(resources => writeFiles(resources, folder ? folder : DEFAULT_FOLDER))
                .then(res => {
                    log.info("%s - Success to convert %d Web Services format (%s) to Postman format (%s)!", method, webServices.length, WS_POSTFIX, FILE_EXTENSION);
                    log.info("%s - Generated file can be found here: ", method);
                    log.info("%s - '%s'", method, path.resolve(__dirname + "\\" + (folder ? folder : DEFAULT_FOLDER) + "\\" + (collectionName ? collectionName : DEFAULT_COLLECTION_NAME)) + FILE_EXTENSION);
                }).catch(e => {
                    log.error(e);
                });
        } else {
            log.error("HOST: %s", host);
            log.error("WEB SERVICES TO CONVERT: %d", webServices.length);
            log.error("%s - No Host or Webservices provided !", method);
        }
    },
    writeFiles = function (collection, folder) {
        const method = arguments.callee.name;
        return new Promise(function (resolve, reject) {
            if (collection) {
                var dir = path.resolve(__dirname + "\\" + folder);
                if (!fs.existsSync(dir)) {
                    log.info("%s - Creating folder %s...", method, dir);
                    fs.mkdirSync(dir);
                } else {
                    log.info("%s - Folder %s already exists", method, dir);
                }
                var filename = collection.info.name + FILE_EXTENSION
                writeFile(dir, filename, collection)
                    .then(fileWritten => resolve(fileWritten))
                    .catch(reject);
            } else {
                var error = method + " - Empty resources list";
                log.error(error);
                reject(new Error(error));
            }
        });
    },
    writeFile = function (dir, filename, content) {
        const method = arguments.callee.name;
        return new Promise(function (resolve, reject) {
            if (filename && content) {
                try {
                    log.info("%s - Writting file %s...", method, filename);
                    var fileWritten = fs.writeFileSync(dir + "\\" + filename, JSON.stringify(content));
                    resolve(fileWritten);
                } catch (e) {
                    var error = method + " - Failing to write file : " + dir + "\\" + filename;
                    log.error(error);
                    reject(new Error(error));
                }
            } else {
                var error = method + " - No filename or content provided";
                log.error(error);
                reject(new Error(error));
            }
        });
    },
    getClients = function (host, webServices) {
        const method = arguments.callee.name;
        return new Promise(function (resolve, reject) {
            log.info("%s - Getting Web Service Clients...", method);
            var promises = [];
            for (var i = 0; i < webServices.length; i++) {
                var ws = webServices[i],
                    url = host + ws + WS_POSTFIX;
                promises.push(soap.createClientAsync(url));
            }
            if (promises && promises.length > 0) {
                Promise.all(promises)
                    .then(clients => resolve(clients))
                    .catch(reject);
            } else {
                var error = method + " - Empty promises list";
                log.error(error);
                reject(new Error(error));
            }
        });
    },
    getResources = function (host, hostVariable, clients, collectionName) {
        const method = arguments.callee.name;
        return new Promise(function (resolve, reject) {
            if (clients && clients.length > 0) {
                log.info("%s - Getting Resources from Clients...", method);
                var collection = {};
                collection.info = {
                    _postman_id: uuid.v4(),
                    name: collectionName,
                    schema: POSTMAN_SCHEMA
                };

                var promises = [];
                for (var i = 0; i < clients.length; i++) {
                    var client = clients[i];
                    if (client) {
                        promises.push(convertResource(host, hostVariable, client));
                    }
                }
                if (promises && promises.length > 0) {
                    Promise.all(promises)
                        .then(resources => {
                            collection.item = [];
                            for (var i = 0; i < resources.length; i++) {
                                var resource = resources[i][0];
                                collection.item.push(resource);
                            }
                            resolve(collection);
                        })
                        .catch(reject);
                } else {
                    var error = method + " - Empty promises list";
                    log.error(error);
                    reject(new Error(error));
                }
            } else {
                var error = method + " - Empty clients list";
                log.error(error);
                reject(new Error(error));
            }
        });
    },
    convertResource = function (host, hostVariable, client) {
        const method = arguments.callee.name;
        return new Promise(function (resolve, reject) {
            if (client && client.wsdl && client.wsdl.uri && client.describe) {
                var clientDescription = client.describe();
                resolve(Object.keys(clientDescription).sort().map((serviceName) => {
                    log.info("%s - Converting Resources from %s Service...", method, serviceName);
                    return {
                        id: uuid.v4(),
                        name: serviceName,
                        item: parseService(host, hostVariable, client, serviceName, clientDescription[serviceName])
                    };
                }));
            } else {
                var error = method + " - Valid Client was not provided";
                log.error(error);
                reject(new Error(error));
            }
        });
    },
    parseService = function (host, hostVariable, client, serviceName, serviceDescription) {
        const method = arguments.callee.name;
        if (serviceDescription) {
            return Object.keys(serviceDescription).sort()
                .map((portName) => {
                    return {
                        id: uuid.v4(),
                        name: portName,
                        item: parsePort(host, hostVariable, client, serviceName, portName, serviceDescription[portName])
                    };
                });
        } else {
            var error = method + " - Valid Service Description was not provided";
            log.error(error);
            return null;
        }
    },
    parsePort = function (host, hostVariable, client, serviceName, portName, portDescription) {
        const method = arguments.callee.name;
        if (portDescription) {
            return Object.keys(portDescription).sort()
                .map((operationName) => {
                    var operationItem = {
                        id: uuid.v4(),
                        name: operationName,
                        request: {
                            method: 'POST',
                            body: {
                                mode: 'raw'
                            },
                            description: ''
                        }
                    };
                    if (client) {
                        client.httpClient = {
                            request: function (rurl, data, callback, exheaders, exoptions) {
                                operationItem.request.body.raw = pd.xml(data);
                                operationItem.request.header = Object.keys(exheaders).map((headerKey) => {
                                    return {
                                        key: headerKey,
                                        value: exheaders[headerKey]
                                    };
                                });
                                if (hostVariable) {
                                    operationItem.request.url = rurl.replace(host, hostVariable);
                                } else {
                                    operationItem.request.url = rurl;
                                }
                            }
                        };
                        var requestParameter = expand(portDescription[operationName].input);
                        if (portName != null && serviceName != null && requestParameter != null) {
                            client[serviceName][portName][operationName](requestParameter);
                            return operationItem;
                        } else {
                            var error = method + " - Valid PortName or ServiceName or requestParameter were not provided";
                            log.error(error);
                            return null;
                        }
                    } else {
                        var error = method + " - Valid Client was not provided";
                        log.error(error);
                        return null;
                    }
                });
        } else {
            var error = method + " - Valid PortDescription was not provided";
            log.error(error);
            return null;
        }
    },
    expand = function (input) {
        const method = arguments.callee.name;
        if (input) {
            var keys = Object.keys(input);
            if (keys.length === 0) {
                return '?';
            }
            var obj = {};
            keys.filter((fieldName) => fieldName !== 'targetNSAlias' && fieldName !== 'targetNamespace')
                .forEach((fieldName) => {
                    var parameterValue = typeof input[fieldName] === 'object' ? expand(input[fieldName]) : '?';
                    if (fieldName.endsWith('[]')) {
                        obj[fieldName.substr(0, fieldName.length - 2)] = [parameterValue];
                    } else {
                        obj[fieldName] = parameterValue;
                    }
                });
            return obj;
        } else {
            var error = method + " - Valid Input was not provided";
            log.error(error);
            return null;
        }
    };
/*
module.exports = {
    convert: convert
};
*/
// FOR TESTS
module.exports = {
    getLogger: getLogger,
    convert: convert,
    writeFiles: writeFiles,
    writeFile: writeFile,
    getClients: getClients,
    getResources: getResources,
    convertResource: convertResource,
    parseService: parseService,
    parsePort: parsePort,
    expand: expand
};