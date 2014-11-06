sand.define('Resource', [
	'Seed',
	'DOM/handle',
	'DOM/toDOM'
], function(r) {

		Function.prototype.curry = function () {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		return function () {
			return self.apply([], args.concat(Array.prototype.slice.call(arguments)));
		};
	}

	return r.Seed.extend({


		/*tpl : function() {
			var style = {
				pointerEvents : "none"
			};

			return {
				tag : '.resource.resource-' + this.getPicto(),
				children : [
					{
						tag : '.picto',
						style : style
					},
					{
						tag : '.label ' + (this.model.tm.originalFilename || '').shrink(20),
						style : {
							pointerEvents : "none",
						}
					}
				],
				style : {
					position : "relative",
				}
			}
		},

		isImg : function() {
			var ext = this.getExtension();
			return /(jpg)|(jpeg)|(gif)|(png)/i.exec(ext);
		},

		getExtension : function() {
			return (this.model.tm.originalFilename || '').split('.').last();
		},

		getPicto : function() {
			var ext = this.getExtension();
			return {
				'docx' : 'doc',
				'pptx' : 'ppt',
				'xlsx' : 'xls'
			}[ext] || ext;
		},*/

		'+init' : function(input) {

			this.el = r.toDOM({
				tag : '.resource',
				children : [
					{
						tag : '.picto',
						style : {
							pointerEvents : "none",
							backgroundImage : 'url(' + input.src + ')',
						}
					},
					{
						tag : '.label ' + (input.title || "No title"),
						style : {
							pointerEvents : "none",
						}
					}
				],
				style : {
					position : "relative",
				}
			});

			this.handle = r.handle(this.el);
			
			this.handle.drag({
				start : function (e){
					e.preventDefault();

					if(e.target == this.remove) {
						//Sthis.el.parentNode.deleteRessource(this.model,this.el,Array.prototype.slice.call(this.el.parentNode.childNodes).indexOf(this.el));
						this.noDragNoDrop = true;
						return;
					}

					this.fParent = this.el.parentNode;
					//this.el.style.position = "absolute";

					if(!this.hintDiv) this.hintDiv = document.createElement('div');
					this.hintDiv.style.width = "1px";
					this.hintDiv.style.height = "66px";
					this.hintDiv.style.cssFloat = "left";
					this.hintDiv.style.backgroundColor = "#B5302b";
					this.hintDiv.style.marginRight = "-1px";

					this.sL = this.el.style.left;
					this.sT = this.el.style.top;
					this.oL = $(this.el).offset().left;
					this.oT = $(this.el).offset().top;
					this.width = $(this.el).width();
					this.height = $(this.el).height();

					this.sIndex = Array.prototype.slice.call(this.el.parentNode.childNodes).indexOf(this.el);
					

					this.cOffsetX = e.xy[0] - $(this.el).offset().left;
					this.cOffsetY = e.xy[1] - $(this.el).offset().top;

					this.el.style.left = e.xy[0] - this.oL + $(document.body).scrollLeft() - this.cOffsetX + "px";
					this.el.style.top = e.xy[1] - this.oT  + $(document.body).scrollTop() - this.cOffsetY  + "px";

					this.el.style.pointerEvents = "none";
					
					/*$.each($("[dropzone=true]"),function(index,value){
						$(value).hover(function (){
							value.style.border = "1px solid #B5302b";
						}.curry(value), function (){
							value.style.border = "none";
						}.curry(value))
					})*/

				}.wrap(this),
				drag : function (e) {

					if(this.noDragNoDrop) return;

					this.el.style.left = e.xy[0] - this.oL /*+ $(document.body).scrollLeft()*/ - this.cOffsetX + "px";
					this.el.style.top = e.xy[1] - this.oT /*+	$(document.body).scrollTop()*/ - this.cOffsetY + "px";
					console.log(this.el.style.left,this.el.style.top)
					//this.hint(e,this.hintDiv);
				}.wrap(this),
				end: function (e) {
					if(this.noDragNoDrop) {
						this.noDragNoDrop = false;
						return;
					}
					
					/*$.each($("[dropzone=true]"),function(index,value){ 
						value.style.border = "none";
						$(value).off( "mouseenter mouseleave" )
					});*/

					if(this.hintDiv.parentNode) this.hintDiv.parentNode.removeChild(this.hintDiv);

					var next = this.hint(e,this.el);
					if(next && next != this.fParent) {
						//next.addDroppedElement(this.model,Array.prototype.slice.call(this.el.parentNode.childNodes).indexOf(this.el));
						//if(this.fParent.deleteRessource) this.fParent.deleteRessource(this.model,null,this.sIndex);
					}

					this.el.style.pointerEvents = "auto"
					this.el.style.left = null;
					this.el.style.top = null;
				}.wrap(this)
			});

			this.handle.on('click', this.fire.bind(this).curry('click'), this);
		},

		hint : function (e,elem) {
			var next = document.elementFromPoint(e.xy[0],e.xy[1]);
			
			if(next.getAttribute("dropzone") && !document.elementFromPoint(e.xy[0]+this.width,e.xy[1]).getAttribute("dropzone")&& !document.elementFromPoint(e.xy[0]-this.width,e.xy[1]).getAttribute("dropzone")) return null;
			else if(next.getAttribute("dropzone") && !document.elementFromPoint(e.xy[0]+25,e.xy[1]).getAttribute("dropzone")){
						var temp = document.elementFromPoint(e.xy[0]-25,e.xy[1])
						$(elem).insertAfter($(temp));
						return next;
			}
			else if(next.getAttribute("dropzone")) {
				next.appendChild(elem);
				return next;
			} else if (next.parentNode.getAttribute("dropzone")){
				e.xy[0] - $(next).offset().left <  parseInt($(next).width())*0.5 ? $(elem).insertBefore($(next)) : $(elem).insertAfter($(next));
				return next.parentNode;
			}

			return null;
		}

	})

});