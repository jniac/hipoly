var hipoly = { };

// hipoly / Math
// getRandom
// clamp
// querySelector
// querySelectorAll
// getLoremIpsum
// Stack 1.7




// hipoly / Math 1.1 >

var hipoly = hipoly || { };

hipoly.xor = function(a, b) {

    return a ? !b : b;      // just to remember

}

hipoly.setupNumber = function() {

    Number.prototype.clamp = function(min, max) {

        if (min == undefined)
            min = 0;

        if (max == undefined)
            max = 1;
        
        return this < min ? min : this > max ? max : this;

    };

    Number.prototype.mix = function(other, ratio) {

        return this + (other - this) * ratio;
    };

    Number.prototype.superPow = function(power) {

        return Math.pow(this >= 0 ? this : -this, power) * (this >=0 ? 1 : -1);

    };

    Number.prototype.fit = function(min, max) {

        return (this - min) / (max - min);

    };

    Number.prototype.map = function(min, max) {

        return min + (max - min) * this;

    };

    Number.prototype.ease = function(easeFunction) {

        return easeFunction(this);

    };

    // Number.prototype.random = function(min, max) {

    //     min = isNaN(min) ? 0 : min;
    //     max = isNaN(max) ? 1 : max;

    //     return min + (max - min) * Math.random();

    // };

    Object.defineProperties(Number.prototype, {

        'clamped':      { get: function() { return this < 0 ? 0 : this > 1 ? 1 : this; } },

        'sign':         { get: function() { return this >= 0 ? 1 : -1; } },

        'abs':          { get: function() { return this >= 0 ? this : -this; } },

        'complement':   { get: function() { return 1 - this } },

        'floor':        { get: function() { return Math.floor(this); } },

        'ceil':         { get: function() { return Math.ceil(this); } },

        'cos':          { get: function() { return Math.cos(this); } },

        'sin':          { get: function() { return Math.sin(this); } },

        'rad':          { get: function() { return this * Math.PI / 180; } },

        'deg':          { get: function() { return this * 180 / Math.PI; } }

    });

    hipoly.setupNumber = function() { }

};

hipoly.setupArray = function() {

    Array.prototype.item = function(index) {

        if (index < 0)
            return this[this.length + index];

        return this[index];

    };

    Array.prototype.removeItem = function(item) {

        var index = this.indexOf(item);

        if (index >= 0)
            this.splice(index, 1);

        return this; // for chaining

    }

    Object.defineProperties(Array.prototype, {

        'first': { get: function() { return this[0]; } }, 

        'second': { get: function() { return this[1]; } }, 

        'third': { get: function() { return this[2]; } }, 

        'last': { get: function() { return this[this.length - 1]; } }

    });

    hipoly.setupArray = function() { return 0; };

    return 1;

};

hipoly.getFineEase = function(i, p, clamp) {
    return clamp ? function(x) {
        return x <= 0 ? 0 : x >= 1 ? 1 : x < i ? 
                1 / Math.pow(i, p-1) * Math.pow(x, p) : 
                1 - 1 / Math.pow(1-i, p-1) * Math.pow(1-x, p)
        } : function (x) {
            return x == 0 ? 0 : x == 1 ? 1 : x < i ? 
                1 / Math.pow(i, p-1) * Math.pow(x, p) : 
                1 - 1 / Math.pow(1-i, p-1) * Math.pow(1-x, p)
        };
}

hipoly.getRandom = function(s) {

    return function(min, max, round) {

    	if (min instanceof Array)
    		return min[Math.floor(min.length * ((s = Math.sin(s) * 10000) - Math.floor(s)))];
        
        if (min != undefined) {

        	if (max === undefined)
        		max = min, min = 0;

            return round > 0 ?
                min + Math.floor((max - min) * ((s = Math.sin(s) * 10000) - Math.floor(s)) / round) * round :
                min + (max - min) * ((s = Math.sin(s) * 10000) - Math.floor(s));
        }

        return (s = Math.sin(s) * 10000) - Math.floor(s);

    };

};

hipoly.mix = function (a, b, ratio, clamp) {

    if (clamp)
        ratio = ratio < 0 ? 0 : ratio > 1 ? 1 : ratio;

    return a + (b - a) * ratio;

};
hipoly.clamp = function(n, min, max) {

	min = min != undefined ? min : 0;
	max = max != undefined ? max : 1;
    return n < min ? min : n > max ? max : n;

};


hipoly.Time = function() { this.init.apply(this, arguments); };

hipoly.Time.prototype = {

    _d:0,

    hours:0,
    minutes:0,
    seconds:0,
    milliseconds:0,

    init:function() {

        if (arguments.length == 1 && !isNaN(parseFloat(arguments[0])))
            this.duration = arguments[0];

    }
    
};

Object.defineProperties(hipoly.Time.prototype, {

    'duration': {

        get:function() { return this._d; },
        set:function(value) {

            this._d = parseFloat(value);

            this.milliseconds = this._d % 1;
            this.seconds = Math.floor(this._d % 60);
            this.minutes = Math.floor((this._d / 60) % 60);
            this.hours = Math.floor((this._d / 3600));

        }

    }

});




hipoly.easing = { };

// from the excellent OSUblake
// https://gist.github.com/OSUblake/4d9f0caf980f4ee492ef
// example: var slowEaseIn = new hipoly.easing.CubicBezier(0.17, 0, 0.2, 0.06).ease;
hipoly.easing.CubicBezier = (function () {
    function CubicBezier(p1x, p1y, p2x, p2y) {
        if (p1x === void 0) { p1x = 0; }
        if (p1y === void 0) { p1y = 0; }
        if (p2x === void 0) { p2x = 1; }
        if (p2y === void 0) { p2y = 1; }
        this.p1x = p1x;
        this.p1y = p1y;
        this.p2x = p2x;
        this.p2y = p2y;
        this.cx = 3.0 * this.p1x;
        this.cy = 3.0 * this.p1y;
        this.bx = 3.0 * (this.p2x - this.p1x) - this.cx;
        this.by = 3.0 * (this.p2y - this.p1y) - this.cy;
        this.ax = 1.0 - this.cx - this.bx;
        this.ay = 1.0 - this.cy - this.by;
        this.ease = this.ease.bind(this);
    }
    CubicBezier.create = function (name, p1x, p1y, p2x, p2y) {
        if (p1x === void 0) { p1x = 0; }
        if (p1y === void 0) { p1y = 0; }
        if (p2x === void 0) { p2x = 1; }
        if (p2y === void 0) { p2y = 1; }
        var easing = new CubicBezier(p1x, p1y, p2x, p2y);
        if (typeof name === "string")
            CubicBezier.easings[name] = easing;
        return easing.ease;
    };
    CubicBezier.config = function (p1x, p1y, p2x, p2y) {
        if (p1x === void 0) { p1x = 0; }
        if (p1y === void 0) { p1y = 0; }
        if (p2x === void 0) { p2x = 1; }
        if (p2y === void 0) { p2y = 1; }
        return new CubicBezier(p1x, p1y, p2x, p2y).ease;
    };
    CubicBezier.get = function (name) {
        return CubicBezier.easings[name].ease;
    };
    CubicBezier.prototype.getEpsilon = function (duration) {
        if (duration === void 0) { duration = 400; }
        return 1 / (200 * duration);
    };
    CubicBezier.prototype.ease = function (time, start, change, duration) {
        return this.solve(time, this.getEpsilon(duration));
    };
    CubicBezier.prototype.solve = function (x, epsilon) {
        return this.sampleCurveY(this.solveCurveX(x, epsilon));
    };
    CubicBezier.prototype.sampleCurveX = function (t) {
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    };
    CubicBezier.prototype.sampleCurveY = function (t) {
        return ((this.ay * t + this.by) * t + this.cy) * t;
    };
    CubicBezier.prototype.sampleDerivX = function (t) {
        return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
    };
    CubicBezier.prototype.solveCurveX = function (x, epsilon) {
        var t0;
        var t1;
        var t2;
        var x2;
        var d2;
        for (var i = 0, t2 = x; i < 8; i++) {
            x2 = this.sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon)
                return t2;
            d2 = this.sampleDerivX(t2);
            if (Math.abs(d2) < epsilon)
                break;
            t2 = t2 - x2 / d2;
        }
        t0 = 0.0;
        t1 = 1.0;
        t2 = x;
        if (t2 < t0)
            return t0;
        if (t2 > t1)
            return t1;
        while (t0 < t1) {
            x2 = this.sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0;
        }
        return t2;
    };
    CubicBezier.easings = {};
    return CubicBezier;
})();

// hipoly / Math 1.1 <





hipoly.querySelector = function (selectors, scope) {

    return (scope || document).querySelector(selectors);

};

// polyfill because document.querySelectorAll return Array in Chrome but NodeList in FF and Safari
hipoly.querySelectorAll = function(selectors, scope) {

    return Array.prototype.slice.call((scope || document).querySelectorAll(selectors));

};

// allow to display image as if they were used in background with css property background-size: cover;
hipoly.fitImage = function(image, cover) {

    var images = [];

    function fit(image) {

        if (!image.parentNode)
            return;

        var iw = image.naturalWidth;
        var ih = image.naturalHeight;
        // var pw = image.parentRef.offsetWidth;
        // var ph = image.parentRef.offsetHeight;
        var style = image.parentRef.currentStyle || window.getComputedStyle(image.parentRef);
        var pw = parseFloat(style.width);
        var ph = parseFloat(style.height);
        var rw = pw / iw;
        var rh = ph / ih;
        var s = rw * image.cover > rh * image.cover ? rw : rh;
        // image.width = iw * s + 2;
        // image.height = ih * s + 2;

        // console.log(image.src, iw, ih, s);

        image.style.position = 'absolute';
        image.style.transform = 'translate(-50%, -50%) scale(' + (s * 1.01) + ')';
        image.style.top = '50%';
        image.style.left = '50%';

        image.ctnr.style.width = pw + 'px';
        image.ctnr.style.height = ph + 'px';
        image.ctnr.style.overflow = 'hidden';
        image.ctnr.style.position = 'absolute';

    }

    window.addEventListener('resize', function() {

        images.forEach(fit);

    }, false);

    function fitImage (image, cover) {

        if (!image.parentNode) {
            console.log("image has no parent");
            return;
        }

        if (image.naturalWidth == 0 || image.naturalHeight == 0)
            return image.onload = function() { fitImage(this, cover); };

        image.cover = (cover || cover === undefined) ? -1 : 1;
        image.parentRef = image.parentNode;

        var ctnr = document.createElement('div');
        ctnr.id = "fitImage";
        image.parentNode.insertBefore(ctnr, image);
        ctnr.appendChild(image);

        image.ctnr = ctnr;

        fit(image);

        images.push(image);

    }

    hipoly.fitImage = fitImage;

    hipoly.fitImage(image, cover);

};

hipoly.getLoremIpsum = function (nParagraph, paragraphWordCount, paragraphWordCountRandom) {

    hipoly.loremIpsumRandom = hipoly.loremIpsumRandom || hipoly.getRandom(101010);

    var words = new Array("lorem","ipsum","dolor","sit","amet","consectetur","adipisicing","elit","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi","ut","aliquip","ex","ea","commodo","consequat","duis","aute","irure","dolor","in","reprehenderit","in","voluptate","velit","esse","cillum","dolore","eu","fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat","non","proident","sunt","in","culpa","qui","officia","deserunt","mollit","anim","id","est","laborum","sed","ut","perspiciatis","unde","omnis","iste","natus","error","sit","voluptatem","accusantium","doloremque","laudantium","totam","rem","aperiam","eaque","ipsa","quae","ab","illo","inventore","veritatis","et","quasi","architecto","beatae","vitae","dicta","sunt","explicabo","nemo","enim","ipsam","voluptatem","quia","voluptas","sit","aspernatur","aut","odit","aut","fugit","sed","quia","consequuntur","magni","dolores","eos","qui","ratione","voluptatem","sequi","nesciunt","neque","porro","quisquam","est","qui","dolorem","ipsum","quia","dolor","sit","amet","consectetur","adipisci","velit","sed","quia","non","numquam","eius","modi","tempora","incidunt","ut","labore","et","dolore","magnam","aliquam","quaerat","voluptatem","ut","enim","ad","minima","veniam","quis","nostrum","exercitationem","ullam","corporis","suscipit","laboriosam","nisi","ut","aliquid","ex","ea","commodi","consequatur","quis","autem","vel","eum","iure","reprehenderit","qui","in","ea","voluptate","velit","esse","quam","nihil","molestiae","consequatur","vel","illum","qui","dolorem","eum","fugiat","quo","voluptas","nulla","pariatur","at","vero","eos","et","accusamus","et","iusto","odio","dignissimos","ducimus","qui","blanditiis","praesentium","voluptatum","deleniti","atque","corrupti","quos","dolores","et","quas","molestias","excepturi","sint","obcaecati","cupiditate","non","provident","similique","sunt","in","culpa","qui","officia","deserunt","mollitia","animi","id","est","laborum","et","dolorum","fuga","harum","quidem","rerum","facilis","est","et","expedita","distinctio","Nam","libero","tempore","cum","soluta","nobis","est","eligendi","optio","cumque","nihil","impedit","quo","minus","id","quod","maxime","placeat","facere","possimus","omnis","voluptas","assumenda","est","omnis","dolor","repellendus","temporibus","autem","quibusdam","aut","officiis","debitis","aut","rerum","necessitatibus","saepe","eveniet","ut","et","voluptates","repudiandae","sint","molestiae","non","recusandae","itaque","earum","rerum","hic","tenetur","a","sapiente","delectus","aut","reiciendis","voluptatibus","maiores","alias","consequatur","aut","perferendis","doloribus","asperiores","repellat");

    function getSentence(wordCount) {

        var s = hipoly.loremIpsumRandom(words);

        s = s.slice(0, 1).toUpperCase() + s.slice(1);

        while(wordCount-- > 0) {

            s += hipoly.loremIpsumRandom(words);

            if (wordCount > 3 && hipoly.loremIpsumRandom() > 0.90)
                s += ', ';
            else
                s += ' ';
        }

        s = s.slice(0, s.length - 1) + '. ';

        return s;

    }

    function getParagraph(wordCount) {

        var a = [];

        var min = 6, max = 20;

        while (wordCount > 0) {

            var n = hipoly.loremIpsumRandom(min, max, 1);

            if (n > wordCount)
                n = wordCount;

            a.push(n);
            wordCount -= n;

        }

        var s = "";

        while (a.length) 
            s += getSentence(a.shift());

        return s;

    }

    nParagraph = nParagraph || 1;
    paragraphWordCount = paragraphWordCount || 40;
    paragraphWordCountRandom = paragraphWordCountRandom || 15;

    var s = "";

    while (nParagraph-- > 0) {

        if (s.length)
            s += '<br><br>';

        s += getParagraph(paragraphWordCount + hipoly.loremIpsumRandom(-paragraphWordCountRandom/2, paragraphWordCountRandom/2, 1));

    }

    return s;
}






var hipoly = hipoly || { };

hipoly.getUniqueID = function(prefix) {

    hipoly.uniqueID = { };

    hipoly.getUniqueID = function(prefix) {

        if (hipoly.uniqueID.prefix === undefined)
            hipoly.uniqueID.prefix = 0;

        return prefix + "_" + hipoly.uniqueID.prefix++;
    }

    return hipoly.getUniqueID(prefix);

};





hipoly.SVG = function() {

    var regexp = /[A-Z]/g;

    function replace(m, p, o, s) { return "-" + m.toLowerCase(); }

    function assign(n, v) {

        for (var p in v) {

            if (v[p] == null) {

                n.removeAttributeNS(null, p.replace(regexp, replace));
            
            } else {

                n.setAttributeNS(null, p.replace(regexp, replace), v[p]);

            }

        }

        return n;

    }

    function retrieve(n) {

        var r = { };
        var a = n.attributes;
        var p;
        var v;

        for (var i = 0; i < a.length; i++) {

            p = a[i];
            v = Number(p.value);
            r[p.name] = isNaN(v) ? p.value : v;

        }

        return r;

    }

    return function(n, v) {

        if (n instanceof SVGElement) {

            return v ? assign(n, v) : retrieve(n);

        } else {

            return assign(document.createElementNS("http://www.w3.org/2000/svg", n), v);

        }

    }

}(); 




hipoly.browserDetection = function() {

    hipoly.browser = {};

    // from : 
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    // https://jsfiddle.net/9atsffau/

    // Opera 8.0+
    hipoly.browser.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    hipoly.browser.isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    hipoly.browser.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    hipoly.browser.isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    hipoly.browser.isEdge = !hipoly.browser.isIE && !!window.StyleMedia;
    // Chrome 1+
    hipoly.browser.isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    hipoly.browser.isBlink = (hipoly.browser.isChrome || hipoly.browser.isOpera) && !!window.CSS;

};



hipoly.forRange = function(n, callback, s) {

    if (isNaN(s))
        s = 1;

    for (var i = 0; i < n; i += s) 
        callback.apply();

};

// test branch

hispoly.newBranch = function() {
    
}









/*

1.4: add previous to Call which leads to:
    Call().addToStack
    Call().removeFromStack
    Stack.remove wait now for 2 arguments, first is the function to remove, seconds precise if all occurence of the function should be removed

1.5: add defaultThisArg to Stack, thereby it's possible to define scope once for all
    Call().execute() wait now an optional arguments: altThisArg     

1.6: Stack().defaultThisArg is renamed defaultScope
    Call().execute() argument altThisArg is renamed scope
    Every Stack execution method accept a new argument scope which could refer to temporary scope to use for Call.execute
    So, there are 3 ways to define the scope, by priority:
        1. On the call itself (via Stack.add(myFunction, myArguments, myScope))
        2. On the stack (via Stack().defaultScope which could be define via the constructor)
        3. On the stack execution methods (execute, executeWhile, dump, dumpWhile)

1.7: Allow minified with http://closure-compiler.appspot.com/ requires to :
    rename arguments to args (because arguments is used by js as the accessor of any function arguments).
    remove get accessor in a ES6 way, concerned: Call.destroyed


*/

// hipoly.Stack 1.7 >

var hipoly = hipoly || { };

hipoly.Call = function(fn, args, scope) { 

    this.fn = fn;
    this.args = args;
    this.scope = scope;

};

hipoly.Call.prototype = {

    stack:null,
    previous:null,
    next:null,

    fn:null,
    scope:null,
    args:null,

    addToStack:function(stack) {

        if (this.stack)
            this.removeFromStack();

        this.stack = stack;

        if (this.stack.last) {

            this.stack.last.next = this;
            this.previous = this.stack.last;
            this.stack.last = this;

        } else {

            this.stack.first = this;
            this.stack.last = this;

        }

        this.stack.size++;

    },
    
    removeFromStack:function() {

        if (!this.stack)
            return false;

        if (this.next)
            this.next.previous = this.previous;
        else
            this.stack.last = this.previous;

        if (this.previous)
            this.previous.next = this.next;
        else
            this.stack.first = this.next;

        this.previous = null;
        this.next = null;

        this.stack.size--;
        this.stack = null;

        return true;

    },

    destroy:function() {

        for (var p in this) {

            this[p] = null;

        }

    },

    execute:function(scope) {

        return this.fn.apply(this.scope || scope, this.args);

    }
};

Object.defineProperties(hipoly.Call.prototype, {

    'destroyed': {
        get: function() { return !this.fn; }
    }

});




hipoly.Stack = function(name, defaultScope) { 

    this.name = name !== undefined ? name : "Stack_" + hipoly.Stack.count;
    this.defaultScope = defaultScope;
    hipoly.Stack.count++; 

}

hipoly.Stack.count = 0;

hipoly.Stack.prototype = {

    name:null,
    first:null,
    last:null,
    size:0,

    defaultScope:null,

    add:function(fn, args, scope) {

        var call = new hipoly.Call(fn, args, scope);

        call.addToStack(this);

        return call;

    },

    remove:function(fn, all) {

        var n = 0;
        var call = this.first, next;

        while (call) {

            if (call.fn === fn) {

                next = call.next;
                call.removeFromStack();
                call.destroy();
                n++;

                if (!all)
                    return n;

            }

            call = next;

        }

        return n;

    },

    execute:function(scope) {

        var call = this.first;
        var next;

        while (call) {

            next = call.next;
            call.execute(this.defaultScope || scope);
            call = next;

        }

    },

    executeWhile:function(delay, scope) {

        var call = this.first;
        var t = window.performance.now();

        while (call && window.performance.now() - t < delay) {

            next = call.next;
            call.execute(this.defaultScope || scope);
            call = next;

        }

    },

    dump:function(scope) {

        var call = this.first;
        var next;
        var n = this.size;

        while (call) {

            next = call.next;
            call.execute(this.defaultScope || scope);
            call.destroy();
            call = next;

        }

        this.size = 0;

        this.first = this.last = null;

        return n;

    },

    dumpWhile:function(delay, scope) {

        var call = this.first;
        var next;
        var t = window.performance.now();
        var n = this.size;

        while (call && window.performance.now() - t < delay) {

            next = call.next;
            call.execute(this.defaultScope || scope);
            call.destroy();
            call = next;
            this.size--;

        }

        this.first = call;

        if (!call)
            this.last = null;

        return n - this.size;

    },

    clear:function() {

        var call = this.first;
        var next;
        var n = this.size;

        while(call) {

            next = call.next;
            call.destroy();
            call = next;

        }

        this.first = this.last = null;
        this.size = 0;

        return n;

    },

    toString:function() {

        return "Stack " + this.name + ", size: " + this.size;

    }

}

// hipoly.Stack 1.7 <


