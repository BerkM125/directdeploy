const http = require('http');
const url = require('url');
const fs = require('fs');
const createHTML = require('create-html');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const ip4 = '192.168.1.236'; //ipv4 address
const { COPYFILE_EXCL } = fs.constants;
const filignore = [".gitignore", "runserver.bat", "servermain.js", "mainstylesheet.css"];
let portnum = 8080;
let html;
let contentType = {'Content-Type':'text/html'};

function arrayinstr (string, array) {
    for(let i = 0; i < array.length; i++) {
        if(string.includes(array[i])) return true;
    }
    return false;
}

function processContentType (filename) {
    if(arrayinstr(filename, filignore) === false) {
        if(filename.includes('.js') === true) {
            contentType["Content-Type"] = 'text/javascript';
        }
        if(filename.includes('.html') === true || filename.includes('.txt') === true) {
            contentType["Content-Type"] = 'text/html';
        }
        if(filename.includes('.css') === true) {
            contentType["Content-Type"] = 'text/css';
        }
        if(filename.includes('.jpg') === true || filename.includes('.JPG') === true || filename.includes('.png') === true || filename.includes('.PNG') === true || filename.includes('.bmp') === true || filename.includes('.BMP')) {
            contentType["Content-Type"] = 'image';
        }
        if(filename.includes('.mp4') === true || filename.includes('.MP4') === true || filename.includes('.wmv') === true || filename.includes('.WMV') === true || filename.includes('.avi') === true || filename.includes('.AVI')) {
            contentType["Content-Type"] = 'video';
        }
        if(filename.includes('.exe') === true) {
            contentType["Content-Type"] = 'executable';
        }
        if(filename.includes('.apk') === true || filename.includes('.APK') === true) {
            contentType["Content-Type"] = 'apk';
        }
        if(filename.includes('.zip') === true) {
            contentType["Content-Type"] = 'compressed';
        }
        if(filename.includes('.pdf') === true) {
            contentType["Content-Type"] = 'application/pdf';
        }
        return contentType["Content-Type"];
    }
    else return 'IGNORE';
}


function createHTMLContent (filelist, size) {
    let htmlContent = `<h1>Main Server Navigational Page</h1>\n<table>\n<tr>\n<th>File Names</th>\n<th>File Type</th>\n<th>Options</th>\n</tr>`;
    for(var i = 0; i < size; i++) {
        let ct = processContentType(filelist[i]);
        if(ct === 'image')
            htmlContent = htmlContent.concat(`\n<tr>\n<td><img src="${filelist[i]}" width="100px"/></td>\n<td>${processContentType(filelist[i])}</td>\n<td><a href="http://${ip4}:${portnum}/${filelist[i]}">View</a><a style="margin-left:10px;" href="http://${ip4}:${portnum}/${filelist[i]}" download="${filelist[i]}">Download</a></td>\n</tr>`);
        else if(ct === 'IGNORE') {
            //We want the css to take effect, so we have to set the content type to text/css
            contentType["Content-Type"] = 'text/css';
            htmlContent = htmlContent.concat(`\n</table>`);
            return htmlContent;
        }
        else
            htmlContent = htmlContent.concat(`\n<tr>\n<td>${filelist[i]}</td>\n<td>${processContentType(filelist[i])}</td>\n<td><a href="http://${ip4}:${portnum}/${filelist[i]}">View</a><a style="margin-left:10px;" href="http://${ip4}:${portnum}/${filelist[i]}" download="${filelist[i]}">Download</a></td>\n</tr>`);
    }
    htmlContent = htmlContent.concat(`\n</table>`);
    return htmlContent;
}

//Expect to move over to express soon
var source = function (req, res) {
    var path = url.parse(req.url, true);
    var filelist = new Array(100);
    var fn = "." + path.pathname;
    let index = 0;
    let htmlContent;
    let dbhtmlContent;
    console.log("req.url: "+req.url);
    if(req.url.includes(".")) {
        fs.readdirSync(__dirname).forEach(file => {
            filelist[index] = file;
            index++;
        });
        htmlContent = createHTMLContent(filelist, index);
        html = createHTML({
            title: 'Index',
            lang: 'en',
            css: 'mainstylesheet.css',
            body: htmlContent
        });
        fs.writeFile('index.html', html, function(err) {
            if (err) console.log(err);
        });
        console.log(fn);
        processContentType (fn);
        if(fn != './') {
            fn.replace(/ /gi, '%20');
            fs.readFile(fn, function(err, data) {
            if (err) {
                res.writeHead(404, contentType);
                return res.end("404 Not Found");
            } 
            res.writeHead(200, contentType);
            res.write(data);
            return res.end();
            });
        }
        else {
            fs.readFile('index.html', function(err, data) {
                if (err) {
                    res.writeHead(404, contentType);
                    return res.end("404 Not Found");
                } 
                res.writeHead(200, {'Content-Type':'text/html'});
                res.write(data);
                return res.end();
            });
        }
    }
    else if(req.url.includes("?data")) {
        var getData = req.url;
        console.log(getData);
    }
    else {
        req.on('data', function (chunk) {
            console.log("CHUNK POST data: " + chunk.toString());
            var filedata = chunk.toString().split("&")[1];
            console.log(chunk.includes("msg%3A"));
            if(chunk.toString().includes("msg%3A")) {
                var msgsplit = chunk.toString().split("msg%3A");
                var msg = msgsplit[1];
                console.log("msg: " + msg);
                msgsplit = msg.split("+");
                msg = "";
                for(var i = 0; i < msgsplit.length; i++) {
                    msg = msg.concat(msgsplit[i] + " ");
                }
            }
        });
        res.end();
    }
}

http.createServer(source).listen(portnum, ip4);

function callback(err) {
    if (err) throw err;
}