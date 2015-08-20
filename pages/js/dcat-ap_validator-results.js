/**
 * Set the result message
 * @param {String} container_id - ID of the container
 */
function setMessage(rows, container_id) {
    if (rows === 0) {
        $(container_id).after('<h2 id="congratulations">Congratulations! No Error Found.</h2>');
        $('#congratulations').css({'background-color': '#55B05A', 'color': 'white', 'font-size': '1.17em'});
    } else {
        $(container_id).after('<h2 id="sorry">Sorry! We found the following violations (' + rows + ')</h2>');
        $('#sorry').css({'background-color': '#D23D24', 'color': 'white', 'font-size': '1.17em'});
    }
}

$(document).ready(function() {
    //align the first 3 columns to the center (better before datatables otherwise the 2nd page is not aligned)
    $('#results tbody td').each(function () {
        if ($(this).index() < 3) {$(this).css('text-align', 'center'); }
    });

	$('#results tbody td').each(function () {
        if ($(this).index() > 4) {
			var text = $('#results thead th').eq($(this).index()).text();
			var query = 'SELECT (<' + text + '> AS ?subject) ?predicate ?object {<' + text + '> ?predicate ?object }';
			var url = '?query=' + query + '&output=xml&stylesheet=/xml-to-html-dcat-ap.xsl';
			var link = '<a href="' + url +'">' + text + '</a>';
			$(this).html(link);
		}
    });
    // DataTable, ordering by severity
    var table = $('#results').DataTable({"order": [[ 2, "asc" ]], "dom": 'irptflp'});

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
