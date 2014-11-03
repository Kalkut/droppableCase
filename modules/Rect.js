sand.define('Geo/Rect', [
  'Geo/R4',
  'core/extend',
  'Geo/Seg',
  'Geo/Point',
  'Geo/Ref'
], function(r) {

  var R4 = r.R4,
    extend = r.extend,
    Seg = r.Seg;

  var Rect = function(options, ref) {
    R4.call(this, options);

    if (options.refName || (ref && !ref.isRef)) {
      console.log('%c [ERROR] Rect.js, options.refName is revoked', 'background: #222; color: #bada55');
    }
    
    ref = ref || options.ref;

    if (!ref) {
      ref = r.Ref.db; // defaults to db ref, shared between modules
    }
    
    this.ref = ref;
  };


  extend(Rect.prototype, R4.prototype,{

    isRect : true,

    inRef : function(ref, options) {
      options = options || {};
      
      if (!ref.isRef) {
        console.log('%c [ERROR] Rect.js, Illegal call of inRef', 'background: #222; color: #bada55');
      }

      var oRef = this.ref;
      var nRef = ref;

      var nOrigin = nRef.origin;
      var nFactor = nRef.factor;

      //var rounded = options.rounded || true;

      var nSegX, nSegY;

      var oFactor = oRef.factor;
      var oOrigin = oRef.origin;

      if(typeof(oFactor) === 'number')
      {
          oFactor = [oFactor, oFactor];
      }
       if(typeof(nFactor) === 'number')
       {
           nFactor = [nFactor, nFactor];
       }

      var dFactor = [nFactor[0]/oFactor[0], nFactor[1]/oFactor[1]];

      var dOrigin = [oFactor[0]*(nOrigin[0]-oOrigin[0]), oFactor[1]*(nOrigin[1]-oOrigin[1])]; // new origin

      if (options.override) {
        this.segX.add(-dOrigin[0]);
        this.segY.add(-dOrigin[1]);
        this.segX.multiply(dFactor[0]);
        this.segY.multiply(dFactor[1]);
        this.ref = ref;
      }
      else {
        nSegX = new Seg(this.segX.c1 - dOrigin[0], this.segX.c2 - dOrigin[0]); nSegX.multiply(dFactor[0]);
        nSegY = new Seg(this.segY.c1 - dOrigin[1], this.segY.c2 - dOrigin[1]); nSegY.multiply(dFactor[1]);
        return new Rect({ segX : nSegX, segY : nSegY }, ref)
      }
    },

    withSize : function(size) {
      return new Rect({ center : this.getCenter(), size : size });
    },

    move: function(options) {
      var nRect = this.clone();

      var vector = options.vector; var center = options.center; var scale = options.scale; var staticPoint = ( options.staticPoint ) ? options.staticPoint.clone() : false;
      
      if (staticPoint && scale) {
        if (staticPoint.isPoint) staticPoint = staticPoint.inRef(this.ref).getValue();
        center = staticPoint.minus(staticPoint.minus(nRect.getCenter()).multiply(scale));
      }
      
      if (vector) {
        if (vector.isVector) vector = vector.inRef(this.ref).getValue();
        nRect.segX.add(vector[0]);
        nRect.segY.add(vector[1]);
      }

      if (center) {
        nRect.segX.setMiddle(center[0]);
        nRect.segY.setMiddle(center[1]);
      }

      if (scale) {
        var f = scale; // factor

        var nL = f*(nRect.segX.length());
        var m = nRect.segX.getMiddle();
        nRect.segX =  (new Seg(m-nL/2, m+nL/2));

        nL = f*(nRect.segY.length());
        m = nRect.segY.getMiddle();
        nRect.segY = (new Seg(m-nL/2, m+nL/2));   
      }
      
      if (options.override) {
        this.segX = nRect.segX;
        this.segY = nRect.segY;

        return this;
      }
      return nRect;

    },

    position : function(){
      return new r.Point({ x: this.segX.c1, y: this.segY.c1, ref : this.ref });
    },

    points : function(){
      // in direct sens
      return [
        new r.Point({ x: this.segX.c1, y: this.segY.c1, ref : this.ref}),
        new r.Point({ x: this.segX.c1, y: this.segY.c2, ref : this.ref}),
        new r.Point({ x: this.segX.c2, y: this.segY.c2, ref : this.ref}),
        new r.Point({ x: this.segX.c2, y: this.segY.c1, ref : this.ref})
      ];
    },

    clone : function() {
      return new Rect(R4.prototype.clone.call(this), this.ref);
    }

  });

  return Rect;

});
