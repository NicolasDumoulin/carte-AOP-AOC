/* 
 *	
 * 	Purpose: extends OpenLayers API (toolTips)
 * 		Add New Control ToolTips
 *  Author:  Van De Casteele Arnaud
 *  Contact : arnaud . sig at gmail . com
 * 
 *	Date:   December 2008
 *	Version: 0.3
 *	** Improve the position of the tooltips depends of
 *	   the position on the object in the div Map
*	** Add 3D style 
 *	   
 *
 */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Utils.js
 */

/** 
 * Exemple of use :			
 *
 *	ttips = new OpenLayers.Control.ToolTips({shadow:true}); 
 *	map.addControl(ttips);	
 *	markers = new OpenLayers.Layer.Markers('Marker');
 *	map.addLayer(markers);
 *	map.setCenter(new OpenLayers.LonLat(18.632,14.414));
 *	markers.events.register("mouseover", markers, toolTipsOver);
 *    markers.events.register("mouseout", markers, toolTipsOut); 
 *
 *	function toolTipsOver(e) {
 *            ttips.show({html:"My first ToolTips"});
 *   }
 *
 *   function toolTipsOut(e){
 *          ttips.hide();
 *   } 
 */

/**
 * Class: OpenLayers.Control.MousePosition
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ToolTips = OpenLayers.Class(OpenLayers.Control, {

   /**
     * Property: element
     * {DOMElement} The DOM element that contains the toolTips Element
     */
    element: null,

    /** 
     * Property: text color
	  * Can be a text as black or hexadecimal color as #000000
     * {String} 
     */
    textColor: "black",

		/** 
     * Property: bold text
     * {boolean}
     */
	bold : false,

   /** 
     * Property: Opacity between 0 to 1
     * {float}
     */
	opacity : 1,
    
    /** 
     * Property: background color
	  * Can be a text as white or hexadecimal color as #FFFFFF
     * {String}
     */
    bgColor: "#FFFFFF",
    
    /** 
     * Property: Padding of the div
     * {String}
     */
    paddingValue : "2px",
 
    /** 
     * Property: lastXy
     * {<OpenLayers.LonLat>}
     */
    lastXy: null,

 		/** 
     * Property: html
		 * Text in the tooltips
     * {string}
     */
	html : "some text",

		/** 
     * Property: evt
     * evt obj
     */
	evt : null,

		/** 
     * Property: roundedCorner
		 * {boolean}
     */
	roundedCorner : false,

		/** 
     * Property: shwadow
		 * {boolean}
     */
	shadow : false,
    
    /**
     * Constructor: OpenLayers.Control.MousePosition
     * 
     * Parameters:
     * options - {DOMElement} Options for control.
     */
    initialize: function(options) {
		  //Extend with new arguments 
		  	var newArguments = [];
        OpenLayers.Util.extend(this, options);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: destroy
     */
     destroy: function() {
         if (this.map) {
             this.map.events.unregister('mousemove', this, this.redraw);
         }
				 this.bgTtips.parentNode.removeChild(this.bgTtips);
				 this.spanTx.parentNode.removeChild(this.bgTtips);
         OpenLayers.Control.prototype.destroy.apply(this, arguments);
     },	

    /**
     * Method: draw
     * Used with the mapadd.Control
     * {DOMElement}
     */    
    draw: function() {
		OpenLayers.Control.prototype.draw.apply(this, arguments);
		//DivBacground	
		//id, px, sz, imgURL, position, border, overflow, opacity
		this.bgTtips = OpenLayers.Util.createDiv(				 
			 "divBgTtips",
			 	null, null, null, 
     			"absolute", 
				null,
     			"hidden",
				this.opacity);
		this.bgText = document.createElement("div");
		this.bgTtips.style.zIndex = "999";
		if(this.bold){this.bgText.style.fontWeight="bold"};	
		this.bgTtips.style.padding = "2px 5px 2px 5px";
		this.bgTtips.style.backgroundColor = this.bgColor;		
		
		//Span that will contain the Text	
		//id, px, sz, imgURL, position, border, overflow, opacity
		this.spanTx = OpenLayers.Util.createDiv(				 
			 	"spanTx",
			 	null, null, null, 
     			"absolute", 
				null,
     			"hidden",
				1);
		this.spanTx.style.color = this.textColor;			
		this.spanTx.style.zIndex = "1000";
		this.spanTx.style.padding = "2px 5px 2px 5px";
		this.spanTx.style.border = "1px #C7C7C7 double";	
		this.spanTx.style.backgroundColor=this.bgColor;		

		if(this.bold){this.spanTx.style.fontWeight="bold"}	
		//Special style for shadow properties
		if(this.shadow){
				this.bgTtips.style.backgroundColor="#6D6D6D";					
				this.bgTtips.style.opacity=0.5;
				this.spanTx.style.opacity=1;
		};
		//AppendChild 
		document.getElementById("map").appendChild(this.spanTx);
		document.getElementById("map").appendChild(this.bgTtips);
		document.getElementById(this.bgTtips.id).appendChild(this.bgText);
		this.spanTx.style.display = "none";		
		this.bgTtips.style.display = "none";		
		//Position of the map	
		this.marginPos = this.findXYMap(document.getElementById(this.map.div.id));			
		this.map.events.register('mousemove', this, this.redraw);
    },

	/**
     * Method: show
	 * Show the tooltips on the map
     */ 
	show : function(valueHTML){
		this.redraw(this.pos);
		this.spanTx.innerHTML = valueHTML.html;
		this.bgText.innerHTML = valueHTML.html;
		this.bgText.style.visibility = "hidden";
		this.spanTx.style.display = "block";
		this.bgTtips.style.display = "block";
	},

	/**
     * Method: hide
	 * hide the tooltips on the map   
     */ 
	hide : function(){
		this.spanTx.style.display = "none";		
		this.bgTtips.style.display = "none";			
	},

	/**
     * Method: findXYmap
	 * To Know the position XY of the map in the HTML  
     */ 
	findXYMap : function(oDiv){			 
		 var x=0,y=0,w=0;
		 while (oDiv!=null){
			 x+= oDiv.offsetLeft-oDiv.scrollLeft;
			 y+= oDiv.offsetTop-oDiv.scrollTop;				 					
			 oDiv = oDiv.offsetParent;
		 }
				 return {x:x,y:y};
	},	

 	/**
     * Method: calculPosition
	 * Calcul the best position for the Ttips
     */ 
	calculPosition : function(evt){
		var position=null;
		var mapSizeW = document.getElementById(this.map.div.id).offsetWidth+this.marginPos.x;
		var mapSizeH = document.getElementById(this.map.div.id).offsetHeight+this.marginPos.y;
		var posTtipsW = document.getElementById(this.bgTtips.id).offsetWidth+this.marginPos.x+evt.xy.x+8;	
		var posTtipsH = document.getElementById(this.bgTtips.id).offsetHeight+this.marginPos.y+evt.xy.y+8;	
		if(posTtipsW < mapSizeW && posTtipsH < mapSizeH){
			position = "BL";
		}else if(posTtipsW > mapSizeW && posTtipsH < mapSizeH ){
			position = "BR";
		}else if(posTtipsW < mapSizeW && posTtipsH > mapSizeH){
			position = "TR";
		}else if(posTtipsW > mapSizeW && posTtipsH > mapSizeH){
			position = "TL";
		}
		return(position)
	},   
	
	/**
     * Method: setPosition
	 * Return the position of the Ttips
     */ 
	setPosition : function(evt,posTtips,mapSize){		
		var position = this.calculPosition(evt);					
		switch(position){
			case "BL" :
				//Text
				this.spanTx.style.left = ((evt.xy.x+this.marginPos.x)+12)+"px";
				this.spanTx.style.top = ((evt.xy.y+this.marginPos.y)-18)+"px";
				//Bg
				if(!this.shadow){
					this.bgTtips.style.left = ((evt.xy.x+this.marginPos.x)+12)+"px";
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)-18)+"px";					
				}
				else{
					this.bgTtips.style.left = ((evt.xy.x+this.marginPos.x)+20)+"px";
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)-10)+"px";
				}				
				break;

			case "BR" :
				//Text				
				this.spanTx.style.left =((evt.xy.x+this.marginPos.x)-22-document.getElementById(this.spanTx.id).offsetWidth)+"px"; 
				this.spanTx.style.top = ((evt.xy.y+this.marginPos.y)-18)+"px";	
				//Bg				
				if(!this.shadow){
					this.bgTtips.style.left = ((evt.xy.x+this.marginPos.x)-22-document.getElementById(this.spanTx.id).offsetWidth)+"px"; 
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)-18)+"px";
				}
				else{
					this.bgTtips.style.left = ((evt.xy.x+this.marginPos.x)-14-document.getElementById(this.spanTx.id).offsetWidth)+"px"; 
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)-10)+"px";
				}
				break;

			case "TR" :
				//Text
				this.spanTx.style.left = ((evt.xy.x+this.marginPos.x)+12)+"px";
				this.spanTx.style.top = ((evt.xy.y+this.marginPos.y)-document.getElementById(this.spanTx.id).offsetHeight)+"px";
				//Bg
				if(!this.shadow){
					this.bgTtips.style.left = ((evt.xy.x+this.marginPos.x)+12)+"px";
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)-document.getElementById(this.spanTx.id).offsetHeight)+"px";
				}
				else{
					this.bgTtips.style.left = ((evt.xy.x+this.marginPos.x)+20)+"px";
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)+8-document.getElementById(this.spanTx.id).offsetHeight)+"px";
				}				
				break;

			case "TL" :
				//Text
				this.spanTx.style.left =((evt.xy.x+this.marginPos.x)-22-document.getElementById(this.spanTx.id).offsetWidth)+"px"; 
				this.spanTx.style.top = ((evt.xy.y+this.marginPos.y)-document.getElementById(this.spanTx.id).offsetHeight)+"px";
				//Bg
				if(!this.shadow){
					this.bgTtips.style.left =((evt.xy.x+this.marginPos.x)-22-document.getElementById(this.spanTx.id).offsetWidth)+"px";  
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)-document.getElementById(this.spanTx.id).offsetHeight)+"px";
				}
				else{
					this.bgTtips.style.left =((evt.xy.x+this.marginPos.x)-14-document.getElementById(this.spanTx.id).offsetWidth)+"px";  
					this.bgTtips.style.top = ((evt.xy.y+this.marginPos.y)+8-document.getElementById(this.spanTx.id).offsetHeight)+"px";
				}				
				break;
		}//End if switch			
	},

	/**
 	 * Method: redraw
	 * Method called during a mousemove
 	*/ 
	redraw: function(evt) {
		this.pos = evt;			
		this.setPosition(this.pos);				
	},
    CLASS_NAME: "OpenLayers.Control.ToolTips"
});
