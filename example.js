var i = require("./index.js");

var arr = ['org.koboso','org.koboso.zamana','org.koboso.zamana.manager'];

i.displayAsTreeWrapper(i.processLinesWrapper(arr));

i.displayAsTreeWrapper(i.processLinesWrapper(arr,"zamana"));  //ignores the text zamana

i.displayAsTreeWrapper(i.processDirWrapper("F:\\Programs\\cpp\\c++"));

i.displayAsTreeWrapper(i.processDirWrapper("F:\\Programs\\cpp\\c++","."));  //ignores all files/folders having "." in the name