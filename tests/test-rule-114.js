var testid = "114", testname = casper.cli.get("testname") + testid;
casper.test.begin(testname, 4, function suite(test) {
    casper.start(casper.cli.get("url") + '/' + casper.cli.get("page"), function() {
        var file = '.\\' + casper.cli.get("testdata") + '\\' + testname + '.rdf';
        this.page.uploadFile('input[type="file"]', file);
        this.click('div.more');
        this.wait(300, function() {
            this.sendKeys('input#tab1endpoint', casper.cli.get("url") + '/' + casper.cli.get("endpoint"), {reset: true});
            if (casper.cli.has("output")) {this.capture(casper.cli.get("output") + '/' + testname + '-0.png'); }
            this.click('button[id="tab1validate"]');
        });
    });

    casper.then(function() {
        this.waitForResource(this.getCurrentUrl(), function() {
            if (casper.cli.has("output")) {this.capture(casper.cli.get("output") + '/' + testname + '-1.png'); }
            var xml = this.page.content, parser, xmlDoc, results, binding0, binding1, binding2;
            //this.echo(xml);
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(xml, 'text/xml');
            results = xmlDoc.getElementsByTagName("results")[0].childNodes;
            test.assertEquals(results.length, 7);
            binding0 = xmlDoc.getElementsByTagName("result")[0].getElementsByTagName("binding")[1].textContent.trim();
            test.assertEquals(binding0, "5");
            binding1 = xmlDoc.getElementsByTagName("result")[1].getElementsByTagName("binding")[1].textContent.trim();
            //this.echo(binding);
            test.assertEquals(binding1, testid);
            binding2 = xmlDoc.getElementsByTagName("result")[2].getElementsByTagName("binding")[1].textContent.trim();
            test.assertEquals(binding2, "142");
        }, 3000);
    });

    casper.run(function() {
        test.done();
    });
});
