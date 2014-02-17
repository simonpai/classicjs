var assert = require('assert'),
	cj = require('../out/classic.js');

describe('Class', function() {
	
	var A, B, C;
	
	before(function() {
		
		A = cj.Class.extend({
			x: 10,
			y: function () {
				return this.x;
			}
		});
		
		B = A.extend(function (z) {
			
			this.super();
			
			var _z = z;
			
			return {
				y: function () {
					return this.x + _z;
				}
			};
		});
		
		C = B.extend(function (z, w) {
			
			this.super(z);
			
			var _w = w;
			
			this.w = function () {
				return _w;
			};
		});
		
	});
	
	describe('reflection members', function() {
		it('Extended class should attain reflection members', function() {
			assert.equal(cj.Class.extend, A.extend);
			assert.equal(cj.Class.extend, B.extend);
			assert.equal(cj.Class.extend, C.extend);
			assert.equal(cj.Class.mixin, A.mixin);
			assert.equal(cj.Class.mixin, B.mixin);
			assert.equal(cj.Class.mixin, C.mixin);
			assert.equal(cj.Class.isTypeOf, A.isTypeOf);
			assert.equal(cj.Class.isTypeOf, B.isTypeOf);
			assert.equal(cj.Class.isTypeOf, C.isTypeOf);
		});
	});
	
	describe('overridden members', function() {
		it('Extended class should override members as expected', function() {
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
	
});
