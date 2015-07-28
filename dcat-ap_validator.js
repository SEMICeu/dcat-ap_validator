/**
 * Utility functions for the DCAT-AP validator.
 * @license ISA Open Metadata Licence v1.1
 */

// Global variables
var endpoint;
var graph = 'default'; //encodeURI('http://joinup.ec.europa.eu/cesar/adms#graph');

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
            var blob = new Blob([this.responseText], { type: "text\/turtle"}); //text\/turtle   text\/xml
            uploadFile(blob, graph);
        }
    };
    xmlhttp.responseType = "text"; //text,document,arraybuffer
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
    xmlhttp.open("POST", endpoint + "/update", false);
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
 * @param {string} file - File in which the query is stored.
 * @returns {string} The query stored in the file
 */
function getQuery(file) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert('Error when opening the file: ' + file + ' - ' + xmlhttp.status + ' ' + xmlhttp.statusText);
        }
    };
    xmlhttp.open("GET", file, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

/**
 * Extracts a query from a file to be copied in the form
 */
function setQuery() {
    var query, id;
    query = getQuery("/rules/dcat-ap.rq");
    id = "validationquery";
    document.getElementById(id).innerHTML = query;
}

/**
 * This function is called before submitting the form. It validates the input data, wipes the triple store, and uploads the metadata validation file, the DCAT-AP schema, and the taxonomies.
 * @param {Object} form - HTML form used for the validation.
 * @returns {boolean} True if the operation succeeded, false otherwise
 */
function onFormSubmit(form) {
    var fileInput, i, file;
    try {
        endpoint = document.getElementById('endpoint').value;
        fileInput = document.getElementById('metadatafile');
        if (fileInput.files.length === 0) {
            window.alert('No RDF files are provided. Please provide at least one RDF file with software description metadata to validate. ');
            return false;
        }// else {
        //runUpdateQuery('CLEAR DEFAULT'); //wipes the default graph in the triple store
        runUpdateQuery('DROP GRAPH <' + graph + '>'); //wipes the named graph in the triple store
        //getAndLoadFile(admssw_taxonomies); //gets the taxonomies from the webserver and loads it into the triple store
        //getAndLoadFile(admssw_schema); //gets the schema file from the webserver and loads it into the triple store
        for (i = 0; i < fileInput.files.length; i = i + 1) {
            file = fileInput.files[i];
            uploadFile(file, graph); //uploads the metadata file
        }
        form.action = endpoint + '/query'; //The validation query will be called from the form
        return true;
        //}
    } catch (e) {
        alert('Error: ' + e.message);
        return false;
    }
}