(sand.define("Geo/Seg", function(r) {
    
  var m = Math;
    
  var Seg = function(c1, c2) {
    this.c1 = c1;
    this.c2 = c2;
  }
    
  Seg.prototype = {
    
    set : function(c1, c2) {
      this.c1 = c1;
      this.c2 = c2;
      return this;
    },
    
    expand : function(v) {
      this.c1 -= v;
      this.c2 += v;
      return this;
    },
    
    setSize : function(size, o) {
      if (!o || !o.fromMiddle) this.c2 = this.c1 + size;
      else {
        var m = (this.c1 + this.c2) / 2;
        this.c1 = m - size / 2;
        this.c2 = m + size / 2;
      }
      return this;
    },
    
    round : function() {
      this.c1 = this.c1.round();
      this.c2 = this.c2.round();
    },
        isSeg : true,

         getIntersectionWith : function(seg) //WARNING : at the moment inter doesn't return a Point
         {
             return ( (this.c2 <= seg.c1 || this.c1 >= seg.c2) ? null : new Seg( ( this.c1 > seg.c1 ) ? this.c1 : seg.c1 , ( this.c2 < seg.c2 ) ? this.c2 : seg.c2 ) );
         },

         translate : function(d) {
           this.c1 += d;
           this.c2 += d;
         },

        contains : function(p)
        {
            return ((this.c1 < p) && (p < this.c2));
        },
        
        equals : function(seg)
        {
            return (seg.c1 === this.c1 && seg.c2 === this.c2);
        },
                    
        add : function(c)
        {
            this.c1 += c;
            this.c2 += c;
        },
                    
        getMiddle : function()
        {
            return ((this.c2 + this.c1)*0.5);
        },

        length : function()
        {
            return (this.getLength());
        },
        
        getLength : function()
        {
            return (this.c2 - this.c1);
        },
                   
        scale : function(f) // factor
        {
            var nL = f*(this.length());
            this.c1 = f*this.c1;
            this.c2 = this.c1 + nL;
        },
                  
        multiply : function(f)
        {
            this.c1 = f*this.c1;
            this.c2 = f*this.c2;
        },
                 
        round : function()
        {
          console.log('ROUND');
            return (new Seg(m.round(this.c1), m.round(this.c2)));
        },
                    
        setMiddle : function(value)
        {
             var halfL = this.length()/2;
             this.c1 = value-halfL;
             this.c2 = value+halfL;
             return this;
        }
        
    }
    
    return Seg;
    
}));
