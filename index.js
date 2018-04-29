var fs = require("fs");

function main(){
    var MAXLEN = process.argv.length;
    var actionName;
    var argVal;
    var ignoreTxt;
    
    if(MAXLEN>=3){
        for(var i=2;i<MAXLEN;i++) {
            var arg = process.argv[i];
            if(arg.indexOf("--") > -1) {
                if(arg == "--help") {
                    showUsage();
                } else if(arg == "--fName") {
                    if(i+1 < MAXLEN) {
                        if(actionName === undefined) {
                            actionName = arg;
                            argVal     = process.argv[i+1];
                        }
                    } else {
                        print("value for '--fName' arg not found.");
                        showUsage();
                    }
                } else if(arg == "--dir") {
                    if(i+1 < MAXLEN) {
                        actionName = arg;
                        argVal     = process.argv[i+1]
                    } else {
                        print("value for '--dir' arg not found.");
                        showUsage();
                    }
                }  else if(arg == "--ignr") {
                    if(i+1 < MAXLEN) {
                        ignoreTxt = process.argv[i+1];
                    } else {
                        print("value for '--ignr' arg not found.");
                        showUsage();
                    }
                }
            }
        }
        doAction(actionName,argVal,ignoreTxt);
    } else {
        showUsage();
    }
}

function getSeparator(dir) {
    var separator = "/";
    if(dir.indexOf("\\") > -1){
        separator = "\\";
    }
    if(dir[dir.length-1] === separator) {
        dir=dir.substring(0,dir.length-1);
    }
    return [dir,separator];
}

function doAction(actionName,argVal,ignr){
    if(actionName === "--fName") {
        processFile(argVal,ignr);
    } else if(actionName === "--dir") {
        var ret       = getSeparator(argVal);
        argVal        = ret[0];
        var separator = ret[1];
        var dirlist   = {};
        processDir(argVal,dirlist,separator,true,ignr);
        displayAsTree("",dirlist);
    } else {
        print("Unable to interpret arguments provided!");
        showUsage();
    }
}

function print(txt) {
    console.log(txt);
}

function showUsage() {
    print("Usage:");
    print("--help\tShow this usage")
    print("--fName\tFile with dot separated packages");
    print("--dir\tDirectory to trace");
    print("--ignr\tIgnore file/folder containing this text");
    process.exit(0);
}

function processFile(fName,ignr) {
    fs.readFile(fName,(err,data)=>{
        if(err) {
            print(`Error reading '${fName}'\n${err}`);
        } else {
            var lines=String(data).split("\n");
            var tree=processLines(lines,ignr);
            displayAsTree("",tree);
        }
    });
}

function objectify(arrEachElementsWithColon) {
    var obj = [];
    for(var i=0;i<arrEachElementsWithColon.length;i++) {
        var arr = arrEachElementsWithColon[i].split(":");
        if(!isNaN(parseInt(arr[0]))) {
            if(obj[parseInt(arr[0])] === undefined) {
                obj[parseInt(arr[0])] = [];
            }
            obj[parseInt(arr[0])].push(arr[1]);
        }
    }
    return obj;
}

function displayAsTreeWrapper(parsed) {
    displayAsTree("",parsed);
}

function displayAsTree(spaces,parsed){
    for(key in parsed) {
        print(spaces+">"+key);
        displayAsTree(spaces+"    ",parsed[key]);
    }
}

function processLinesWrapper(lines,ignr) {
    ignoreTxt = ignr;
    return processLines(lines,ignr);
}

function processLines(lines,ignr) {
    if(lines.length === 0){
        print("No content to process!");
    } else {
        var root = {};
        var i    = 0;
        var j    = 0;
        var line = "";
        var arr  = [];
        var curr = {};
        for(i=0;i<lines.length;i++){
            line = lines[i].trim();
            arr  = line.split(".");
            if(arr.length>0) {
                if(arr[arr.length-1].indexOf(ignr) == -1) {
                    curr = root;
                    for(j=0;j<arr.length;j++){
                        if(curr[arr[j]] === undefined){
                            curr[arr[j]] = {};
                        }
                        curr = curr[arr[j]];
                    }
                }
            }
        }
    }
    return root;
}

function processDirWrapper(dir,ignr) {
    ignoreTxt     = ignr;
    var ret       = getSeparator(dir);
    argVal        = ret[0];
    var separator = ret[1];
    var dirlist   = {};
    processDir(dir,dirlist,separator,true,ignr);
    return dirlist;
}

function processDir(dir,curr,separator,isFirst,ignr) {
    var files;
    var i;
    try {
        files = fs.readdirSync(dir);
        for(i=0;i<files.length;i++){
            if(files[i].indexOf(ignr) === -1) {
                if(curr[files[i]] === undefined){
                    curr[files[i]]={};
                }
                newDir = dir+separator+files[i];
                processDir(newDir,curr[files[i]],separator,false,ignr);
            }
        }
    } catch(exception){
        if(isFirst){
            print(`Unable to read dir '${dir}'\n${exception}`);
        }
    }
}

if(process.argv.length >= 3){
    main();
} else {
    module.exports = {processLinesWrapper:processLinesWrapper,processDirWrapper:processDirWrapper,displayAsTreeWrapper:displayAsTreeWrapper};
}
