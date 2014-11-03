sand.define("DOM/handle", [
    "core/extend",
    "DOM/UA",
    "DOM/devices/*",
    "core/String/capitalize"
  ],
  function(r) {
  
  var extend = r.extend,
    UA = r.UA;

  var device = r.devices[UA.capitalize()];
  var handles = [];

  extend(Function.prototype, {
    wrap : function(scope) {
      var self = scope ? this.bind(scope) : this;
      return (function(e) {
        return self(device.prototype.wrap(e));
      });
    },
      
    wrapKey : function(scope) {
      var self = scope ? this.bind(scope) : this;
      return (function(e) {
        return self(device.prototype.wrapKey(e));
      });
    }
  });
  
  var handle = function(node,o) {
    if (node.node && node.node.toString() === '[object HTMLDivElement]') { //MCB //WCB if toString does not return this value
      node = node.node;
    }
    this.node = node;
    this.device = new (device)(extend(o || {}, { node : this.node }));
  };

  var handler = function(node, o) {
    // prevent conflict between handles
    for (var i = handles.length; i--; ) {
      if (handles[i].node === node) {
        return handles[i];
      }
    }

    var _h = new handle(node, o);
    handles.push(_h);
    return _h;
  };

  handle.prototype = {

    changeDraged : function(e, newHandle) {
      this.device.changeDraged(e, newHandle);
    },

    draged : function(e, o) { // simulates an already initialized drag
      this.device.draged(e, o);
    },

    undrag : function(e) {
      this.device.undrag(e);
    },

    drag : function(o,t) {
      if (typeof(o) !== "object") return;
      if (o.start) {
        if (this._start) this._start.un();
        this._start = this.device.on("drag:start", function(args) {
          var ret = o.start(args[0], args[1]);
          if (ret && ret.cancel) {
            this.device.cancelDrag(args[0], ret.cancel);
            if (typeof(ret.cancel) === 'function') ret.cancel();
          }
        }.bind(this), this);
      }
      if (o.drag) {
        if (this._drag) this._drag.un();
        this._drag = this.device.on("drag:drag", function(args) {
          o.drag(args[0]);
        }.bind(this), this);
      }
      if (o.end) {
        if (this._end) this._end.un();
        this._end = this.device.on("drag:end", function(args) { o.end(args[0]); }.bind(this), this);
      }
      if (o.right) {
        this._right = this.device.on('rightclick', function(args) {
          o.right(args[0]);
        }, this);
      }
      
      //caution
      return {
        un : function() {
          this._start.un();
          this._drag.un();
          this._end.un();
          this._right.un();
          this._start = this._drag = this._end = null;
        }.bind(this)
      };
    },

    over : function(f) {
      if (this._over) this._over.un();
      this._over = this.device.on("over", function(args) { f(args[0]); }.bind(this));
    },

    out : function(f) {
      if (this._out) this._out.un();
      this._out = this.device.on("out", function(args) { f(args[0]); }.bind(this));
    },

    down : function(f) {

    },

    up : function(f) {

    },

    click : function(f) {
      return (this.device.on('click', function(args) { f(args[0]); }.bind(this)));
      //this.attach(this.config.click, this.config.dragWrap(f, this), false, "click");
    },

    dblclick : function(f) {
      if (UA == 'ipad') {
        console.log('[ERROR] you should not try to bind a double-click on the ipad');
        return;
      }
      this.device.$listeners.dblclick = [];
      return (this.device.on("dblclick", function(args) { f(args[0]); }.bind(this)));
    },

    iScroll : function(o) {
      var subs = [this.device.on("iScroll:change", function(args) {
        o.change(args[0]);
        args[0].halt();
      }.bind(this)),
      this.device.on("iScroll:end", function(args) {
        o.end(args[0]);
        args[0].halt();
      }.bind(this))];

      return ({
        un : function() {
          subs[0].un();
          subs[1].un();
        }.bind(this)
      });
    },

    scroll : function(f) { // f({ scale : , xy })
      this.device.$listeners.scroll = [];
      this.device.on("scroll", function(args) { f(args[0]); }.bind(this));
    },

    keydown : function(f) {
      return this.device.on("keyDown", function(args) { f(args[0]); }.bind(this));
    },

    keyup : function(f) {
      return this.device.on("keyUp", function(args) { f(args[0]); }.bind(this));
    },

    on : function(evtName, f, scope) {
      return this.device.on(evtName, function(args) { f(args[0]); }.bind(this), scope);
    }

  };
  
  return handler;
    
});
