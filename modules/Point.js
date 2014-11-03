sand.define('Geo/Point', [
  'core/isArray',
  'Geo/Ref'
], function(r) {
  
  var Point = function(options, ref) {
    if (typeof(options.x) !== "undefined") {
      this.x = options.x;
      this.y = options.y;
    }
    else if (options.position) {
      this.x = options.position[0];
      this.y = options.position[1];
    }
    else {
      this.x = options[0];
      this.y = options[1];

      this.ref = ref;
    }
    
    if (options.ref) {
      this.ref = options.ref || ref;
    }
    
    if (options.refName) {
      console.log('%c [ERROR] Point.js, options.refName is revoked', 'background: #222; color: #bada55');
    }
    
    if (!this.ref) this.ref = r.Ref.db;
  };
            
  Point.prototype = {
    
    isPoint : true,
    
    getValue : function() {
      return ([this.x, this.y]); 
    },
    
    inRef : function(ref) {
      if (!ref || !ref.isRef) {
        console.log('%c [ERROR] Illegal parameter to inRef', 'background: #222; color: #bada55');
      }
      
      // we assume at this point we always have two different refs
      // if its not the case we are gonna do some useless additional operations, but it might be less costly than a ref check test
      var oRef = this.ref;
      var nRef = ref;

      var newO = nRef.origin;
      var oldO = oRef.origin;

      var dO = oldO.minus(newO);

      return (new Point({ x : (dO[0] + this.x/oRef.factor) * nRef.factor, y : (dO[1] + this.y/oRef.factor) * nRef.factor, ref : nRef }));
    },
    
    multiply : function(f) {
      return (new Point({ x : this.x * f, y : this.y * f, ref : this.ref }));
    },
    
    add : function(p2){
      var p2Bis;
      if(r.isArray(p2)){
        //global
        p2Bis = (new Point({x : p2[0], y : p2[1], ref : this.ref }));
      } else {
        p2Bis = p2.inRef(this.ref);
      }
      return (new Point({ x : this.x + p2Bis.x, y : this.y +p2Bis.y, ref : this.ref }));
    },
    
    minus : function(p2){
      var p2Bis;
      if(r.isArray(p2)){
        p2Bis = (new Point({x : p2[0], y : p2[1], ref : this.ref }));
      } else {
        p2Bis = p2.inRef(this.ref);
      }
      return (new Point({ x : this.x - p2Bis.x, y : this.y - p2Bis.y, ref : this.ref }));
    },
    
    clone : function() {
      return (new Point({ x : this.x, y : this.y, ref : this.ref }));
    },
    
    round : function(){
      return (new Point({ x : Math.round(this.x), y : Math.round(this.y), ref : this.ref }));
    }
  }
  
  return Point;
  
});
