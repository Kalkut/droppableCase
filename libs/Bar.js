sand.define('Bar', [
	'Seed',
	'DOM/handle',
	'Resource',
	'DOM/toDOM'
], function (r) {

	return r.Seed.extend({
		

		/*tpl : function() {

			return {
				tag : '.resources-bloc.'+(opt.type || ""),
				children : [
					{
						tag : ".hint Drop your documents here",
						style : {
							position : "absolute",
							pointerEvent : "none",
						}
					},
					'.resources',
				]
			}
		},*/

		'+init' : function(opt) {
			this.scope = {}
			this.el = r.toDOM({
				tag : '.resources-bloc.'+(opt.type || ""),
				children : [
					'.resources',
				]
			},this.scope)

			this.scope.resources.setAttribute("dropzone",true);
		},

		addResource : function (src,title) {
			this.scope.resources.appendChild(this.create(r.Resource,{ src: src,title : title},'lastResource').el);
			//ADD DP INSERT HERE
		}
	
	})
});