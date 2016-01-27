var JDSubway = (function(){

  	// Properties
  	///////////////////////////
  	var screenWidth = window.screen.width ;
  	var screenHeight = window.screen.height ;
  	var nodeRadius = 5;
	var linkLine = d3.svg.line().interpolate('linear')
					.x(function(d){	return d.datum().x;	})
					.y(function(d){	return d.datum().y; });
	var WEIGHT = {
		node : 2,
		link : 1,
		vertex : 3,
	}

  	var _node = function(x,y){
  		this.uid = 0;
  		this.x = x;
  		this.y = y;
  		this.info = {};
  		this.type = 'node',
  		this.textInfo = {
  			x : 0,
  			y : 0,
  			anchor : 'middle',
  			rotate : 0,
  			text : 'empty'
  		};
   	}
  	var _link = function(node1,node2){
  		this.uid = 0;
  		this.node1 = node1;
  		this.node2 = node2;
  		this.vertex = null;
  		this.type = 'link';
  	}
  	var _vertex = function(){
  		this.uid = 0;
  		this.points = [];
  		this.type = 'vertex';
  	}
  
  	// Private Methods
  	///////////////////////////
  	var div10 = function(number){
  		return d3.round(number,-1);
  	}
  	var PTS = function(_x,_y){
  		return 'translate('+_x+','+_y+')';
  	}
  	// Public Methods
  	///////////////////////////
  
  	/*
   	* An example public method.
   	*/
  	var publicMethod = function () {};
  	var Editor = function(selector){
  		var zoom = d3.behavior.zoom().scaleExtent([1,10]).on('zoom',zoomed);
  		var svg = d3.select(selector).append('svg').attr('width',screenWidth).attr('height',screenHeight).append('g');//.call(zoom);
  		var board = svg.append('g');
  		var cursor = board.append('rect').attr('class','cursor');
   		drawCheckerBoard(board);

   		document.addEventListener('keydown',KeyEvt);
   		document.addEventListener('keyup',KeyEvt);

   		/*********** Draw Function *************/
	  	function drawCheckerBoard(container){ 		
			container.selectAll('line1')
				.data(d3.range(0,screenHeight,10))
				.enter()
				.append('line')
				.attr('x1',0)
				.attr('y1',function(d){return d;})
				.attr('x2',screenWidth)
				.attr('y2',function(d){return d;})
				.attr('class','checkerLine');

			container.selectAll('line2')
				.data(d3.range(0,screenWidth,10))
				.enter()
				.append('line')
				.attr('x1',function(d){return d;})
				.attr('y1',0)
				.attr('x2',function(d){return d;})
				.attr('y2',screenHeight)
				.attr('class','checkerLine');

			container.append('rect')
				.attr('class','backRect')
				.attr('width',screenWidth)
				.attr('height',screenHeight)
				.attr('fill','transparent')
				.call(checkerEvt);
	  	}
	  	function drawNode(x,y){
	  		var node = new _node(div10(x),div10(y));
	  		var el = board.selectAll('node')
	  					.data([node])
	  					.enter()
	  					.append('g')
	  					.attr('transform',function(d){
	  						return PTS(d.x,d.y);
	  					})
	  					.attr('class','node')
	  					.call(nodeEvt)
	  					.append('circle')
	  					.attr('r',nodeRadius);
		  	reSorting();
		}
	  	function drawLink(){

	  		var node1 = d3.select('.node.selected');
	  		var node2 = d3.select('.node.preSelected');
	  		if(!node1.empty() && !node2.empty()){
		  		var link = new _link(node1,node2);
		  		var el = board.selectAll('link')
		  					.data([link])
		  					.enter()
		  					.append('path')
		  					.attr('d',function(d){
		  						return linkLine([d.node1,d.node2]);
		  					})
		  					.attr('class','link')
		  					.call(linkEvt);
	  		}else{
	  			alert('두개 이상의 노드를 선택해주세요');
	  		}
	  		reSorting();
	  	}
	  	function drawVertex(){}
		function reSorting(){
			d3.selectAll('.node,.link,.vertex').sort(function(a,b){
				if(WEIGHT[a.type] > WEIGHT[b.type]){
					return 1;
				}else if(WEIGHT[a.type] < WEIGHT[b.type]){
					return -1;
				}else{
					return 0;
				}
			});
		}
	  	//************* Event Listener *****************?
	  	function checkerEvt(selection){
	  		selection.on('mousedown.checkerBoard',function(e){
	  			var point = d3.mouse(board.node());
	  			drawNode(point[0],point[1]);
	  		});
	  		selection.on('mousemove.checkerBoard',function(e){
	  			var point = d3.mouse(board.node());
	  			cursor.attr('x',div10(point[0])-nodeRadius)
	  				  .attr('y',div10(point[1])-nodeRadius);
	  		});
	  	}
	  	function nodeEvt(selection){
	  		selection.on('mouseover.node',function(e){
	  			var target = d3.select(this);
	  			cursor.attr('x',target.datum().x - nodeRadius)
	  				  .attr('y',target.datum().y - nodeRadius)
	  				  .attr('width',nodeRadius * 2)
	  				  .attr('height',nodeRadius * 2);
	  		});

	  		selection.call(d3.behavior.drag().origin(function(d){return d;})
					.on('dragstart',function(){
						d3.select('.node.preSelected').classed('preSelected',false);
						d3.select('.node.selected').classed('preSelected',true);
						d3.select('.selected').classed('selected',false);
						d3.select(this).classed('selected',true);
					})
					.on('drag',function(){
						var point = d3.mouse(board.node());
						d3.select(this).attr('transform',function(d){
							d.x = div10(point[0]); d.y = div10(point[1]);
							return PTS(d.x,d.y);
						});
						d3.selectAll('.link').attr('d',function(d){
							return linkLine([d.node1,d.node2]);
						});
					})
					.on('dragend',function(){console.log('dragend');})
			);
	  	}
	  	function linkEvt(selection){
	  		selection.on('mousedown.link',function(e){
	  			var target = d3.select(this);
	  			d3.select('.selected').classed('selected',false);
	  			d3.select('.preSelected').classed('preSelected',false);
	  			target.classed('selected',true);
	  		});
	  		// selection.on('mouseover.link',function(e){
	  		// 	var target = d3.select(this);
	  		// 	cursor.attr('x',target.datum().x - nodeRadius)
	  		// 		  .attr('y',target.datum().y - nodeRadius)
	  		// 		  .attr('width',nodeRadius * 2)
	  		// 		  .attr('height',nodeRadius * 2);
	  		// });
	  	}
	  	function KeyEvt(e){
	  		var keyCode = e.keyCode;
	  		console.log(keyCode);
	  		if(e.type === 'keydown'){
	  			if(keyCode === 76){ // 'l' key
	  				drawLink();
	  			}
  			}else if(e.type === 'keyup'){

  			}
	  	}
	  	function zoomed(){
	  		board.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	  	}
	  	/****************** MakeFunction *********************/
  	}
  	// Init
  	///////////////////////////

	return {
		Editor : Editor
	}
})();