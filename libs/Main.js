sand.define('Main',['Case','Seed','DOM/toDOM',],function (r){
	
	return r.Seed.extend({
		'+init' : function (input) {
		this.el = r.toDOM({
			tag : '.cases',
			children : [
				this.create(r.Case,{width : 400, height : 400, type : 'img', imgSrc : '/future.png'},'case1').el,
				this.create(r.Case,{width : 400, height : 400, type : 'img', imgSrc : '/nasa.jpg'},'case2').el,
			]
		})
		}
	})

})