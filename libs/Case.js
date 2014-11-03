sand.define('Case', [
	"Geo/*",
	'Seed',
	'DOM/toDOM',
	'DOM/handle'
], function (r) {
	
	var onimagesload = function (imgs,callback) {
		var l = imgs.length;
		var c = 0;
		for (var i = 0; i < l; i++){
			if (imgs[i].complete) c++;
			else imgs[i].onload = function () {
				c++;
				if (c === l) callback();
			}
		}

		if (c === l) callback();
	}

	return r.Seed.extend({
		'+options' : {
			type : 'img',
			clicking : false
		},

		'+init' : function (options) {
			
			this.img = new Image();
			if(options.imgSrc) this.img.src = options.imgSrc;
			this.img.style.position = "absolute";
			this.img.style.left = 0 +'px';
			this.img.style.top = 0 + 'px';
			this.type = options.type;
			this.fit = options.fit // Mode libre, pas de restriction sur le mouvement ou sur le zoom de l'image
			this.pos = options.pos;
			this.cursorOver = false;
			this.imgRect;
			this.divRect;
			this.staticPoint;
			this.states = [];
			this.cancel = 0;
			this.factor = options.factor || 1;
			
			this.debugScope = {}
			this.debugBox = r.toDOM({
				tag : ".debugBox",
				style : {
					backgroundColor : "#000000",
					color : "#FFFFFF",
					zIndex : 7,
					position : "absolute"
				},
				innerHTML : "debug"
			},this.debugScope)

			this.debugScope = this.debugScope.debugBox;

			
			this.el = this.div = r.toDOM({
				tag : 'div.' + (options.prefix ? (options.prefix + "-") : "") + "case",
				style : {
					position : "relative", // IMPORTANT : ABSOLUTE OR RELATIVE
					overflow : "hidden",
					width : options.width + 'px',
					height : options.height + 'px',
					outline : "none",
				}
			})

			//this.div.appendChild(this.debugScope);

			if(this.type === 'txt') {
				this.txtBloc = r.toDOM({
					tag : 'table.' + (options.prefix ? (options.prefix + "-") : "") + "case",
					children : [
					{
						tag : 'tr.' + (options.prefix ? (options.prefix + "-") : "") + "case",
						children : [
						{
							tag : 'td.' + (options.prefix ? (options.prefix + "-") : "") + "case",
							children : [
							{
								tag : 'div.' + (options.prefix ? (options.prefix + "-") : "") + "case",
								events : {
									keyup : function () {
										this.fire('case:titleChanged',this.txtBloc.children[0].children[0].children[0].innerHTML);
									}.bind(this),
								},
								style : {
									color : options.color || "#AAAAAA",
								},
								attr : {
									contenteditable : true,
								}
							},
							]
						}
						]
					}],
				})

				this.div.onmousedown = function (e) {
					e.preventDefault();
					this.txtBloc.children[0].children[0].children[0].focus();
				}.bind(this)

				this.div.appendChild(this.txtBloc);

				this.on('case:setColor', function (color) {
					this.setColor(color);
				}.bind(this));

			}else if (this.type === 'img') {
				
				this.div.appendChild(this.img);
				this.clicking;
				this.cursorOver;
				this.posClick = [this.img.width/2,this.img.height/2];
				this.z = 0;

				//this.div.onmousedown = function (e) {
				this.start = function (e) {
					e.preventDefault();
					//e.stopPropagation();
					console.log("ok")
					this.clicking = true;
					this.posClick[0] = e.xy[0]
					this.posClick[1] = e.xy[1]
					this.lastFactor = this.lastScale = 1;
          this.states.push({ type : "caseAction", sState : {rect : jQuery.extend({},this.imgRect), left : this.img.style.left, top : this.img.style.top, width : this.img.style.width, height : this.img.style.height}});
				}.bind(this)
				
				addEventListener("mouseup", function (e) {
					this.clicking = false;
				}.bind(this))

				this.zoomEvent = function (e) {
					//if(e.shiftKey || e.scale){
						//e.preventDefault();
						var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));// 1 : mousewheelup, 2 : mousewheeldown
						//var factor = (e.scale > 1 || delta > 0) ? 1.01 : 0.99;
						//this.factor = ((this.deltaScale || e.scale) <= e.scale || delta > 0) ? 1.01 : 0.99;
						var lf = this.lastFactor;
						this.factor = e.scale/(this.lastScale || 1) * this.factor;
						this.factor = this.factor/(this.lastFactor || 1);
						this.lastFactor = this.factor;
						//this.debugFactor = this.deltaScale - e.scale;
						//this.deltaScale = e.scale || null;
						this.lastScale = e.scale;
						this.potentialRect = this.imgRect.move({staticPoint : this.staticPoint, scale : this.lastFactor});// Merci Geo
						
						if(e.touches && e.touches.length > 1) {
							var tCenter = [0.5*(e.touches[0].clientX + e.touches[1].clientX),0.5*(e.touches[0].clientY+e.touches[1].clientY)]
						}else {
							var tCenter = [null,null];
						}

						this.imgCenter = [parseInt(this.div.style.width)/2,parseInt(this.div.style.height)/2];
						
						this.staticPoint = new r.Geo.Point([( e.clientX /*|| e.center[0] */|| tCenter[0] || e.xy[0] ) - $(this.div).offset().left,( e.clientY /*|| e.center[1]*/ || tCenter[1] || e.xy[1]) -  $(this.div).offset().top]); //origine du referentiel du zoom = curseur

						//console.log([( e.clientX /*|| e.center[0] */|| tCenter[0] || e.xy[0] ) - $(this.div).offset().left,( e.clientY /*|| e.center[1]*/ || tCenter[1] || e.xy[1]) -  $(this.div).offset().top]);
						//this.staticPoint = this.staticPoint.inRef(this.imgRect.ref);//on dilate l'image en conservant statique la position du curseur -> on passe au référentiel de l'image
						
						
						

						if( (!this.fit && (( this.potentialRect.segX.length() >= this.divRect.segX.length() ) && ( this.potentialRect.segY.length() >= this.divRect.segY.length() ) ) ) ) {
							this.zoom(this.factor);
							
							this.fire('case:imageMovedPx',this.img.style.left,this.img.style.top,this.img.style.width,this.img.style.height);
							this.fire('case:imageMovedInt',parseInt(this.img.style.left),parseInt(this.img.style.top),parseInt(this.img.style.width),parseInt(this.img.style.height));
						}else if (this.fit) {
							
							if(!(Math.ceil(this.potentialRect.segX.c2) >= this.divRect.segX.c2 && Math.floor(this.potentialRect.segX.c1) <= this.divRect.segX.c1 && Math.floor(this.potentialRect.segY.c1) <= this.divRect.segY.c1 && Math.ceil(this.potentialRect.segY.c2) >= this.divRect.segY.c2 ) ) {
							this.imgRect.setCenter(this.divRect.getCenter())
							this.staticPoint = this.imgCenter
							this.zoom(this.factor,2);
							
							this.fire('case:imageMovedPx',this.img.style.left,this.img.style.top,this.img.style.width,this.img.style.height);
							this.fire('case:imageMovedInt',parseInt(this.img.style.left),parseInt(this.img.style.top),parseInt(this.img.style.width),parseInt(this.img.style.height));
							}else {
								this.zoom(this.factor);
								
							}

						}
					//}
				}

				this.div.addEventListener('mousewheel', this.zoomEvent.bind(this))

					this.drag = function(e) {
					if(this.clicking && !this.frozen) {
						this.staticPoint = new r.Geo.Point([e.xy[0] - this.div.offsetLeft, e.xy[1] - this.div.offsetTop].add([document.body.scrollLeft, document.body.scrollTop]));
						this.staticPoint = this.staticPoint.inRef(this.imgRect.ref);
						//var deltaX = e.xy[0] - this.posClick[0];
						//var deltaY = e.xy[1] - this.posClick[1];
						var delta = e.translation || [0,0]//[deltaX,deltaY];
						//this.debugDelta = delta;
						this.debugScope.innerHTML = delta;
						this.potentialRect = this.imgRect.move({vector : delta});
						var lX = this.potentialRect.segX.length();
						var lY = this.potentialRect.segY.length();

						this.potentialRect.segX.c1 = Math.min(this.divRect.segX.c1,this.potentialRect.segX.c1);
						this.potentialRect.segX.c2 = this.potentialRect.segX.c1 + lX;
						this.potentialRect.segY.c1 = Math.min(this.divRect.segY.c1,this.potentialRect.segY.c1);
						this.potentialRect.segY.c2 = this.potentialRect.segY.c1 + lY;
						this.potentialRect.segX.c2 = Math.max(this.divRect.segX.c2,this.potentialRect.segX.c2);
						this.potentialRect.segX.c1 = this.potentialRect.segX.c2 - lX;
						this.potentialRect.segY.c2 = Math.max(this.divRect.segY.c2,this.potentialRect.segY.c2);
						this.potentialRect.segY.c1 = this.potentialRect.segY.c2 - lY;

						//if ( (Math.ceil(this.potentialRect.segX.c2) >= this.divRect.segX.c2 && Math.floor(this.potentialRect.segX.c1) <= this.divRect.segX.c1 && Math.floor(this.potentialRect.segY.c1) <= this.divRect.segY.c1 && Math.ceil(this.potentialRect.segY.c2) >= this.divRect.segY.c2 ) ) {
							this.img.style.left = this.potentialRect.segX.c1 + 'px';//(parseInt(this.img.style.left) + delta[0]) + 'px';
							this.img.style.top = this.potentialRect.segY.c1 + 'px';//(parseInt(this.img.style.top) + delta[1]) + 'px';
							this.imgRect = this.potentialRect;
						//}
						
						

						this.fire('case:imageMovedPx',this.img.style.left,this.img.style.top,this.img.style.width,this.img.style.height);
						this.fire('case:imageMovedInt',parseInt(this.img.style.left),parseInt(this.img.style.top),parseInt(this.img.style.width),parseInt(this.img.style.height));
					}
					this.posClick[0] = e.xy[0]
					this.posClick[1] = e.xy[1]

				}.bind(this)

				addEventListener("mousemove", this.div.onmousemove )

				this.loadCase(true);

				//this.states.push({lastAction : 'init', rect : this.imgRect, left : this.img.style.left, top : this.img.style.top, width : this.img.style.width, height : this.img.style.height});	
				this.sState;
				this.eState;

				var handle = r.handle(this.img);
				handle.device.noRightClick = true;

				handle.drag({
            start : this.start.bind(this),
            drag : function (e) {
            	if(e.shiftKey || (e.scale && e.scale != 1)) {
            		this.zoomEvent(e);
            	} 
            	 this.drag(e);
            	}.bind(this),
            	end : function(e) {
            		this.states[this.states.length - 1].eState = {rect : jQuery.extend({},this.imgRect), left : this.img.style.left, top : this.img.style.top, width : this.img.style.width, height : this.img.style.height}
            		this.fire('caseAction',this.states.last());
            	}.bind(this)
          });

				if(this.factor && this.factor != 1) this.zoom(this.factor);

			}	
		},

		zoom : function (factor) {// Merci Geo !
			this.imgRect = this.imgRect.move({staticPoint : this.staticPoint, scale : factor});
			this.img.style.width = this.imgRect.segX.getLength() + 'px';
			this.img.style.height = this.imgRect.segY.getLength() + 'px';
			this.img.style.left =  this.imgRect.segX.c1 + 'px';
			this.img.style.top = this.imgRect.segY.c1 + 'px';

			if (!this.fit && !(this.imgRect.segX.c2 >= this.divRect.segX.c2 && this.imgRect.segX.c1 <= this.divRect.segX.c1 && this.imgRect.segY.c1 <= this.divRect.segY.c1 && this.imgRect.segY.c2 >= this.divRect.segY.c2)){
				var fitImg = this.divRect.move({staticPoint : this.staticPoint}).forcedIn(this.imgRect);
				
				 this.imgRect.segX.c1 = this.imgRect.segX.c1 - fitImg.segX.c1;
				 this.img.style.left =  this.imgRect.segX.c1 + 'px'; 
				 this.imgRect.segY.c1 = this.imgRect.segY.c1 - fitImg.segY.c1;
				 this.img.style.top =  this.imgRect.segY.c1 + 'px';
				 this.imgRect.segY.c2 = this.imgRect.segY.c1 + parseInt(this.img.style.height);
				 this.imgRect.segX.c2 = this.imgRect.segX.c1 + parseInt(this.img.style.width);
			}
			// WARNING : STATE SHOULD BE SAVED ELSEWHERE : WAY TOO MUCH VALUES	
			//this.states.push({lastAction : 'zoom', rect : this.imgRect, left : this.img.style.left, top : this.img.style.top, width : this.img.style.width, height : this.img.style.height});	
			
		},

		loadCase : function (firstLoad) {//methode permettant d'initialiser la position de l'image
			var loading = function () {
				if (this.pos) {
					this.ratio = parseInt(this.img.naturalHeight)/parseInt(this.img.naturalWidth);
					this.img.style.width = this.pos[2] + 'px';
					this.img.style.height = this.pos[3] + 'px';
					this.img.style.left = this.pos[0] + 'px';
					this.img.style.top = this.pos[1] + 'px';
				} else {
					this.img.style.height = this.img.naturalHeight + 'px';
					this.img.style.width = this.img.naturalWidth + 'px';
					this.img.style.left = 0 + 'px';
					this.img.style.top = 0 + 'px';
					this.ratio = parseInt(this.img.naturalHeight)/parseInt(this.img.naturalWidth);

					var height = parseInt(this.div.style.height);
					var width = parseInt(this.div.style.width);

					var ratioDiv = height/width;

					if (this.ratio > ratioDiv) {
						this.img.style.width = width  + 'px';
						this.img.style.height = width*this.ratio + 'px';
					}else {
						this.img.style.height = height + 'px';
						this.img.style.width = height/this.ratio + 'px';
					}
				}

				var imgX = parseInt(this.img.style.left);
				var imgY = parseInt(this.img.style.top);

				var segX = new r.Geo.Seg(imgX, imgX + parseInt(this.img.style.width));
				var segY = new r.Geo.Seg(imgY, imgY + parseInt(this.img.style.height));

				var segDivX = new r.Geo.Seg(0, width);
				var segDivY = new r.Geo.Seg(0, height);

				this.divRect = new r.Geo.Rect({ segX : segDivX, segY : segDivY });
				this.imgRect = new r.Geo.Rect({ segX : segX, segY : segY});
				this.fire('case:imageMovedInt',parseInt(this.img.style.left),parseInt(this.img.style.top),parseInt(this.img.style.width),parseInt(this.img.style.height));

			}.bind(this);

			if(!firstLoad) {
				loading();
			}
			else  onimagesload([this.img], loading); 

		},

		freeze : function () {
			this.frozen = true;
		},

		unfreeze : function () {
			this.frozen = false;
		},

		setColor : function(color) {
			this.txtBloc.children[0].children[0].children[0].style.color = color;
		},

		undo : function (state) {
			if(this.states[this.states.length - this.cancel - 1]){
				this.cancel++;
				this.imgRect = jQuery.extend({},this.states[this.states.length - this.cancel].sState.rect)
				this.img.style.left = this.states[this.states.length - this.cancel].sState.left;
				this.img.style.top = this.states[this.states.length -  this.cancel].sState.top;
				this.img.style.width = this.states[this.states.length - this.cancel].sState.width;
				this.img.style.height = this.states[this.states.length  - this.cancel].sState.height;
			}
		},

		redo : function (state) {
			if(this.states[this.states.length - this.cancel]){
				this.cancel--;
				this.imgRect = jQuery.extend({},this.states[this.states.length - 1 - this.cancel].eState.rect)
				this.img.style.left = this.states[this.states.length - 1 - this.cancel].eState.left;
				this.img.style.top = this.states[this.states.length - 1 - this.cancel].eState.top;
				this.img.style.width = this.states[this.states.length - 1 - this.cancel].eState.width;
				this.img.style.height = this.states[this.states.length - 1 - this.cancel].eState.height;
			}
		},

		setState : function (state) {
				this.imgRect = jQuery.extend({},state.rect)
				this.img.style.left = state.left;
				this.img.style.top = state.top;
				this.img.style.width = state.width;
				this.img.style.height = state.height;
		}
	})
})