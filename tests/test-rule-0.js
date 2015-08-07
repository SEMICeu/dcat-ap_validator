var test_id='test-rule-0';
casper.test.begin(test_id, 2, function suite(test) {
	casper.start(casper.cli.get("url"), function() {
		this.page.uploadFile('input[type="file"]', '.\\' + casper.cli.get("testdata")+'\\' + test_id + '.rdf');
		this.capture(casper.cli.get("output")+'/' + test_id + '-0.png');
		this.click('button[id="validate"]');
		});

	casper.then(function() {
	  this.waitForResource(this.getCurrentUrl(),function() {
		this.capture(casper.cli.get("output")+'/' + test_id + '-1.png');
		var xml = this.page.content;
		//this.echo(xml);
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(xml,'text/xml');
		var results = xmlDoc.getElementsByTagName("results")[0].childNodes;
		test.assertEquals(results.length,3);
		var binding = xmlDoc.getElementsByTagName("binding")[1].textContent.trim();
		//this.echo(binding);
		test.assertEquals(binding,"0");
	  },function() {
		//page load failed after 5 seconds
	  },5000);
	});

casper.run(function() {
        test.done();
    });
});