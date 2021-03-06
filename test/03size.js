/* jshint mocha: true */
"use strict";

var assert = require("assert");
var fs = require("fs");
var rfs = require("./helper");

describe("size", function() {
	describe("initial rotation", function() {
		before(function(done) {
			this.rfs = rfs(done, { size: "10B" });
			this.rfs.end("test\n");
		});

		it("no error", function() {
			assert.ifError(this.rfs.ev.err);
		});

		it("1 rotation", function() {
			assert.equal(this.rfs.ev.rotation, 1);
		});

		it("1 rotated", function() {
			assert.equal(this.rfs.ev.rotated.length, 1);
			assert.equal(this.rfs.ev.rotated[0], "1-test.log");
		});

		it("1 single write", function() {
			assert.equal(this.rfs.ev.single, 1);
		});

		it("0 multi write", function() {
			assert.equal(this.rfs.ev.multi, 0);
		});

		it("file content", function() {
			assert.equal(fs.readFileSync("test.log"), "test\n");
		});

		it("rotated file content", function() {
			assert.equal(fs.readFileSync("1-test.log"), "test\ntest\ntest\ntest\n");
		});
	});

	describe("single write rotation by size", function() {
		before(function(done) {
			this.rfs = rfs(done, { size: "10B" });
			this.rfs.end("test\n");
		});

		it("no error", function() {
			assert.ifError(this.rfs.ev.err);
		});

		it("1 rotation", function() {
			assert.equal(this.rfs.ev.rotation, 1);
		});

		it("1 rotated", function() {
			assert.equal(this.rfs.ev.rotated.length, 1);
			assert.equal(this.rfs.ev.rotated[0], "2-test.log");
		});

		it("1 single write", function() {
			assert.equal(this.rfs.ev.single, 1);
		});

		it("0 multi write", function() {
			assert.equal(this.rfs.ev.multi, 0);
		});

		it("file content", function() {
			assert.equal(fs.readFileSync("test.log"), "");
		});

		it("rotated file content", function() {
			assert.equal(fs.readFileSync("2-test.log"), "test\ntest\n");
		});
	});

	describe("multi write rotation by size", function() {
		before(function(done) {
			this.rfs = rfs(done, { size: "10B" });
			this.rfs.write("test\n");
			this.rfs.write("test\n");
			this.rfs.end("test\n");
		});

		it("no error", function() {
			assert.ifError(this.rfs.ev.err);
		});

		it("1 rotation", function() {
			assert.equal(this.rfs.ev.rotation, 1);
		});

		it("1 rotated", function() {
			assert.equal(this.rfs.ev.rotated.length, 1);
			assert.equal(this.rfs.ev.rotated[0], "3-test.log");
		});

		if(process.version.match(/^v0.10/)) {
			it("3 single write", function() {
				assert.equal(this.rfs.ev.single, 3);
			});

			it("0 multi write", function() {
				assert.equal(this.rfs.ev.multi, 0);
			});
		}
		else {
			it("1 single write", function() {
				assert.equal(this.rfs.ev.single, 1);
			});

			it("1 multi write", function() {
				assert.equal(this.rfs.ev.multi, 1);
			});
		}

		it("file content", function() {
			assert.equal(fs.readFileSync("test.log"), "test\n");
		});

		it("rotated file content", function() {
			assert.equal(fs.readFileSync("3-test.log"), "test\ntest\n");
		});
	});
});
