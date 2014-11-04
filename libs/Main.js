sand.define('Main',['Case','Seed','DOM/toDOM',],function (r){
	
	return r.Seed.extend({
		'+init' : function (input) {
		this.el = r.toDOM({
			tag : '.cases',
			children : [
				{ children : [this.create(r.Case,{width : 400, height : 400, type : 'img', imgSrc : '/future.png'},'case1').el], style : { position : 'relative', width : 400, height : 400}},
				{ children : [this.create(r.Case,{width : 300, height : 400, type : 'img', imgSrc : '/nasa.jpg'},'case2').el], style : { position : 'relative', width : 300, height : 400}},
			]
		})
		}
	})

})