var assert = require('assert');

describe('wsProxy', function() {
	it('Start server', function(done) {
		try {
			require('../index.js');
		}
		catch(e) {
			done(e);
		}

		setTimeout(function() { done() }, 1000);
	})
})
