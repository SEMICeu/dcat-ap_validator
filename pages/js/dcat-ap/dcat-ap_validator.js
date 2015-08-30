/**
 * Utility functions for the DCAT-AP validator.
 * @license EUPL v1.1
 */

// Global variables
var endpoint;
var graph = 'default'; //encodeURI('http://joinup.ec.europa.eu/cesar/adms#graph');
var editor, editortab1, editortab2, editortab3;
var pattern_xml = /^\s*<\?xml/;
var pattern_turtle = /^\s*@/;
var pattern_json_ld = /^\s*\{/;
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
    xmlhttp.onreadystatechange = function() {
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
    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status !== 200) {
            alert(fileURL + ' was not loaded in the triple store: ' + this.readyState + ' HTTP' + this.status + ' ' + this.statusText);
        } else if (this.readyState === 4 && this.status === 200) {
            alert(this.readyState + ' HTTP' + this.status + ' ' + this.statusText + this.responseText);
            //var blob = new Blob(["<http:\/\/www.spdx.org\/licenses\/CDDL> <http:\/\/www.spdx.org\/licenses\/CDDL> <http:\/\/www.spdx.org\/licenses\/CDDL>."], { type: "text\/turtle"});    
            var blob = new Blob([this.responseText], { type: "text\/xml"}); //text\/turtle   text\/xml
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
    xmlhttp.onreadystatechange = function() {
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
    xmlhttp.onreadystatechange = function() {
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
 * @param {string} textarea - The class of the textarea to fill.
 */
function getQuery(textarea) {
    var xmlhttp, file = "dcat-ap.rq";
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
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

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/**
 * This function is called before submitting the form1. It validates the input data, wipes the triple store, and uploads the metadata validation file, the DCAT-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm1Submit(form) {
    var fileInput, i, file, blob;
    try {
        endpoint = document.getElementById('tab1-endpoint').value;
        fileInput = document.getElementById('metadatafile');
        if (fileInput.files.length === 0) {
            window.alert('No RDF files are provided. Please provide at least one RDF file with software description metadata to validate. ');
            return false;
        }// else {
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
}

function callWebService(address) {

    var xmlhttp  = null, blob;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {// for Internet Explorer
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status !== 200) {
            alert(address + ' was not loaded in the triple store: ' + this.readyState + ' HTTP' + this.status + ' ' + this.statusText);
        } else if (this.readyState === 4 && this.status === 200) {
            //alert(this.readyState + ' HTTP' + this.status + ' ' + this.statusText + this.responseText);    
            if (pattern_xml.test(this.responseText)) {
                blob = new Blob([this.responseText], { type: "text\/xml"});
            } else if (pattern_turtle.test(this.responseText)) {
                blob = new Blob([this.responseText], { type: "text\/turtle"});
            } else if (pattern_json_ld.test(this.responseText)) {
                blob = new Blob([this.responseText], { type: "application\/ld+json"});
            } else if (pattern_n3.test(this.responseText)) {
                blob = new Blob([this.responseText], { type: "application\/n-triples"});
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
    try {
        endpoint = document.getElementById('tab2-endpoint').value;
        fileURL = document.getElementById('address').value;
        if (fileURL === "") {
            window.alert('No link has been provided');
            return false;
        }// else {
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
}

/**
 * This function is called before submitting the form3. It validates the input data, wipes the triple store, and uploads the metadata validation file, the DCAT-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onForm3Submit(form) {
    var directfile, blob;
    try {
        endpoint = document.getElementById('tab3-endpoint').value;
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
            blob = new Blob([directfile], { type: "text\/xml"});
        } else if (pattern_turtle.test(directfile)) {
            blob = new Blob([directfile], { type: "text\/turtle"});
        } else if (pattern_json_ld.test(directfile)) {
            blob = new Blob([directfile], { type: "application\/ld+json"});
        } else if (pattern_n3.test(directfile)) {
            blob = new Blob([directfile], { type: "application\/n-triples"});
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
 */
function update() {
    if (pattern_xml.test(editor.getValue())) {
        editor.setOption("mode", "xml");
    } else if (pattern_turtle.test(editor.getValue())) {
        editor.setOption("mode", "text/turtle");
    } else if (pattern_json_ld.test(editor.getValue())) {
        editor.setOption("mode", "application/ld+json");
    } else if (pattern_n3.test(editor.getValue())) {
        editor.setOption("mode", "text/n-triples");
    }
}

$(document).ready(function() {

    editor = CodeMirror.fromTextArea(document.getElementById("directinput"), {
        mode: "turtle",
        lineNumbers: true
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

    var pending;
    editor.on("change", function() {
        clearTimeout(pending);
        pending = setTimeout(update(), 400);
    });


    $("#tabs").tabs();

    getQuery("textarea.validationquery");

    $("div.more").click(function () {
        var $header = $(this),
            $icon = $("img.toggleicon"),
            $content = $header.next(),
            $active_tab = $("#tabs").tabs('option', 'active');
        //getting the next element
        $content = $header.next();
        //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
        $content.slideToggle(300, function () {
            //execute this after slideToggle is done
            //change text of header based on visibility of content div
            if ($content.is(":visible")) {
                $icon.attr('src', './images/arrow-open.png');
                if ($active_tab == 0) {
                    editortab1.refresh();
                } else if ($active_tab == 1) {
                    editortab2.refresh();
                } else if ($active_tab == 2) {
                    editortab3.refresh();
                }
            } else {
                $icon.attr('src', './images/arrow-closed.png');
            }
        });
    });
});