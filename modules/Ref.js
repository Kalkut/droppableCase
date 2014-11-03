sand.define('Geo/Ref', function(r) {
    
  var Ref = function(options) {
    this.origin = options.origin;
    this.factor = options.factor;
  };

  Ref.prototype = {
    isRef : true,

    scale : function(o, df) {
      this.origin = o;

      if(typeof(this.factor) === 'number') {
        this.factor *= df;
      }
      else {
        this.factor[0] *= df;
        this.factor[1] *= df;
      }
    },
    
    equals : function(ref) { // we use this cause sometimes 2 refs are different objects but still equal, see Ref.db
      return this.origin.equals(ref.origin) && ((typeof(this.factor) === 'number') ? this.factor === ref.factor : this.factor.equals(ref.factor))
    }
  }
  
  //WCB
  Ref.db = new Ref({
    origin : [0, 0],
    factor : 1
  });
  
  return Ref;
     
});
