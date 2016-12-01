var hipoly = hipoly || { }

hipoly.Geom = { 

	version:'1.0.4',
	types:[],
	pointType: { CROSS:0, CIRCLE:1 },
	lineType: { ARROW:0, SIMPLE:1 },
	intersectionType: { LINE:0, RAY:1, SEGMENT:2 }

};





// R2

hipoly.Point = function Point(x, y) { this.set(x, y); }

hipoly.Geom.types.push(hipoly.Point);

hipoly.Point.prototype = {

	constructor: hipoly.Point,

	x: 0,
	y: 0,

	set: function(x, y) {

		this.x = x || 0;
		this.y = y || 0;

		return this;

	},

	copy: function(other) {

		this.x = other.x;
		this.y = other.y;

		return this;

	},

	clone: function() {

		return new hipoly.Point(this.x, this.y);

	},

	getLength: function() {

		return Math.sqrt(this.x * this.x + this.y * this.y);

	},

	setLength: function(length) {

		var ratio = length / this.getLength();

		if (isNaN(ratio))
			return this;

		this.x *= ratio;
		this.y *= ratio;

		return this;

	},

	getAngle: function(degree) {

		return Math.atan2(this.y, this.x) * (degree ? 180 / Math.PI : 1 );

	},

	setAngle: function(angle, degree) {

		if (degree)
			angle *= Math.PI / 180;

		var length = this.getLength();

		this.x = length * Math.cos(angle);
		this.y = length * Math.sin(angle);

		return this;

	},

	setLengthAngle: function(length, angle, degree) {

		if (degree)
			angle *= Math.PI / 180;

		this.x = length * Math.cos(angle);
		this.y = length * Math.sin(angle);

		return this;

	},

	equals: function(other) {

		return this.x == other.x && this.y == other.y;

	},

	negate: function() {

		this.x = -this.x;
		this.y = -this.y;

		return this;

	},

	scale: function(scale) {

		this.x *= scale;
		this.y *= scale;

		return this;

	},

	rotate: function(angle, degree) {

		if (degree)
			angle *= Math.PI / 180;

		angle += this.getAngle();

		var length = this.getLength();

		this.x = length * Math.cos(angle);
		this.y = length * Math.sin(angle);

		return this;

	},

	add: function(other, clone) {

		if (clone)
			return this.clone.add(other);

		this.x += other.x;
		this.y += other.y;

		return this;

	},

	subtract: function(other, clone) {

		if (clone)
			return this.clone.subtract(other);

		this.x -= other.x;
		this.y -= other.y;

		return this;

	},

	distance: function(other) {

		var x = this.x - other.x;
		var y = this.y - other.y;

		return Math.sqrt(x * x + y * y);

	},

	squaredDistance: function(other) {

		var x = this.x - other.x;
		var y = this.y - other.y;

		return x * x + y * y;

	},

	determinant: function (other) {

		return this.x * other.y - this.y * other.x;

	},

	line: null,
	lineRatio: null,

	setLine: function(line, lineRatio) {

		this.line = line;
		this.lineRatio = lineRatio;

		return this;

	}

};

// shortcuts >

Object.defineProperties(hipoly.Point.prototype, {

	'length': {
		get: function() { return this.getLength(); },
		set: function(value) { this.setLength(value); }
	},

	'angle': {
		get: function() { return this.getAngle(); },
		set: function(value) { this.setAngle(value); }
	}

});











hipoly.Circle = function Circle(x, y, radius) { 

	hipoly.Point.call(this);

	this.set(x, y, radius);

};

hipoly.Geom.types.push(hipoly.Circle);

hipoly.Circle.prototype = Object.assign(Object.create( hipoly.Point.prototype ), {

	constructor: hipoly.Circle,

	radius: 0,

	set: function(x, y, radius) {

		this.x = x || 0;
		this.y = y || 0;
		this.radius = radius !== undefined ? radius : 1;

		return this;

	},

	contains: function(point) {

		var x = this.x - point.x;
		var y = this.y - point.y;

		return x * x + y * y <= this.radius * this.radius;

	},

	containsXY: function(x, y) {

		x += -this.x;
		y += -this.y;

		return x * x + y * y <= this.radius * this.radius;

	},

});







hipoly.Sector = function Sector(x, y, radius, from, to) {

	hipoly.Circle.call(this);

	this.set(x, y, radius, from, to);

};

hipoly.Geom.types.push(hipoly.Sector);

hipoly.Sector.prototype = Object.assign(Object.create( hipoly.Circle.prototype ), {

	constructor:hipoly.Sector,

	from:0,
	to:Math.PI,

	set: function(x, y, radius, from, to) {

		this.x = x || 0;
		this.y = y || 0;
		this.radius = radius !== undefined ? radius : 1;
		this.from = from || 0;
		this.to = to !== undefined ? to : Math.PI;

		return this;

	},

	containsXY:function(x, y) {

		x += -this.x;
		y += -this.y;

		if (x * x + y * y > this.radius * this.radius)
			return false;

		var detFrom = x * Math.sin(this.from) - y * Math.cos(this.from);
		var detTo = x * Math.sin(this.to) - y * Math.cos(this.to);

		return this.to - this.from < Math.PI ?
			detFrom <= 0 && detTo >= 0 :
			detFrom <= 0 || detTo >= 0;

	},

	contains: function(point) {

		return this.containsXY(point.x, point.y);

	}
});







hipoly.Box = function Box(A, B) { this.set(A, B); }

hipoly.Geom.types.push(hipoly.Box);

hipoly.Box.prototype = {

	constructor:hipoly.Box,

	A:null,
	B:null,

	set: function(A, B) {

		this.A = A || new hipoly.Point();
		this.B = B || new hipoly.Point();

		return this;

	},

	setXY: function(ax, ay, bx, by) {

		this.A.set(ax, ay);
		this.B.set(bx, by);

		return this;

	},

	copy: function(other) {

		this.A.copy(other.A);
		this.B.copy(other.B);

		return this;

	},

	clone: function() {

		return new hipoly.Box(this.A.clone(), this.B.clone());
	},

	union: function(other) {

		if (this.A.x > other.A.x)
			this.A.x = other.A.x;

		if (this.A.y > other.A.y)
			this.A.y = other.A.y;

		if (this.B.x < other.B.x)
			this.B.x = other.B.x;

		if (this.B.y < other.B.y)
			this.B.y = other.B.y;

		return this;

	},

	intersection: function(other) {

		if (this.A.x < other.A.x)
			this.A.x = other.A.x;

		if (this.A.y < other.A.y)
			this.A.y = other.A.y;

		if (this.B.x > other.B.x)
			this.B.x = other.B.x;

		if (this.B.y > other.B.y)
			this.B.y = other.B.y;

		if (this.B.x < this.A.x)
			this.B.x = this.A.x;

		if (this.B.y < this.A.y)
			this.B.y = this.A.y;

		return this;

	},

	setA: function(value) {

		this.A.copy(value);

		return this;

	},

	setB: function(value) {

		this.B.copy(value);

		return this;

	},

	getSize: function() {

		return this.B.clone().subtract(this.A);

	},

	setSize: function(value) {

		if (value.x < 0) {

			this.B.x = this.A.x;
			this.A.x += value.x;

		} else {

			this.B.x = this.A.x + value.x;
			
		}

		if (value.y < 0) {

			this.B.y = this.A.y;
			this.A.y += value.y;

		} else {

			this.B.y = this.A.y + value.y;
			
		}

		return this;

	},

	containsXY: function(x, y) {

		return x >= this.A.x && x <= this.B.x && y >= this.A.x && y <= this.B.y; 

	},

	contains: function(point) {

		return point.x >= this.A.x && point.x <= this.B.x && point.y >= this.A.x && point.y <= this.B.y; 
	},

	toString: function() {

		return '[Box ' + 
			[this.A.x, this.A.y, this.B.x, this.B.y].map(function(v){ return v.toFixed(1); }).join(', ') + 
			']';
	}

};


// shortcuts >

Object.defineProperties(hipoly.Box.prototype, {

	'x': {
		get: function() { return this.A.x; },
		set: function(value) { this.A.x = value; }
	},
	
	'y': {
		get: function() { return this.A.y; },
		set: function(value) { this.A.y = value; }
	},

	'width': {
		get: function() { return this.B.x - this.A.x; },
		set: function(value) { this.B.x = this.A.x + value; }
	},

	'height': {
		get: function() { return this.B.y - this.A.y; },
		set: function(value) { this.B.y = this.A.y + value; }
	}
	
});






hipoly.Line = function Line(p, v) {

	this.set(p, v);

};

hipoly.Geom.types.push(hipoly.Line);

hipoly.Line.prototype = {

	constructor:hipoly.Line,

	p:null,
	v:null,
	box:null,

	set: function (p, v) {

		this.p = p || new hipoly.Point();
		this.v = v || new hipoly.Point();

		return this;

	},

	setXY: function (px, py, vx, vy) {

		this.p.set(px, py);
		this.v.set(vx, vy);

		return this;

	},

	getStart: function() {

		return this.p.clone();

	},

	setStart: function(value) {

		this.v.set(this.p.x + this.v.x - value.x, this.p.y + this.v.y - value.y);
		this.p.copy(value);

		return this;

	},

	getEnd: function() {

		return new hipoly.Point(this.p.x + this.v.x, this.p.y + this.v.y);

	},

	setEnd: function(point) {

		this.v.x = point.x - this.p.x;
		this.v.y = point.y - this.p.y;

		return this;

	},

	getBox: function() {

		if (!this.box)
			this.box = new hipoly.Box();

		return this.box.setA(this.p).setSize(this.v);

	},

	getX: function(y) {

		return this.p.x + this.v.x * (y - this.p.y) / this.v.y; 

	},

	getY: function(x) {

		return this.p.y + this.v.y * (x - this.p.x) / this.v.x; 

	},

	intersection: function(other, thisIntersectionType, otherIntersectionType) {

		var det = this.v.x * other.v.y - this.v.y * other.v.x;

		if (det == 0)
			return null;

		var dpy = this.p.y - other.p.y;
		var dpx = this.p.x - other.p.x;
		var ratio = (other.v.x * dpy - other.v.y * dpx) / det;
		var otherRatio = (this.v.x * dpy - this.v.y * dpx) / det;

		if (thisIntersectionType >= hipoly.Geom.intersectionType.RAY && ratio < 0)
			return null;

		if (thisIntersectionType == hipoly.Geom.intersectionType.SEGMENT && ratio > 1)
			return null;

		if (otherIntersectionType >= hipoly.Geom.intersectionType.RAY && otherRatio < 0)
			return null;

		if (otherIntersectionType == hipoly.Geom.intersectionType.SEGMENT && otherRatio > 1)
			return null;

		return new hipoly.Point(this.p.x + this.v.x * ratio, this.p.y + this.v.y * ratio).setLine(this, ratio);

	},

	projection: function(point, intersectionType, clamp) {

		var detPerp = this.v.x * this.v.x + this.v.y * this.v.y;
		var ratio = ((this.p.y - point.y) * -this.v.y - (this.p.x - point.x) * this.v.x) / detPerp;

		if (intersectionType >= hipoly.Geom.intersectionType.RAY && ratio < 0)
			return null;

		if (intersectionType == hipoly.Geom.intersectionType.SEGMENT && ratio > 1)
			return null;

		if (clamp)
			ratio = ratio < 0 ? 0 : ratio > 1 ? 1 : ratio;

		return new hipoly.Point(this.p.x + this.v.x * ratio, this.p.y + this.v.y * ratio).setLine(this, ratio);

	},

	// warn: distance result could be negative!

	distance(point, absolute) {

		if (absolute)
			return Math.abs(this.distance(point));

		return (this.v.x * (point.y - this.p.y) - this.v.y * (point.x - this.p.x)) / this.v.getLength();

	},

	squaredDistance(point) {

		var det = (this.v.x * (point.y - this.p.y) - this.v.y * (point.x - this.p.x));

		return det * det / (this.v.x * this.v.x + this.v.y * this.v.y);

	}

};

// shortcuts >

Object.defineProperties(hipoly.Line.prototype, {

	'start': {
		get: function() { return this.p },
		set: function(value) { this.setStart(value); }
	},

	'startX': {
		get: function() { return this.p.x; },
		set: function(value) { this.p.x = value; }
	},

	'startY': {
		get: function() { return this.p.y; },
		set: function(value) { this.p.y = value; }
	},

	'end': {
		get: function() { return this.getEnd(); },
		set: function(value) { this.setEnd(value); }
	},

	'endX': {
		get: function() { return this.p.x + this.v.x; },
		set: function(value) { this.v.x = value - this.p.x; }
	},

	'endY': {
		get: function() { return this.p.y + this.v.y; },
		set: function(value) { this.v.y = value - this.p.y; }
	}

});


















hipoly.Triangle = function Triangle(A, B, C) {

	this.AB = new hipoly.Point();
	this.AC = new hipoly.Point();

	this.set(A, B, C);

};

hipoly.Geom.types.push(hipoly.Triangle);

hipoly.Triangle.prototype = {

	constructor:hipoly.Triangle,

	A: null,
	B: null,
	C: null,

	AB: null,
	AC: null,
	detABAC: null,

	isPositive:null,
	isNull:null,

	compute: function() {

		this.AB.set(this.B.x - this.A.x, this.B.y - this.A.y);
		this.AC.set(this.C.x - this.A.x, this.C.y - this.A.y);

		this.detABAC = this.AB.x * this.AC.y - this.AB.y * this.AC.x;
		this.isPositive = this.detABAC > 0;
		this.isNull = this.detABAC == 0;

	},

	set: function(A, B, C) {

		this.A = A || new hipoly.Point();
		this.B = B || new hipoly.Point();
		this.C = C || new hipoly.Point();

		this.compute();

		return this;

	},

	setXY: function(ax, ay, bx, by, cx, cy) {

		this.A.set(ax, ay);
		this.B.set(bx, by);
		this.C.set(cx, cy);

		this.compute();

		return this;

	},

	toArray: function() {

		return [this.A.x, this.A.y, this.B.x, this.B.y, this.C.x, this.C.y];

	},

	containsXY: function(x, y, computeTriangle) {

		if (computeTriangle)
			this.compute();

		var apx = x - this.A.x;
		var apy = y - this.A.y;
		var detAPAB = apx * this.AB.y - apy * this.AB.x;
		var detAPAC = apx * this.AC.y - apy * this.AC.x;

		// test if P(x,y) is the right half sheaf
		if (this.isPositive ? detAPAB > 0 || detAPAC < 0 : detAPAB < 0 || detAPAC > 0)
			return false;

		var bpx = x - this.B.x;
		var bpy = y - this.B.y;
		var cpx = x - this.C.x;
		var cpy = y - this.C.y;
		var detBPCP = bpx * cpy - bpy * cpx;

		// test if P(x,y) is in the right side of BC
		return detBPCP * this.detABAC >= 0;

	},

	contains: function(point) {

		return this.containsXY(point.x, point.y);

	}

};









hipoly.Polygon = function Polygon(points) { 

	this.barycenter = new hipoly.Point();

	this.set(points);

};

hipoly.Geom.types.push(hipoly.Polygon);

hipoly.Polygon.prototype = {

	constructor:hipoly.Polygon,

	points:null,
	barycenter:null,
	lines:null,

	isConvex:null,
	isNull:true,

	// TODO: determine if the polygon is positive or not
	compute: function(computeLines) {

		if (computeLines)
			this.computeLines();

		var n, point;

		n = this.points.length;

		this.barycenter.set(0, 0);

		this.isConvex = true;
		this.isNull = true;

		var lastDet = 0;

		for (var i = 0; i < n; i++) {

			point = this.points[i];

			this.barycenter.add(point);

			this.isConvex = 
				lastDet * (lastDet = this.lines[i].v.determinant(this.lines[(i + 1) % n].v)) >= 0 &&
				this.isConvex;

			this.isNull = this.isNull && lastDet == 0;

		}

		if (n)
			this.barycenter.scale(1 / n);

		return this;

	},

	computeLines: function() {

		var v, n = this.points.length;

		this.lines = [];

		for (var i = 0; i < n; i++) {

			v = this.points[(i + 1) % n].clone().subtract(this.points[i]);
			this.lines[i] = new hipoly.Line(this.points[i], v);

		}

	},

	set: function(points) {

		if (Array.isArray(points)) {

			this.points = points;

		} else {

			this.points = [];
			points = parseFloat(points);

			for (var i = 0; i < points; i++) 
				this.points[i] = new hipoly.Point();

		}

		this.compute(true);

		return this;

	},

	setXY: function() {

		var n = arguments.length / 2;

		var points = [];

		for (var i = 0; i < n; i++) {

			points[i] = new hipoly.Point(arguments[i * 2], arguments[i * 2 + 1]);

		}

		this.set(points);

		return this;

	}, 

	reverse: function() {

		this.set(this.points.reverse());

		return this;

	},

	shiftPoints: function(delta) {

		var n = this.points.length;

		delta %= n;

		if (delta > 0)
			this.set(this.points.slice(n - delta).concat(this.points.slice(0, n - delta)));
		else
			this.set(this.points.slice(-delta).concat(this.points.slice(0, -delta)));

		return this;

	},

	convexContainsXY: function(x, y) {

		var n = this.points.length;

		var det = 0;

		for (var i = 0; i < n; i++) {

			if (det * (det = this.lines[i].v.x * (y - this.points[i].y) - this.lines[i].v.y * (x - this.points[i].x)) < 0)
				return false;
		}

		return true;

	},

	concaveContains: function(point) {

		var p = this.nearestPoint(point);

		// assuming the polygon is positive

		return (point.x - p.line.p.x) * p.line.v.y - p.line.v.x * (point.y - p.line.p.y) <= 0;

	},

	containsXY: function(x, y) {

		if (this.isNull)
			return false;

		if (this.isConvex)
			return this.convexContainsXY(x, y);

		return this.concaveContains(new hipoly.Point(x, y));

	},

	contains: function(point) {

		return this.containsXY(point.x, point.y);

	},

	nearestPoint: function(point) {

		var n = this.points.length;

		var p, nearestP;
		var d, minD = Infinity;

		for (var i = 0; i < n; i++) {

			p = this.lines[i].projection(point, 0, true);
			d = point.squaredDistance(p);

			if (minD > d) {

				minD = d;
				nearestP = p;

			}

		}

		return nearestP;

	}

};












// R3

hipoly.Vector = function Vector(x, y, z) {

	this.set(x, y, z);	

};

hipoly.Geom.types.push(hipoly.Vector);

hipoly.Vector.prototype = {

	constructor:hipoly.Vector,

	x:0,
	y:0,
	z:0,

	set: function(x, y, z) {

		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;

		return this;

	},

	copy: function(v) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	clone: function() {

		return new hipoly.Vector(this.x, this.y, this.z);

	},

	equals: function(v) {

		return this.x == other.x && this.y == other.y && this.z == other.z;
	},

	negate: function() {

		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;

	},

	add: function(v) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	subtract: function(v) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	scale: function(value) {

		this.x *= value;
		this.y *= value;
		this.z *= value;

		return this;

	},

	getLength: function() {

		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

	},

	setLength: function(value) {

		this.scale(value / this.getLength());

		return this;

	},

	normalize: function(value) {

		this.scale(1 / this.getLength());

		return this;

	},

	distance: function(v) {

		var x = v.x - this.x;
		var y = v.y - this.y;
		var z = v.z - this.z;

		return Math.sqrt(x * x + y * y + z * z);

	},

	squaredDistance: function(v) {

		var x = v.x - this.x;
		var y = v.y - this.y;
		var z = v.z - this.z;

		return x * x + y * y + z * z;

	},

	cross: function(v) {

		var x = this.x, y = this.y, z = this.z;

		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;

		return this;

	},

	dot: function(v) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	determinant: function(u, v) {

		return hipoly.Vector.determinant(this, u, v);
	},


	toArray: function() {

		return [this.x, this.y, this.z];

	},

	fromThetaPhi: function(theta, phi, degree) {

		if (degree || degree == undefined) {

			theta *= Math.PI / 180;
			phi *= Math.PI / 180;

		}

		this.x = Math.cos(theta) * Math.cos(phi);
		this.y = Math.sin(phi);
		this.z = Math.sin(theta) * Math.cos(phi);

		return this;

	},

	toThetaPhi: function(degree, type, round) {

		this.normalize();

		var theta = Math.atan2(this.z, this.x);
		var phi = Math.asin(this.y);

		if (degree || degree == undefined) {

			theta *= 180 / Math.PI;
			phi *= 180 / Math.PI;

		}

		if (!isNaN(round)) {

			theta = Math.round(theta / round) * round
			phi = Math.round(phi / round) * round
		}
	
		if (type == Array)
			return [theta, phi];

		var result = type ? new type() : {};

		result.theta = theta;
		result.phi = phi;

		return result;

	},

	greatCircle:null,
	greatCircleArc:null,
	greatCircleClamped:null,

	setGreatCircle: function(greatCircle, arc, clamped) {

		this.greatCircle = greatCircle;
		this.greatCircleArc = arc;
		this.greatCircleClamped = clamped;

		return this;

	}

};


// shortcuts > 

Object.defineProperties(hipoly.Vector.prototype, {

	'length': {
		get: function() { return this.getLength(); },
		set: function(value) { this.setLength(value); }
	},

	'cln': {
		get: function() { return this.clone(); }
	},

	'neg': {
		get: function() { return this.clone().negate(); }
	}

});


// static > 

Object.assign(hipoly.Vector, {

	cross: function(u, v) {

		return new hipoly.Vector(u.x, u.y, u.z).cross(v);

	},

	fromThetaPhi: function(theta, phi, degree) {

		return new hipoly.Vector().fromThetaPhi(theta, phi, degree);

	},

	determinant: function(u, v, w) {

		return u.x * v.y * w.z + v.x * w.y * u.z + w.x * u.y * v.z - u.x * w.y * v.z - v.x * u.y * w.z - w.x * v.y * u.z;

	},

	Xaxis: new hipoly.Vector(1, 0, 0),
	Yaxis: new hipoly.Vector(0, 1, 0),
	Zaxis: new hipoly.Vector(0, 0, 1)

});









hipoly.GreatCircle = function GreatCircle(u, v, w, arc) {

	this.set(u, v, w, arc);

};

hipoly.Geom.types.push(hipoly.GreatCircle);

hipoly.GreatCircle.prototype = {

	constructor:hipoly.GreatCircle,

	// u, v describe the circle (p = u.cos(t) + v.sin(t)), w is the circle's axis
	u:null,
	v:null,
	w:null,
	arc:0,

	set: function(u, v, w, arc) {

		this.u = u || new hipoly.Vector(1, 0, 0);
		this.v = v || new hipoly.Vector(0, 0, 1);
		this.w = w || new hipoly.Vector(0, 1, 0);
		this.arc = arc !== undefined ? arc : 2 * Math.PI;

		return this;

	},

	copy: function(other) {

		this.u.copy(other.u);
		this.v.copy(other.v);
		this.w.copy(other.w);
		this.arc = other.arc;

		return this;

	},

	clone: function() {

		return new hipoly.GreatCircle(this.u.clone(), this.v.clone(), this.w.clone(), this.arc);

	},

	setArcTo: function(p, arc) {

		p.normalize();

		this.w.copy(p).cross(this.u).normalize();		// normalize because ||w|| = ||p||.||u||.sin
		this.v.copy(this.u).cross(this.w);				// do not normalize because angle between u and w is pi / 2, so sin = 1
		this.arc = arc !== undefined ? arc : Math.acos(this.u.dot(p));

		return this;

	},

	getPointAt: function(angle) {

		return this.u.clone().scale( Math.cos( angle ) ).add( this.v.clone().scale( Math.sin( angle ) ) );

	},

	// if intersectionType == 0: points are sorted by absolute distance (the nearest will be first)
	// else: points are sorted by distance along the circle (this) orientation (a close point could be the last one) 
	intersections: function(other, intersectionType, otherIntersectionType) {

		var p1 = hipoly.Vector.cross(this.w, other.w).normalize();
		var p2 = p1.clone().negate();

		var a1 = -Math.atan2(this.w.determinant(this.u, p1), this.u.dot(p1));
		var a2 = -Math.atan2(this.w.determinant(this.u, p2), this.u.dot(p2));

		// if intersectionType is RAY or SEGMENT angle must be > 0

		if (intersectionType > hipoly.Geom.intersectionType.LINE) {

			if (a1 < 0)
				a1 += 2 * Math.PI;
				
			if (a2 < 0)
				a2 += 2 * Math.PI;

		}
		
		// sort by absolute arc distance 

		if (Math.abs(a1) > Math.abs(a2)) {

			var tmp;

			tmp = a1; a1 = a2; a2 = tmp;
			tmp = p1; p1 = p2; p2 = tmp;

		}

		var match1 = true;
		var match2 = true;

		// create points from the first intersectionType

		if (intersectionType == hipoly.Geom.intersectionType.SEGMENT) {

			match1 = a1 <= this.arc;
			match2 = a2 <= this.arc;

		} 

		// match points with the other intersectionType (RAY does not make sense)

		if (otherIntersectionType == hipoly.Geom.intersectionType.SEGMENT) {

			var otherA1 = -Math.atan2(other.w.determinant(other.u, p1), other.u.dot(p1));
			var otherA2 = -Math.atan2(other.w.determinant(other.u, p2), other.u.dot(p2));

			if (otherA1 < 0)
				otherA1 += 2 * Math.PI;
				
			if (otherA2 < 0)
				otherA2 += 2 * Math.PI;

			match1 = match1 && otherA1 <= other.arc;
			match2 = match2 && otherA2 <= other.arc;

		}

		if (match1)
			p1.setGreatCircle(this, a1, false);

		if (match2)
			p2.setGreatCircle(this, a2, false);

		return match1 && match2 ? [p1, p2] : match1 ? [p1] : match2 ? [p2] : [];

	},

	projection: function(v, intersectionType, clamp) {

		var w = hipoly.Vector.cross(this.w, v).normalize();

		var p = hipoly.Vector.cross(w, this.w);

		if (intersectionType > 0 || clamp) {

			var a = -Math.atan2(hipoly.Vector.determinant(this.w, this.u, p), this.u.dot(p));

			if (a < 0)
				a += 2 * Math.PI;

			if (intersectionType == hipoly.Geom.intersectionType.SEGMENT)
				if (a > this.arc)
					return null;

			// clamp: choose between start and end of the arc
			if (clamp && a > this.arc)
				return this.getPointAt(a = a > Math.PI + this.arc / 2 ? 0 : this.arc).setGreatCircle(this, a, true);

		}

		p.setGreatCircle(this, a, false);

		return p;

	}


};

// static >

Object.assign(hipoly.GreatCircle, {

	arcFromTo: function(p, q) {

		return new hipoly.GreatCircle(p).setArcTo(q);

	},

	intersections: function(a, b) {

		return a.intersections(b);

	}

});







// SPolygon, polygon at the surface of a Sphere, a cone in a way

hipoly.SPolygon = function SPolygon(points) {

	this.barycenter = new hipoly.Vector();

	this.set(points);

};

hipoly.Geom.types.push(hipoly.SPolygon);

hipoly.SPolygon.prototype = {

	constructor:hipoly.SPolygon,

	points: null,
	barycenter: null,
	arcs: null,

	isPositive: true,
	isConvex: true,
	isNull: true,

	compute: function(computeArcs) {

		if (computeArcs)
			this.computeArcs();

		var n, point;

		n = this.points.length;

		this.barycenter.set(0, 0, 0);

		this.isConvex = true;
		this.isNull = true;
		this.isPositive = 0;

		var dot = 0;

		for (var i = 0; i < n; i++) {

			point = this.points[i];

			this.barycenter.add(point);

			var newDot = this.arcs[i].w.dot(this.arcs[(i + 1) % n].v);	// fine

			// console.log(i, newDot);

			this.isConvex = 
				(dot * (dot = newDot) >= 0) &&
				this.isConvex;

			this.isNull = this.isNull && dot == 0;

			if (dot)
				this.isPositive += dot > 0 ? 1 : -1;

		}

		this.isPositive = this.isPositive > 0;

		if (n)
			this.barycenter.scale(1 / n).normalize();

		return this;

	},

	computeArcs: function() {

		var n = this.points.length;

		for (var i = 0; i < n; i++)
			this.arcs[i].setArcTo(this.points[(i + 1) % n]);

		return this;

	},

	set: function(points) {

		this.points = points || [];

		this.arcs = [];

		for (var i = 0; i < this.points.length; i++)
			this.arcs[i] = new hipoly.GreatCircle(this.points[i]);

		this.compute(true);

		return this;

	},

	fromThetaPhi: function(array, degree) {

		var points = [];

		var r = degree ? Math.PI / 180 : 1;

		for (var i = 0; i < array.length; i += 2)
			points.push( new hipoly.Vector().fromThetaPhi(array[i] * r, array[i + 1] * r) );

		this.set(points);

		return this;

	},

	toThetaPhi: function(degree, round) {

		var array = [];

		for (var i = 0; i < this.points.length; i++)
			this.points[i].toThetaPhi(degree, Array, round).forEach(function(v, i, a) {
				array.push(v);
			});

		return array;

	},

	reverse: function() {

		var a = this.points.concat().reverse();
		var n = a.length;

		// copy instead creating new points to avoid losing reference
		for (var i = 0; i < n; i++)
			this.points[i].copy(a[i]);

		this.compute(true);

		return this;

	},

	shiftPoints: function(delta) {

		var n = this.points.length;

		delta %= n;

		if (delta > 0)
			this.set(this.points.slice(n - delta).concat(this.points.slice(0, n - delta)));
		else
			this.set(this.points.slice(-delta).concat(this.points.slice(0, -delta)));

		return this;

	},

	convexContains: function(v) {

		var n = this.points.length;

		var dot = 0;

		for (var i = 0; i < n; i++) 
			if (dot * (dot = v.dot(this.arcs[i].w)) < 0)
				return false;

		// determine if v is in the right side of the polygon
		return this.barycenter.dot(v) >= 0;

	},

	concaveContains: function(v, debug) {

		var to = v.x == 0 && v.y == 1 && v.z == 0 ? hipoly.Vector.Zaxis : hipoly.Vector.Yaxis;

		var c = new hipoly.GreatCircle(v).setArcTo(to, 2 * Math.PI);

		var array = [];

		for (var i = 0; i < this.arcs.length; i++) {

			var arc = this.arcs[i]

			c.intersections(arc, 0, 2).forEach(function(v, i, a){
				array.push({
					p:v,
					c:arc
				});
			});

		}

		if (array.length == 0)
			return false;

		array.sort(function(a, b) {
			return Math.abs(a.p.greatCircleArc) < Math.abs(b.p.greatCircleArc) ? -1 : 1; 
		});

		return v.dot(array[0].c.w) > 0;

	},

	contains: function(v) {

		if (this.isNull)
			return false;

		if (this.isConvex)
			return this.convexContains(v);

		// return false;
		return this.concaveContains(v);

	},

	containsXYZ: function(x, y, z) {

		if (x.hasOwnProperty('x') && x.hasOwnProperty('y') && x.hasOwnProperty('z'))
			return this.contains(new hipoly.Vector(x.x, x.y, x.z));

		return this.contains(new hipoly.Vector(x, y, z));
	},

	nearestSummit: function(v, returnIndex) {

		var nearestSummitIndex;
		var d, minD = Infinity;

		for (var i = 0; i < this.points.length; i++) {

			d = this.points[i].squaredDistance(v);

			if (d < minD) {

				minD = d;
				nearestSummitIndex = i;

			}

		}

		return returnIndex ? nearestSummitIndex : this.points[nearestSummitIndex];

	},

	nearestPoint: function(v, clamp) {

		if (clamp === undefined)
			clamp = true;

		var n = this.points.length;

		var p, nearestP;
		var d, minD = Infinity;

		for (var i = 0; i < n; i++) {

			p = this.arcs[i].projection(v, 0, true);
			d = v.squaredDistance(p);

			if (minD > d) {

				minD = d;

				// if clamped points are not retained and if p is clamped, only d will be retained (in order to not retain points that are further than a clamped point (a summit))
				if (clamp || (!clamp && !p.greatCircleClamped))
					nearestP = p;

			}

		}

		return nearestP;

	},

	nearestArc: function(v, returnIndex) {

		var nearestArcIndex;
		var d, minD = Infinity;

		var n = this.points.length;

		for (var i = 0; i < n; i++) {

			d = this.arcs[i].projection(v, 0, true).squaredDistance(v);

			if (d < minD) {

				minD = d;
				nearestArcIndex = i;

			}

		}

		return returnIndex ? nearestArcIndex : this.arcs[nearestArcIndex];

	},

	insertPoint: function(v, index) {

		if (isNaN(index))
			index = this.nearestArc(v, true);

		var n = this.points.length;
		
		var nextIndex = (index + 1) % n;

		var arc = new hipoly.GreatCircle(v).setArcTo(this.points[nextIndex]);

		this.arcs[index].setArcTo(v);

		this.points.splice(nextIndex, 0, v);
		this.arcs.splice(nextIndex, 0, arc);

		return [index, nextIndex];

	}

};

// static >

Object.assign(hipoly.SPolygon, {

	fromThetaPhi: function (array, degree) {

		return new hipoly.SPolygon().fromThetaPhi(array, degree);

	}

});
















// SVG Gestion

hipoly.Geom.svgPath = {

	string: null,
	p:1,
	isCorrupted:false,

	start: function(precision) {

		if (!isNaN(precision))
			this.p = precision;

		this.string = '';
		this.isCorrupted = false;

		return this;

	},

	number: function(n) {

		if (isNaN(n)) {

			this.isCorrupted = true;

		}

		return n % 1 ? n.toFixed(this.p) : n;
	},

	getArgs: function(a) {

		var r = [];

		for (var i = 0; i < a.length; i++) {

			var o = a[i];

			if (o instanceof hipoly.Point)
				r.push(this.number(o.x), this.number(o.y));
			else if (!isNaN(o))
				r.push(this.number(o));
			else if (o.split)
				r.push(o);

		}

		return r;

	},

	M: function() { this.string += 'M' + this.getArgs(arguments).join(' ') + ' '; return this; },
	L: function() { this.string += 'L' + this.getArgs(arguments).join(' ') + ' '; return this; },
	m: function() { this.string += 'm' + this.getArgs(arguments).join(' ') + ' '; return this; },
	l: function() { this.string += 'l' + this.getArgs(arguments).join(' ') + ' '; return this; },
	A: function() { this.string += 'A' + this.getArgs(arguments).join(' ') + ' '; return this; },
	a: function() { this.string += 'a' + this.getArgs(arguments).join(' ') + ' '; return this; },
	Z: function() {	this.string += 'Z'; return this; },

	arc: function(x, y, r, a0, a1) {

		var da = a1 - a0;

		var a, px, py;
		var n = Math.ceil(Math.sqrt(r) * 4 * da / Math.PI / 2);

		for (var i = 0; i <= n; i++) {

			a = a0 + da * i / n;
			px = x + r * Math.cos(a);
			py = y + r * Math.sin(a);
			this.string += 'L' + this.number(px) + ' ' + this.number(py);

		}

		return this;

	}

};

Object.defineProperties(hipoly.Geom.svgPath, {

	'path': {
		get: function() { return this.isCorrupted ? null : this.string; }
	}

});

(function(){

	var defaultSVGParams = { stroke:'black', fill:'none' };
	var defaultDrawParams = { size:10, pointType:hipoly.Geom.pointType.CROSS };

	function setSVG(geom, type, svgParams) {

		if (!geom.svg) {

			svgParams = svgParams || { };

			for (var p in defaultSVGParams)
				if (!svgParams.hasOwnProperty(p))
					svgParams[p] = defaultSVGParams[p];

			svgParams.class = geom.constructor.name;
			geom.svg = hipoly.SVG(type, svgParams);
		}

	}

	for (var i = hipoly.Geom.types.length - 1; i >= 0; i--) {

		hipoly.Geom.types[i].prototype.svg = null;
		hipoly.Geom.types[i].prototype.toSVG = function(svgParams, drawParams) {

			if (!hipoly.SVG)
				return null;

			drawParams = drawParams || this.drawParams || { };

			for (var p in defaultDrawParams)
				if (!drawParams.hasOwnProperty(p))
					drawParams[p] = defaultDrawParams[p];

			this.drawParams = drawParams;

			var path = hipoly.Geom.svgPath.start();
			var v;

			switch (this.constructor.name) {

				case 'Sector':

					setSVG(this, 'path', svgParams);

					path.M(this).arc(this.x, this.y, this.radius, this.from, this.to).Z();

					hipoly.SVG(this.svg, { d:path.path });

					break;



				case 'Line':

					if (drawParams.lineType == hipoly.Geom.lineType.SIMPLE) {

						setSVG(this, 'line', svgParams);

						hipoly.SVG(this.svg, { x1:this.startX, y1:this.startY, x2:this.endX, y2:this.endY })

					} else {

						setSVG(this, 'path', svgParams);

						path.M(this.p).l(this.v);

						v = this.v.clone().setLength(drawParams.size).rotate(90, true);
						path.M(this.p.x + v.x, this.p.y + v.y).L(this.p.x - v.x, this.p.y - v.y);

						v = this.v.clone().setLength(drawParams.size * Math.SQRT2).rotate(135, true);
						path.M(this.getEnd().add(v));
						path.L(this.getEnd()).L(this.getEnd().add(v.rotate(90, true)));

						hipoly.SVG(this.svg, { d:path.path });

					} 

					break;



				case 'Circle':

					setSVG(this, 'circle', svgParams);

					hipoly.SVG(this.svg, { cx:this.x, cy:this.y, r:this.radius });

					break;



				case 'Point':

					if (drawParams.pointType == hipoly.Geom.pointType.CIRCLE) {

						setSVG(this, 'circle', svgParams);

						hipoly.SVG(this.svg, { cx:this.x, cy:this.y, r:drawParams.size });

					} else {

						setSVG(this, 'path', svgParams);

						path.M(this.x - drawParams.size, this.y).L(this.x + drawParams.size, this.y);
						path.M(this.x, this.y - drawParams.size).L(this.x, this.y + drawParams.size);

						hipoly.SVG(this.svg, { d:path.path });

					}

					break;



				case 'Box':

					setSVG(this, 'rect', svgParams);

					hipoly.SVG(this.svg, { x:this.x, y:this.y, width:this.width, height:this.height });

					break;



				case 'Triangle':

					setSVG(this, 'polygon', svgParams);

					var points = 
						this.A.x + ',' + this.A.y + ' ' +
						this.B.x + ',' + this.B.y + ' ' +
						this.C.x + ',' + this.C.y;

					hipoly.SVG(this.svg, { points:points });

					break;



				case 'Polygon':

					setSVG(this, 'polygon', svgParams);

					var points = this.points.map(function (v) { return v.x + ',' + v.y; }).join(' ');

					hipoly.SVG(this.svg, { points:points });

					break;
				
			}

			return this.svg;

		}

	}

})();










// THREE JS Gestion

(function() {

	// test THREE
	try {

		var test = THREE.version;

	} catch (e) {

		return;

	}

	hipoly.Vector.prototype.toVector3 = function() {

		return new THREE.Vector3(this.x, this.y, this.z);

	}

	function processParams(params, extraParams) {

		params = params || {};

		for (var p in extraParams) {

			if (!params.hasOwnProperty(p))
				params[p] = extraParams[p];
		}

		return params;

	}

	function process(type) {

		type.object3D = null;

		type.toObject3D = function(params){

			var a, g, m, n, u, v, w;

			switch(this.constructor.name) {

				case 'GreatCircle':

					this.object3DParams = params = processParams(params || this.object3DParams, { color: 0x0000ff, linewidth: 1 });

					if (!this.object3D) {

						this.object3DMaterial = new THREE.LineBasicMaterial({ color: params.color, linewidth: params.linewidth });

						this.object3D = new THREE.Object3D();

					}

					while (this.object3D.children.length)
						this.object3D.remove(this.object3D.children[0]);



					// arc
					n = Math.floor(1 + 72 * this.arc / 2 / Math.PI);

					g = new THREE.Geometry();

					for (var i = 0; i <= n; i++) {

						a = this.arc * i / n;
						v = this.u.clone().scale(Math.cos(a)).add(this.v.clone().scale(Math.sin(a)));
						g.vertices.push(v);

					}

					this.object3D.add(new THREE.Line(g, this.object3DMaterial));

					var size = 1 / 30;



					// arrow
					g = new THREE.Geometry();
					a = this.arc / 2;
					v = this.u.clone().scale(Math.cos(a)).add(this.v.clone().scale(Math.sin(a)));
					u = hipoly.Vector.cross(v, this.w).scale(size);
					w = this.w.clone().scale(size)
					g.vertices.push(v.clone().subtract(u).add(w));
					g.vertices.push(v.clone());
					g.vertices.push(v.clone().subtract(u).add(w.negate()));

					this.object3D.add(new THREE.Line(g, this.object3DMaterial));



					// axis
					g = new THREE.Geometry();
					g.vertices.push(this.w.clone());
					g.vertices.push(this.w.clone().scale(1 + size * 2));

					this.object3D.add(new THREE.Line(g, this.object3DMaterial));

					if (params.drawUVW) {

						g = new THREE.Geometry();
						g.vertices.push(new THREE.Vector3());
						g.vertices.push(this.u);
						g.vertices.push(new THREE.Vector3());
						g.vertices.push(this.v);
						g.vertices.push(new THREE.Vector3());
						g.vertices.push(this.w);

						this.object3D.add(new THREE.LineSegments(g, this.object3DMaterial));

					}


					break;

			}

			return this.object3D;

		};

	}

	[hipoly.GreatCircle.prototype].forEach(process);



})();




