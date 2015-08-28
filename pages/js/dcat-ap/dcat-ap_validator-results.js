/**
 * Utility functions for the results of DCAT-AP validator.
 * @license EUPL v1.1
 */

/**
 * Set the result message
 * @param {String} container_id - ID of the container
 */
function setMessage(rows, container_id) {
    var subject_index = $('#results thead th:contains("Subject")').index();
    if (subject_index !== 0) {
        if (rows === 0) {
            $(container_id).after('<h2 id="congratulations">Congratulations! No Error Found.</h2>');
            $('#congratulations').css({'background-color': '#55B05A', 'color': 'white', 'font-size': '1.17em'});
        } else {
            $(container_id).after('<h2 id="sorry">Sorry! We found the following violations (' + rows + ')</h2>');
            $('#sorry').css({'background-color': '#D23D24', 'color': 'white', 'font-size': '1.17em'});
        }
    } else {
        $('#description').hide();
    }
}

$(document).ready(function() {
    //align the first 3 columns to the center (better before datatables otherwise the 2nd page is not aligned)
    $('#results tbody td').each(function () {
        if ($(this).index() < 3) {$(this).css('text-align', 'center'); }
    });

    //improve xslt transformation on subject, predicate object
    var table,
        subject_index = $('#results thead th:contains("Subject")').index(),
        predicate_index = $('#results thead th:contains("Predicate")').index(),
        object_index = $('#results thead th:contains("Object")').index();

    $('#results tbody td').each(function () {
        if ($(this).index() === subject_index || $(this).index() === predicate_index || $(this).index() === object_index) {
            var anchor = $(this).find('a'), text, query, query_param, link;
            if (anchor.length) {
                text = $(this).text().trim();
                query = 'SELECT (<' + text + '> AS ?Subject) ?Predicate ?Object {<' + text + '> ?Predicate ?Object }';
                query_param = '&output=xml&stylesheet=/xml-to-html-dcat-ap.xsl';
                link = '<a href="?query=' + encodeURIComponent(query) + query_param + '">' + text + '</a>';
                $(this).html(link);
            }
        }
    });

    // DataTable, ordering by severity
    table = $('#results').DataTable({"order": [[ 2, "asc" ]], "dom": 'irptflp'});

    $('#results tfoot th').each(function () {
        var title, label, input;
        title = $('#results thead th').eq($(this).index()).text();
        label = '<label class="hiddenlabel" for="' + title + '">' + title + '</label>';
        input = '<input type="text" id="' + title + '" placeholder="Search ' + title + '" />';
        $(this).html(label + input);
    });

    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).on('keyup change', function () {
            that.search(this.value).draw();
        });
    });

    setMessage(table.data().length, '.banner');

});
