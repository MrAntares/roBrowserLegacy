define(['Vendors/lua.vm'], function(LUA_VM) {
    'use strict';


    function AIDriver() {}


    AIDriver.init = function init(){
        loadApp('src/Utils/lua/test.lua');
        loadApp('src/Utils/lua/AIDriver.lua');
    }


    AIDriver.exec = function exec(code) {
        try {
            L.execute(code);
        } catch(e) {
            console.error(e.toString());
        }
    }


    function loadApp(path) {
        var xmlhttp;

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if(xmlhttp.status == 200){
                    AIDriver.exec(xmlhttp.responseText);
                }
                else if(xmlhttp.status == 400) {
                    alert('There was an error 400')
                }
                else {
                    alert('something else other than 200 was returned')
                }
            }
        }

        xmlhttp.open("GET", path, true);
        xmlhttp.send();
    }

    return AIDriver;
});
