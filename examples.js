var lib          = require("./index.js");
var treetocanvas = require("./treetocanvas.js");

var arr = ['org.koboso','org.koboso.zamana','org.koboso.zamana.manager'];

lib.displayAsTreeWrapper(lib.processLinesWrapper(arr));

lib.displayAsTreeWrapper(lib.processLinesWrapper(arr,"zamana"));  //ignores the text zamana

lib.displayAsTreeWrapper(lib.processDirWrapper("F:\\Programs\\cpp\\c++"));

var parsed = lib.processDirWrapper("C:\\Users\\Chhuma\\Desktop\\src",".");  //ignores all files/folders having "." in the name
lib.displayAsTreeWrapper(parsed);

treetocanvas.publishFlowDiagram(parsed,8888);