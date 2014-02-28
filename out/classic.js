// UMD
// https://github.com/umdjs/umd/blob/master/returnExports.js
((function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.classic = factory();
	}
})(this, function () {



// extend //
var _finalize = function (name, value, enumerable) {
	Object.defineProperty(this, name, {
		enumerable: enumerable || enumerable == null,
		value: value
	});
};

var extend = function (Class, prop) {
	
	var pisf = typeof prop === 'function';
	
	return function () {
		
		var args = Array.prototype.slice.call(arguments);
		args.unshift(null);
		
		var _super = new (Class.bind.apply(Class, args))(),
			_this = Object.create(_super),
			p;
		
		_this.finalize = _finalize;
		p = (pisf ? prop.apply(_this, arguments) : prop) || {};
		delete _this.finalize;
		
		for (var name in p)
			_this[name] = p[name];
		
		// prepare super object
		Object.defineProperty(_this, 'super', {
			get: function () {
				return _super;
			}
		});
		
		return _this;
	};
	
};

// TODO: mixin



// Collection //
var List = extend(Array, function (obj) {
	
	if (Array.isArray(obj))
		for (var i = 0, len = obj.length; i < len; i++)
			this.push(obj[i]);
	
	Object.defineProperty(this, 'isEmpty', {
		get: function () {
			return this.length == 0;
		}
	});
	
	Object.defineProperty(this, 'first', {
		get: function () {
			return this[0];
		}
	});
	
	Object.defineProperty(this, 'last', {
		get: function () {
			return this[this.length - 1];
		}
	});
	
	var _checkIndex = function (index) {
		if (typeof index !== 'number')
			throw "Index must be a number or null " + index;
		if (index < 0 || index > this.length)
			throw "Index out of bound: " + index + ", length: " + this.length;
	};
	
	return {
		
		contains: function (object) {
			return !!this.indexOf(object);
		},
		
		add: function (object, index) {
			if (index == null)
				this.push(object);
			_checkIndex(index);
			this.splice(index, 0, object);
		},
		
		remove: function (object) {
			var index = this.indexOf(object);
			if (index < 0)
				return false;
			this.splice(index, 1);
			return true;
		},
		
		removeAt: function (index) {
			_checkIndex(index);
			var value = this[index];
			this.splice(index, 1);
			return value;
		}
		
	};
});

var Map = extend(Object, function (obj) {
	var _inner = obj || {};
	
	Object.defineProperty(this, 'isEmpty', {
		get: function () {
			return Object.getOwnPropertyNames(_inner).length == 0;
		}
	});
	
	// TODO: entries, Iterable
	
	return {
		
		get: function (key, create) {
			var value = _inner[key];
			if (value === undefined && create != null)
				_inner[key] = value = typeof create === 'function' ? create() : create;
			return value;
		},
		
		put: function (key, value) {
			_inner[key] = value;
		},
		
		remove: function (key) {
			var value = _inner[key];
			delete _inner[key];
			return value;
		},
		
		clear: function () {
			_inner = {};
		},
		
		keys: function () {
			var values = new List();
			for (var key in _inner)
				values.push(key);
			return values;
		},
		
		values: function () {
			var values = new List();
			for (var key in _inner)
				values.push(_inner[key]);
			return values;
		},
		
		forEach: function (f) {
			for (var key in _inner)
				f(key, _inner[key]);
		}
		
	};
});

var Set = extend(Object, function (obj) {
	var _inner = {};
	
	var _add = function (v) {
		_inner[v] = 1;
	};
	
	if (obj) {
		if (Array.isArray(obj))
			obj.forEach(_add);
		else
			for (var key in obj)
				_add(key);
	}
	
	Object.defineProperty(this, 'isEmpty', {
		get: function () {
			return Object.getOwnPropertyNames(_inner).length == 0;
		}
	});
	
	return {
		
		contains: function (value) {
			return !!_inner[value];
		},
		
		add: _add,
		
		remove: function (value) {
			var c = this.contains(value);
			delete _inner[value];
			return c;
		},
		
		clear: function () {
			_inner = {};
		},
		
		forEach: function (f) {
			for (var key in _inner)
				f(key);
		}
		
	};
});

var Model = extend(Object, function () {
	
	var _handlers;
	
	var _on = function (name, handler) {
		if (_handlers == null)
			_handlers = new Map();
		_handlers.get(name, function () {
			return new List();
		}).push(handler);
		return this;
	};
	var _off = function (name, handler) {
		if (!_handlers)
			return;
		if (!handler) {
			_handlers.remove(name);
			return;
		}
		var list = _handlers.get(name);
		if (!list)
			return;
		list.remove(handler);
		if (list.isEmpty)
			_handlers.remove(name);
		return this;
	};
	var _applyForCollection = function (f, a, b) {
		// ([a1, a2, a3], b)
		if (Array.isArray(a)) {
			a.forEach(function (n) {
				f(n, b);
			});
			return;
		}
		// ({ a1: b1, a2: b2, a3: b3 })
		if (b == null) {
			if (Map.isTypeOf(a))
				a.forEach(f);
			else
				for (var key in a)
					f(key, a[key]);
			return;
		}
	};
	
	return {
		
		on: function (name, handler) {
			_applyForCollection(_on, name, handler);
			return this;
		},
		
		off: function (name, handler) {
			_applyForCollection(_off, name, handler);
			return this;
		},
		
		trigger: function (name, data) {
			if (!_handlers)
				return;
			var list = _handlers.get(name);
			if (!list)
				return;
			list.forEach(function (handler) {
				handler(data);
			});
			return this;
		}
		
	};
});

var _normalizeListModelArgument = function (list) {
	if (list == null)
		return new List();
	if (List.isTypeOf(list))
		return list;
	if (Array.isArray(list))
		return new List(list);
	return new List([list]);
}

var ListModel = extend(Model, function (list) {
	
	var _list = _normalizeListModelArgument(list);
	
	Object.defineProperty(this, 'internal', {
		get: function () {
			return _list;
		}
	});
	
	return {
		
		load: function (list, source) {
			_list = _normalizeListModelArgument(list);
			trigger('load', {
				name: 'load',
				data: _list,
				source: source
			});
		},
		
		update: function (item, source) {
			var index = _list.indexOf(item);
			if (index < 0)
				return;
			trigger('update', {
				name: 'update', 
				data: item,
				index: index,
				source: source
			});
		},
		
		add: function (item, index, source) {
			// (item, source)
			if (typeof index !== 'number' && source != null) {
				source = index;
				index = null;
			}
			this._add(item, index);
			trigger('add', {
				name: 'add', 
				data: item,
				index: index,
				source: source
			});
		},
		_add: function (item, index) {
			_list.add(item, index);
		},
		
		remove: function (item, source) {
			var index = _list.indexOf(item);
			if (index < 0)
				return;
			this._remove(item);
			trigger('remove', {
				name: 'remove',
				data: item,
				index: index,
				source: source
			});
		},
		_remove: function (item) {
			_list.remove(item);
		}
		
	};
	
});

var View = extend(Object, function (element, model) {
	
	// ($element)
	if (element && Array.isArray(element) && element.length)
		element = element[0];
	
	if (element)
		this.element = element;
	if (model)
		this.model = model;
	
});

var _voidFunc = function () {};

var _copy = function (obj, prop) {
	if (obj == null)
		return null;
	
	prop = prop || {};
	var includes = Array.isArray(prop.in) && prop.in,
		excludes = Array.isArray(prop.ex) && new Set(prop.ex),
		target = prop.tar || {};
	
	(includes || Object.keys(obj)).forEach(function (k) {
		if (excludes && excludes.contains(k))
			return;
		target[k] = obj[k];
	});
	
	return target;
}

var ListView = extend(function (element, model, renderer) {
	
	return new View(element, model || new ListModel());
	
}, function (element, model, renderer) {
	
	// make model private and control access by getter/setter
	var _model = this.model;
	
	var _applyModel = function (f) {
		if (!_model)
			return;
		_model[f](this._listeners);
	};
	_applyModel('on');
	
	Object.defineProperty(this, 'model', {
		get: function () {
			return _model;
		},
		set: function (v) {
			_applyModel('off');
			_model = v;
			_applyModel('on');
		}
	});
	
	this.renderer = renderer;
	
	var _defaultRenderer = {
		create: function (item, listView) {
			var elem = document.createElement('div');
			elem._item = item;
			return elem;
		},
		update: function (element, item, listView) {
			element.innerHTML = '' + item;
		},
		show: _voidFunc,
		hide: _voidFunc
	};
	
	var _renderFunc = function (func) {
		return (this.renderer && this.renderer[func]) || _defaultRenderer[func];
	};
	
	return {
		
		_listeners: _clonePlainObject({
			load: function (event) {
				this.load(event.data, event.source);
			},
			update: function (event) {
				this.update(event.item, event.index, event.source);
			},
			add: function (event) {
				this.add(event.item, event.index, event.source);
			},
			remove: function (event) {
				this.remove(event.item, event.index, event.source);
			}
		}),
		
		clear: function () {
			this.element.innerHTML = '';
		},
		
		load: function (list, source) {
			this.clear();
			if (list == null || !Array.isArray(list))
				return;
			var _create = _renderFunc['create'],
				_update = _renderFunc['update'],
				_show = _renderFunc['show'],
				listElem = this.element;
			list.forEach(function (item) {
				var elem = _create(item, this);
				_update(elem, item, this);
				listElem.appendChild(elem);
				_show(elem, item, this);
			});
		},
		
		update: function (item, index, source) {
			var elem = this.element.children[index];
			_renderFunc['update'](elem, item, this);
		},
		
		add: function (item, index, source) {
			var elem = _renderFunc['create'](item, this),
				refElem = this.element.children[index];
			_renderFunc['update'](elem, item, this);
			this.element.insertBefore(elem, refElem);
			_renderFunc['show'](elem, item, this);
		},
		
		remove: function (item, index, source) {
			var elem = this.element.children[index];
			if (elem == null)
				return;
			_renderFunc['hide'](elem, item, this);
			this.element.removeChild(elem);
		}
		
	};
	
});

// exports
return {
	
	extend: extend,
	
	List: List,
	Map: Map,
	Set: Set,
	Model: Model,
	ListModel: ListModel,
	View: View,
	ListView: ListView,
	
	u: {
		void: _voidFunc,
		copy: _copy
	}
	
};

}));


