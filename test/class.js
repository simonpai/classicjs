var assert = require('assert'),
	cj = require('../out/classic.js');

describe('Extend', function() {
	
	describe('overridden members', function() {
		it('Extended class should override members as expected.', function() {
			
			var A = cj.extend(Object, {
				x: 10,
				y: function () {
					return this.x;
				}
			});
			var B = cj.extend(A, function (z) {
				
				var _z = z;
				
				return {
					y: function () {
						return this.x + _z;
					}
				};
			});
			var C = cj.extend(B, function (z, w) {
				
				var _w = w;
				
				this.w = function () {
					return _w;
				};
			});
			var a = new A(),
				b = new B(20),
				c = new C(40, 80);
			
			assert.equal(a.x, b.x);
			assert.equal(a.x, c.x);
			
			assert.equal(a.x, a.y());
			assert.equal(b.x + 20, b.y());
			assert.equal(c.x + 40, c.y());
			
			assert.equal(80, c.w());
		});
	});
	
	describe('suber object', function() {
		it('Extended class should have correct super object references.', function() {
			
			var A = cj.extend(Object, {
				r: function () {
					return 10;
				}
			});
			var B = cj.extend(A, {
				r: function () {
					return this.super.r() + 10;
				}
			});
			var C = cj.extend(B, {
				r: function () {
					return this.super.r() + 10;
				}
			});
			var a = new A(),
				b = new B(),
				c = new C();
			
			assert.equal(10, a.r());
			assert.equal(20, b.r());
			assert.equal(30, c.r());
		});
	});
	
	describe('explicit super constructor', function() {
		it('Explicit super constructor pattern should work as expected.', function() {
			var Z = cj.extend(Object, {
				y: function () {
					return 0;
				}
			});
			var A = cj.extend(Z, function (x) {
				this.x = x;
				return {
					y: function () {
						return 10;
					}
				};
			});
			var B = cj.extend(function () {
				return new A(10);
			}, {
				y: function () {
					return 20;
				}
			});
			
			var b = new B();
			assert.equal(10, b.x);
			assert.equal(10, b.super.y());
			assert.equal(0, b.super.super.y());
			
		});
	});
	
});
