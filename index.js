var wsdl2postman = require('./wsdl2postman'),
    HOST = "http://localhost/CxWebInterface",
    HOST_VARIABLE = "{{cx_sast_server}}", //REPLACE HOST WITH POSTMAN ENVIRONMENT VARIABLE
    WEB_SERVICES = [
        '/VS/CxVSWebService.asmx',
        "/Audit/CxAuditWebService.asmx",
        "/CLI/CxCLIWebService.asmx",
        "/CLI/CxCLIWebServiceV1.asmx",
        "/Eclipse/CxEclipseWebService.asmx",
        "/IntelliJ/CxIntelliJWebService.asmx",
        "/Jenkins/CxJenkinsWebService.asmx",
        "/Portal/CxWebService.asmx",
        "/Priority/CxPriorityService.asmx",
        "/SDK/CxSDKWebService.asmx"
    ];

wsdl2postman.convert(HOST, HOST_VARIABLE, WEB_SERVICES);
//DEFAULT FOLDER NAME IS "generated" -> this will be generated in the root of project
//DEFAULT COLLECTION NAME IS "collection"
//wsdl2postman.convert(HOST, HOST_VARIABLE, WEB_SERVICES, "folderName");
//wsdl2postman.convert(HOST, HOST_VARIABLE, WEB_SERVICES, "folderName","collectionName");