/**
 * Utility functions for the DCAT-AP validator.
 * @license EUPL v1.1
 */

// Global variables
/**
 * Endpoint set by the html form.
 */
var endpoint;
/**
 * Graph name on which execute the query.
 */
var graph = 'default'; //encodeURI('http://joinup.ec.europa.eu/cesar/adms#graph');
/**
 * Instances of the Codemirror used in the tabs.
 */
var editor, editortab1, editortab2, editortab3;
/**
 * Pattern to identify an XML file
 */
var pattern_xml = /^\s*<\?xml/;
/**
 * Pattern to identify an Turtle file
 */
var pattern_turtle = /^\s*@/;
/**
 * Pattern to identify an JSON-LD file
 */
var pattern_json_ld = /^\s*\{/;
/**
 * Pattern to identify an N3 file
 */
var pattern_n3 = /^\s*<http/;

/**
 * Uploads a file
 * @param {string} file - File to be added.
 * @param {string} graph - The graph of the RDF.
 */
function uploadFile(file, graph) {
    var xmlhttp, formData;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    formData = new FormData();
    formData.append('file', file);
    formData.append('graph', graph);
    xmlhttp.open('POST', endpoint + "/upload", false);
    xmlhttp.send(formData);
}

/**
 * Retrieves a file from a given URL and loads it into the triple store.
 * WARNING: does only work on Chrome with proper security settings. We need to await HTML5.
 * @param {string} fileURL - URL of the file to be loaded.
 */
function getAndLoadFile(fileURL) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 200) {
            alert(fileURL + ' was not loaded in the triple store: ' + this.readyState + ' HTTP' + this.status + ' ' + this.statusText);
        } else if (this.readyState === 4 && this.status === 200) {
            alert(this.readyState + ' HTTP' + this.status + ' ' + this.statusText + this.responseText);
            //var blob = new Blob(["<http:\/\/www.spdx.org\/licenses\/CDDL> <http:\/\/www.spdx.org\/licenses\/CDDL> <http:\/\/www.spdx.org\/licenses\/CDDL>."], { type: "text\/turtle"});
            var blob = new Blob([this.responseText], {type: "text\/xml"}); //text\/turtle   text\/xml
            uploadFile(blob, graph);
        }
    };
    xmlhttp.responseType = "text/xml"; //text,document,arraybuffer
    xmlhttp.open("GET", fileURL, true);  //must be asynchronous - third parameter true
    xmlhttp.send();
}

/**
 * Runs an update query
 * @param {string} query - Query to be executed on the datastore.
 */
function runUpdateQuery(query) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    xmlhttp.open("POST", endpoint + "/update", false); // must be false for casperjs tests
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8;');
    xmlhttp.send('update=' + encodeURIComponent(query));
}

/**
 * Runs a query (not used here)
 * @param {string} query - Query to be executed on the datastore.
 * @returns {string} The response of the query
 */
function runQuery(query) {
    var xmlhttp, url;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert(xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    url = endpoint + "/query?" + encodeURIComponent(query);
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

/**
 * Gets SPARQL query from file
 */
function getQuery(file) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert('Error when opening the file: ' + file + ' - ' + xmlhttp.status + ' ' + xmlhttp.statusText);
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            //$(textarea).text(xmlhttp.responseText);
            editortab1.setValue(xmlhttp.responseText);
            editortab2.setValue(xmlhttp.responseText);
            editortab3.setValue(xmlhttp.responseText);
        }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    return xmlhttp.responseText;
}

function loadFile(file) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert('Error when opening the file: ' + file + ' - ' + xmlhttp.status + ' ' + xmlhttp.statusText);
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            editor.setValue(xmlhttp.responseText);
        }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    return xmlhttp.responseText;
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function validateMetadata(metadatafile, metadatafileerror) {
    var fileInput = document.getElementById(metadatafile),
        isFilled = fileInput.files.length > 0;
    if (isFilled) {
        $(metadatafileerror).text("");
        return true;
    }
    if (!isFilled) {
        $(metadatafileerror).text("The RDF file is a required field.");
        return false;
    }
}

function validateEndpoint(endpoint, endpointerror, subject) {
    var value = $(endpoint).val(),
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        isFilled = value.length > 0,
        isUrl = urlRegex.test(value);
    if (isFilled && isUrl) {
        $(endpointerror).text("");
        return true;
    }
    if (!isFilled) {
        $(endpointerror).text("The " + subject + " is a required field.");
        return false;
    }
    if (!isUrl) {
        $(endpointerror).text("The " + subject + " is not a valid URL.");
        return false;
    }
}

function validateQuery(query, queryerror) {
    var isFilled = query.getValue() !== "";
    if (isFilled) {
        $(queryerror).text("");
        return true;
    }
    if (!isFilled) {
        $(queryerror).text("The SPARQL query is a required field.");
        return false;
    }
}

$("#metadatafile").change(function() {
    validateMetadata("metadatafile", "#metadatafileerror");
});

$("#tab1endpoint").focusout(function() {
    validateEndpoint("#tab1endpoint", "#tab1endpointerror", "SPAQL endpoint");
});

editortab1.on("change", function () {
    validateQuery(editortab1, "#editortab1error");
});

$("#address").focusout(function() {
    validateEndpoint("#address", "#addresserror", "address of the RDF file");
});

$("#tab2endpoint").focusout(function() {
    validateEndpoint("#tab2endpoint", "#tab2endpointerror", "SPAQL endpoint");
});

$("#tab3endpoint").focusout(function() {
    validateEndpoint("#tab3endpoint", "#tab3endpointerror", "SPAQL endpoint");
});

function validateForm1() {
    var cond_metadata = validateMetadata("metadatafile", "#metadatafileerror"),
        cond_endpoint = validateEndpoint("#tab1endpoint", "#tab1endpointerror"),
        cond_query = validateQuery(editortab1, "#editortab1error");
    if (cond_metadata && cond_endpoint && cond_query) {
        return true;
    }
    return false;
}

function validateForm2() {
    var cond_address = validateEndpoint("#address", "#addresserror"),
        cond_endpoint = validateEndpoint("#tab2endpoint", "#tab2endpointerror"),
        cond_query = validateQuery(editortab2, "#editortab2error");
    if (cond_address && cond_endpoint && cond_query) {
        return true;
    }
    return false;
}

function validateForm3() {
    if (validateEndpoint("#tab3endpoint", "#tab3endpointerror")) {
        return true;
    }
    return false;
}


/**
 * This function is called before submitting the form1. It validates the input data, wipes the triple store, and uploads the metadata validation file, the DCAT-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm1Submit(form) {
    var fileInput, i, file, blob;
    if (validateForm1()) {
        try {
            endpoint = document.getElementById('tab1endpoint').value;
            fileInput = document.getElementById('metadatafile');
            if (graph === 'default') {
                runUpdateQuery('CLEAR DEFAULT'); //wipes the default graph in the triple store
            } else {
                runUpdateQuery('DROP GRAPH <' + graph + '>'); //wipes the named graph in the triple store
            }
            //getAndLoadFile(admssw_taxonomies); //gets the taxonomies from the webserver and loads it into the triple store
            //getAndLoadFile(admssw_schema); //gets the schema file from the webserver and loads it into the triple store
            for (i = 0; i < fileInput.files.length; i = i + 1) {
                file = fileInput.files[i];
                if (file.name.endsWith("json") || file.name.endsWith("jsonld")) {
                    blob = new Blob([file], {type: "application/ld+json"});
                    uploadFile(blob, graph);
                } else {
                    uploadFile(file, graph); //uploads the metadata file
                }
            }
            form.action = endpoint + '/query'; //The validation query will be called from the form
            return true;
            //}
        } catch (e) {
            alert('Error: ' + e.message);
            return false;
        }
        return true;
    }
    return false;
}

function callWebService(address) {

    var xmlhttp = null, blob;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {// for Internet Explorer
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status !== 200) {
            alert(address + ' was not loaded in the triple store: ' + this.readyState + ' HTTP' + this.status + ' ' + this.statusText);
        } else if (this.readyState === 4 && this.status === 200) {
            //alert(this.readyState + ' HTTP' + this.status + ' ' + this.statusText + this.responseText);
            if (pattern_xml.test(this.responseText)) {
                blob = new Blob([this.responseText], {type: "text\/xml"});
            } else if (pattern_turtle.test(this.responseText)) {
                blob = new Blob([this.responseText], {type: "text\/turtle"});
            } else if (pattern_json_ld.test(this.responseText)) {
                blob = new Blob([this.responseText], {type: "application\/ld+json"});
            } else if (pattern_n3.test(this.responseText)) {
                blob = new Blob([this.responseText], {type: "application\/n-triples"});
            }
            uploadFile(blob, graph);
        }
    };

    //xmlhttp.responseType = "text"; //text,document,arraybuffer, IE11 doesn't like it
    xmlhttp.open("GET", address, false);  //must be asynchronous - third parameter true
    xmlhttp.send();

}

/**
 * This function is called before submitting the form2. It validates the input data, wipes the triple store, and uploads the metadata validation file, the DCAT-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm2Submit(form) {
    var fileURL, url, list, address;
    if (validateForm2()) {
        try {
            endpoint = document.getElementById('tab2endpoint').value;
            fileURL = document.getElementById('address').value;
            if (graph === 'default') {
                runUpdateQuery('CLEAR DEFAULT'); //wipes the default graph in the triple store
            } else {
                runUpdateQuery('DROP GRAPH <' + graph + '>'); //wipes the named graph in the triple store
            }
            //getAndLoadFile(admssw_taxonomies); //gets the taxonomies from the webserver and loads it into the triple store
            //getAndLoadFile(admssw_schema); //gets the schema file from the webserver and loads it into the triple store
            //file = getFileFromURL(fileURL);
            //getAndLoadFile(fileURL,form); //uploads the metadata file
            url = "http://localhost/dcat-ap_validator/dcat-ap_validator.php?";
            list = "url=" + encodeURIComponent(fileURL);
            address = url + list;
            callWebService(address);
            form.action = endpoint + '/query'; //The validation query will be called from the form
            return true;
            //}
        } catch (e) {
            alert('Error: ' + e.message);
            return false;
        }
        return true;
    }
    return false;
}

/**
 * This function is called before submitting the form3. It validates the input data, wipes the triple store, and uploads the metadata validation file, the DCAT-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm3Submit(form) {
    var directfile, blob;
    try {
        endpoint = document.getElementById('tab3endpoint').value;
        if (editor === "undefined") {
            directfile = document.getElementById('directinput').value;
        } else {
            directfile = editor.getValue();
        }
        if (directfile === "") {
            window.alert('No RDF input has been provided');
            return false;
        }// else {
        if (graph === 'default') {
            runUpdateQuery('CLEAR DEFAULT'); //wipes the default graph in the triple store
        } else {
            runUpdateQuery('DROP GRAPH <' + graph + '>'); //wipes the named graph in the triple store
        }
        //getAndLoadFile(admssw_taxonomies); //gets the taxonomies from the webserver and loads it into the triple store
        //getAndLoadFile(admssw_schema); //gets the schema file from the webserver and loads it into the triple store
        //See https://jena.apache.org/documentation/io/rdf-input.html
        if (pattern_xml.test(directfile)) {
            blob = new Blob([directfile], {type: "text\/xml"});
        } else if (pattern_turtle.test(directfile)) {
            blob = new Blob([directfile], {type: "text\/turtle"});
        } else if (pattern_json_ld.test(directfile)) {
            blob = new Blob([directfile], {type: "application\/ld+json"});
        } else if (pattern_n3.test(directfile)) {
            blob = new Blob([directfile], {type: "application\/n-triples"});
        }
        uploadFile(blob, graph);
        form.action = endpoint + '/query'; //The validation query will be called from the form
        return true;
        //}
    } catch (e) {
        alert('Error: ' + e.message);
        return false;
    }
}

/**
 * This function is called when updating the syntax highlighting of the codemirror editor.
   * @param {Object} editor_instance - the editor to be updated.
 */
function updateEditor() {
    var editor_value = editor.getValue();
    if (pattern_xml.test(editor_value)) {
        editor.setOption("mode", "xml");
    } else if (pattern_turtle.test(editor_value)) {
        editor.setOption("mode", "text/turtle");
    } else if (pattern_json_ld.test(editor_value)) {
        editor.setOption("mode", "application/ld+json");
    } else if (pattern_n3.test(editor_value)) {
        editor.setOption("mode", "text/n-triples");
    }
}
/**
 * This function is called when a "more option" menu is expanded or contracted.
  * @param {string} taboption - the tab option selector.
  * @param {Object} editortab - the instance of the codemirror editor to be refreshed
 */
function toggle(taboption, editortab) {
    var $icon = $(taboption + " img.toggleicon"),
        $content = $(taboption).next();

    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
    $content.slideToggle(300, function () {
        //execute this after slideToggle is done
        if ($content.is(":visible")) {
            $icon.attr('src', './images/arrow-open.png');
            editortab.refresh();
        } else {
            $icon.attr('src', './images/arrow-closed.png');
        }
    });
}

$(document).ready(function () {

    editor = CodeMirror.fromTextArea(document.getElementById("directinput"), {
        mode: "turtle",
        lineNumbers: true,
        extraKeys: {
            "F11": function (cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) {
                    cm.setOption("fullScreen", false);
                }
            }
        }
    });

    var pending;
    editor.on("change", function () {
        clearTimeout(pending);
        pending = setTimeout(updateEditor(), 400);
    });

    editortab1 = CodeMirror.fromTextArea(document.getElementById("tab1validationquery"), {
        mode: "turtle",
        lineNumbers: true
    });
    editortab2 = CodeMirror.fromTextArea(document.getElementById("tab2validationquery"), {
        mode: "turtle",
        lineNumbers: true
    });
    editortab3 = CodeMirror.fromTextArea(document.getElementById("tab3validationquery"), {
        mode: "turtle",
        lineNumbers: true
    });

    $("#tabs").tabs();

    getQuery("dcat-ap.rq");

    $("#tab1options div.more").click(function () {
        toggle("#tab1options div.more", editortab1);
    });

    $("#tab2options div.more").click(function () {
        toggle("#tab2options div.more", editortab2);
    });

    $("#tab3options div.more").click(function () {
        toggle("#tab3options div.more", editortab3);
    });

    $("#loadsample1").click(function () {
        loadFile("samples/sample-turtle.ttl");
    });

    $("#loadsample2").click(function () {
        loadFile("samples/sample-xml.rdf");
    });

    $("#loadsample3").click(function () {
        loadFile("samples/sample-n-triples.nt");
    });

    $("#loadsample4").click(function () {
        loadFile("samples/sample-json-ld.jsonld");
    });
});