var fs   = require("fs");
var http = require("http");

function getPreparedHTML(parsed,canvasH,canvasW,err) {
    var html = `
    <html>
    <head>
    <style>
    .dropbtn {
        background-color: #3498DB;
        color: white;
        padding: 5px;
        font-size: 12px;
        border: none;
        cursor: pointer;
    }

    /* Dropdown button on hover & focus */
        .dropbtn:hover, .dropbtn:focus {
        background-color: #2980B9;
    }

    /* The container <div> - needed to position the dropdown content */
    .dropdown {
        position: relative;
        display: inline-block;
    }

    /* Dropdown Content (Hidden by Default) */
    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f1f1f1;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    /* Links inside the dropdown */
    .dropdown-content a {
        font-size: 12px;
        color: black;
        padding: 5px 6px;
        text-decoration: none;
        display: block;
    }

    /* Change color of dropdown links on hover */
    .dropdown-content a:hover {background-color: #ddd}

    /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
    .show {display:block;}

    select,button {
        height:30px;
    }
    </style>
    </head>
    <body>
    <form method="GET"><table><tr><td>
    <div class="dropdown">
    <button type="button" onclick="editMenuDropDown()" class="dropbtn">Format</button>
    <div id="myDropdown" class="dropdown-content">
    <a href="stretchX_10">Stretch X-axis 10%</a>
    <a href="stretchX_-10">Shrink  X-axis 10%</a>
    <a href="stretchY_10">Stretch Y-axis 10%</a>
    <a href="stretchY_-10">Shrink  Y-axis 10%</a>
    </div>
    </div>
    </td>
    <td><select>`;
    html+="<option value=''>choose</option>";
    for(k in parsed) {
        html+="<option value='"+k+"'>"+k+"</option>";
    }
    html+=`</select></td><td><a href="reset">Reset</a></td></tr></table></form>`;
    if(err !== undefined) {
        html += "<font color='red'>"+err+"</font><br>";
    }
    html+=`
    <canvas width="${canvasW}" height="${canvasH}" id="cnv" style="border:1px solid black;"></canvas>
    <script>
    var parsed      = ${JSON.stringify(parsed)};
    var canvasH     = ${canvasH};
    var canvasW     = ${canvasW};
    var cnv         = document.querySelector("#cnv");
    var ctx         = cnv.getContext("2d");
    ctx.font        = "11px Arial";
    ctx.strokeStyle = "blue";
    var select      = document.querySelector("select");
    var form        = document.querySelector("form");
    var gap         = 50;

    function editMenuDropDown() {
        document.getElementById("myDropdown").classList.toggle("show");
    }

    select.addEventListener("change",()=>{
        form.setAttribute("action","setImmediateDir_"+select.value);
        form.submit();
    });

    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    } 

    function generateCanvas(parsed,parentsXRange,Y,level) {
        if(parentsXRange === null && level !== 0) {
            console.log("improper arguments passed to method:[generateCanvas]");
            return;
        }
        var X    = 0;
        var cnt  = 0;
        for(k in parsed) {
            cnt += 1;
        }
        if(parentsXRange === null) {
            parentsXRange = {};
            parentsXRange.xStart = 10;
            parentsXRange.xEnd   = canvasW - 10;
            parentsXRange.xMid   = (parentsXRange.xEnd + parentsXRange.xStart)/2;
        }
        var spacing = (parentsXRange.xEnd - parentsXRange.xStart - 20)/cnt;
        var Xcoordinates = [];
        var tempCoor = parentsXRange.xStart;
        for(var i=0;i<cnt;i++) {
            Xcoordinates.push(tempCoor + spacing/2);
            tempCoor = (tempCoor + spacing);
        }
        var indx = -1;
        for(k in parsed) {
            indx += 1;
            X = Xcoordinates[indx];
            ctx.fillText(k,X,Y);
            var thisXrange = {"xStart":(Xcoordinates[indx]-spacing/2+10),"xEnd":(Xcoordinates[indx]+spacing/2-10),"xMid":Xcoordinates[indx]};
            if(level !== 0) {
                ctx.beginPath();
                ctx.moveTo(parentsXRange.xMid,Y - gap);
                ctx.lineTo(parentsXRange.xMid,Y - gap + (gap/4));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(parentsXRange.xMid,Y - gap + (gap/4));
                ctx.lineTo(thisXrange.xMid,Y - gap + (gap/4));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(thisXrange.xMid,Y - gap + (gap/4));
                ctx.lineTo(thisXrange.xMid,Y-10);
                ctx.stroke();
            }
            if(parsed[k] !== {}) {
                generateCanvas(parsed[k],thisXrange,Y+gap,level+1);
            }
        }
    }
    generateCanvas(parsed,null,50,0);
    </script>
    </body>
    </html>
    `;
    return html;
}

var parsedOriginal;

function publishFlowDiagram(parsed,PORT) {
    parsedOriginal = JSON.parse(JSON.stringify(parsed));
    if(isNaN(PORT)) {
        console.log("'"+PORT+"' is not a valid PORT [must be a number]");
        return;
    }
    var canvasH = 600;  //default
    var canvasW = 900;  //default
    var server = http.createServer((req,res)=>{
        res.writeHead(200,{"Content-Type":"text/html"});
        if(req.url === "/") {
            res.end(getPreparedHTML(parsed,canvasH,canvasW));
        } else if(req.url.indexOf("/stretchX_") === 0) {
            var zoomPercent = req.url.replace("/stretchX_","");
            if(isNaN(zoomPercent)) {
                res.end(getPreparedHTML(parsed,canvasH,canvasW,`'${zoomPercent}' is not a valid percentage value for X axis stretching.`));
            } else {
                zoomPercent = parseFloat(zoomPercent);
                if(zoomPercent >= -90.0) {
                    canvasW = canvasW+(parseFloat(zoomPercent)/100)*canvasW;
                    res.end(getPreparedHTML(parsed,canvasH,canvasW));
                } else {
                    res.end(getPreparedHTML(parsed,canvasH,canvasW,"can't shrink more than 90%"));
                }
            }
        } else if(req.url.indexOf("/stretchY_") === 0) {
            var zoomPercent = req.url.replace("/stretchY_","");
            if(isNaN(zoomPercent)) {
                res.end(getPreparedHTML(parsed,canvasH,canvasW,`'${zoomPercent}' is not a valid percentage value for Y axis stretching.`));
            } else {
                zoomPercent = parseFloat(zoomPercent);
                if(zoomPercent >= -90.0) {
                    canvasH = canvasH+(parseFloat(zoomPercent)/100)*canvasH;
                    res.end(getPreparedHTML(parsed,canvasH,canvasW));
                } else {
                    res.end(getPreparedHTML(parsed,canvasH,canvasW,"can't shrink more than 90%"));
                }
            }
        } else if(req.url.indexOf("/setImmediateDir_") === 0) {
            var immediateDir = req.url.replace("/setImmediateDir_","");
            if(parsed[immediateDir] == {}) {
                res.end(getPreparedHTML(parsed,canvasH,canvasW));
            } else if(parsed[immediateDir] === undefined) {
                res.end(getPreparedHTML(parsed,canvasH,canvasW,"'"+immediateDir+"' is not a valid node."));
            } else {
                res.end(getPreparedHTML(parsed[immediateDir],canvasH,canvasW));
                parsed = parsed[immediateDir];
            }
        } if(req.url === "/reset") {
            parsed = JSON.parse(JSON.stringify(parsedOriginal));
            res.end(getPreparedHTML(parsed,canvasH,canvasW));
        } else {
            res.end("Invalid URL '"+String(req.url)+"'");
        }
    });
    server.listen(PORT);
    console.log("listening at PORT:"+PORT+" visit http://localhost:"+PORT+" to view the 'interactive dir flow diagram'");
}

module.exports = {publishFlowDiagram:publishFlowDiagram};