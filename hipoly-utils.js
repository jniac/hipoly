var hipoly = hipoly || { };

hipoly.utils = {
	bindAll: function(obj) {
		for (var p in obj)
			if (typeof this[p] == 'function')
				this[p] = this[p].bind(this);
	}
};