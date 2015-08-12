$(document).ready(function() {
    //align the first 3 columns to the center (better before datatables otherwise the 2nd page is not aligned)
    $('#results tbody td').each(function () {
        if ($(this).index() < 3) {$(this).css('text-align', 'center'); }
    });

    // DataTable, ordering by severity
    var table = $('#results').DataTable({"order": [[ 2, "asc" ]], "dom": 'irptflp'});

    $('#results tfoot th').each(function () {
        var title = $('#results thead th').eq($(this).index()).text();
        $(this).html('<input type="text" placeholder="Search ' + title + '" />');
    });

    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).on('keyup change', function () {
            that.search(this.value).draw();
        });
    });

    if (table.data().length === 0) {
        $('#results_wrapper').prepend('<h3 id="congratulations">Congratulations! No Error Found.</h3>');
        $('#congratulations').css({'background-color': '#55B05A', 'color': 'white'});
    } else {
        $('#results_wrapper').prepend('<h3 id="sorry">Sorry! We found the following violations (' + table.data().length + ')');
        $('#sorry').css({'background-color': '#D23D24', 'color': 'white'});
    }
});