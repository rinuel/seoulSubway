var JDSubway = (function(){

  	// Properties
  	///////////////////////////
  	var screenWidth = window.screen.width ;
  	var screenHeight = window.screen.height ;
  	var nodeRadius = 5;
  	var cursorFlag = true;
  	//링크 라인 path 생성 함수
  	var linkLine = d3.svg.line().interpolate('linear')
					.x(function(d){return d.x; })
					.y(function(d){return d.y; });
	//context Menu List;
	var menu = [
		{
			title: 'item #1',
			action : function(elm,d,i){
				d3.inputBox().open();
			}
		},
		{
			title : 'itme #2',
			action : function(elm,d,i){
				console.log('item2 click');
			}
		}
	];
	//라인 가중치 가중치 크기에따라 맨위로 올라오는 요소가 달라짐
	var WEIGHT = {
		node : 2,
		link : 1,
		vertex : 3,
	}
	//노드 데이터 객체
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
   	//링크 데이터 객체
  	var _link = function(node1,node2){
  		this.uid = 0;
  		this.node1 = node1;
  		this.node2 = node2;
  		this.vertex = [];
  		this.type = 'link';
  		this.getPoints = function(){
  			var points = [];
  			//첫째노드 포인트.
  			points.push({x:this.node1.datum().x,y:this.node1.datum().y});
  			//버텍스 포인트 들.
  			this.vertex.forEach(function(v,i,a){
  				points.push({x:v.datum().x , y:v.datum().y});
  			});
  			//목적노드 포인트.
  			points.push({x:this.node2.datum().x,y:this.node2.datum().y});
  			return points;	
  		};
  	}
  	//버텍스 데이터 객체
  	var _vertex = function(x,y){
  		this.uid = 0;
  		this.x = x;
  		this.y = y;
  		this.type = 'vertex';
  	}
  
  	// Private Methods
  	///////////////////////////
  	//10이하 수 반올림 함수.
  	var div10 = function(number){
  		return d3.round(number,-1);
  	}
  	//x,y 좌표를 translate 스트링으로 바꾸어주는 함수.
  	var PTS = function(_x,_y){
  		return 'translate('+_x+','+_y+')';
  	}
  	// Public Methods
  	///////////////////////////
  
  	/*
   	* An example public method.
   	*/
  	var publicMethod = function () {};
  	//에디터 클래스.
  	var Editor = function(selector){
  		var zoom = d3.behavior.zoom().scaleExtent([1,10]).on('zoom',zoomed);
  		var svg = d3.select(selector).append('svg').attr('width',screenWidth).attr('height',screenHeight).append('g');//.call(zoom);
  		var board = svg.append('g');
  		var cursor = board.append('rect').attr('width',10).attr('height',10).attr('class','cursor');
   		drawCheckerBoard(board);

   		document.addEventListener('keydown',KeyEvt);
   		document.addEventListener('keyup',KeyEvt);

   		/*********** Draw Function *************/
   		//체커보드(바둑판) 그려주는 함수.
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
	  	//노드 그려주는 함수. 
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
		//링크 그려주는 함수.
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
		  						return linkLine(d.getPoints());
		  					})
		  					.attr('class','link')
		  					.call(linkEvt);
	  		}else{
	  			alert('두개 이상의 노드를 선택해주세요');
	  		}
	  		reSorting();
	  	}
	  	//버텍스 그려주는 함수.
	  	function drawVertex(){
			console.log('drawVertexNode');
			var link = d3.select('.link.selected');

			if(link.empty()){
				alert('선택된 링크가 없습니다.');
				return false;
			}
			var points = link.datum().getPoints();
			var addSize = 0;
			var max = 0;
			for(var i = 0, max = points.length ; i < max-1 ; i++){
				var x = (points[i].x + points[i+1].x)/2; 
				var y = (points[i].y + points[i+1].y)/2;
				var vertex = new _vertex(x,y);

				var vertexCircle = board.selectAll('vertex')
					.data([vertex])
					.enter()
					.append('circle')
					.attr('class','vertex')
					.attr('cx',function(d){return d.x;})
					.attr('cy',function(d){return d.y;})
					.attr('r',nodeRadius)
					.call(vertexEvt);

				link.datum().vertex.splice((i+addSize),0,vertexCircle);
				addSize++;
			}
	  	}
	  	//커서 그리는 함수.
	  	function drawCursor(x,y,width,height){
	  		x = (x || cursor.attr('x')) - nodeRadius;
			y = (y || cursor.attr('y')) - nodeRadius;
			width = (width || cursor.attr('width')) + nodeRadius * 2;
			height = (height || cursor.attr('height')) + nodeRadius * 2;
	  		if(cursorFlag){
	  			cursor.attr('x',x).attr('y',y).attr('width',width).attr('height',height);
	  		}
	  	}
	  	//svg요소 재정렬 해주는 함수.
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
	  	//************* Event Listener *****************
	  	//체커보드 이벤트 리스너
	  	function checkerEvt(selection){
	  		selection.on('mousedown.checkerBoard',function(e){
	  			var point = d3.mouse(board.node());
	  			drawNode(point[0],point[1]);
	  		});
	  		selection.on('mousemove.checkerBoard',function(e){
	  			console.log('mousemove');
	  			var point = d3.mouse(board.node());
	  			drawCursor(div10(point[0])-nodeRadius,div10(point[1])-nodeRadius,
	  				10,10);
	  		});
	  	}
	  	//노드 이벤트 리스너
	  	function nodeEvt(selection){
	  		//마우스 오버 이벤트
	  		selection.on('mouseover.node',function(e){
	  			var target = d3.select(this);
	  			//커서 그리기ㅣ
	  			drawCursor(target.datum().x - nodeRadius,target.datum().y - nodeRadius,
	  				nodeRadius * 2,nodeRadius * 2);
	  		});
	  		//컨텍스트 메뉴이벤트
	  		selection.on('contextmenu',d3.contextMenu(menu));
	  		//드래그 설정.
	  		selection.call(d3.behavior.drag().origin(function(d){return d;})
					.on('dragstart',function(){
						d3.select('.node.preSelected').classed('preSelected',false);
						d3.select('.node.selected').classed('preSelected',true);
						d3.select('.selected').classed('selected',false);
						d3.select(this).classed('selected',true);
						d3.selectAll('.vertex').classed('hide',true);
					})
					.on('drag',function(){
						var point = d3.mouse(board.node());
						d3.select(this).attr('transform',function(d){
							d.x = div10(point[0]); d.y = div10(point[1]);
							return PTS(d.x,d.y);
						});
						d3.selectAll('.link').attr('d',function(d){
							return linkLine(d.getPoints());
						});
					}).on('dragend',function(){console.log('dragend');})
			);
			//툴팁 설정
			selection.call(d3.helper.tooltip().style({color:'blue'}).text(function(d){
				return d.x+','+d.y;
			}));
	  	}
	  	//링크 이벤트 리스너
	  	function linkEvt(selection){
	  		selection.on('mousedown.link',function(e){
	  			var target = d3.select(this);
	  			//링크 클래스 수정
	  			d3.select('.selected').classed('selected',false);
	  			d3.select('.preSelected').classed('preSelected',false);
	  			target.classed('selected',true);
	  			//버텍스 클래스 수정
	  			d3.selectAll('.vertex').classed('hide',true);
	  			target.datum().vertex.forEach(function(v,i,a){
	  				v.classed('hide',false);
	  			});
	  		});
	  		selection.on('contextmenu',function(da,ab){
	  			console.log(da);
	  			console.log(ab);
	  		});
	  		selection.on('mouseover.link',function(e){
	  			var target = d3.select(this);
	  			var points = target.datum().getPoints();
	  			var xMax = d3.max(points,function(d){return d.x;});
	  			var yMax = d3.max(points,function(d){return d.y;});
	  			var xMin = d3.min(points,function(d){return d.x;});
	  			var yMin = d3.min(points,function(d){return d.y;});
	  			drawCursor(xMax - xMin > 0 ? xMin : xMin-10,
	  					   yMax - yMin > 0 ? yMin : yMin-10,
	  					   xMax - xMin > 0 ? xMax-xMin : 20,
	  					   yMax - yMin > 0 ? yMax-yMin : 20);
	  		});
	  	}
	  	//버텍스 이벤트 리스너
	  	function vertexEvt(selection){
	  		selection.on('mouseover.node',function(e){
	  			var target = d3.select(this);
	  			//커서 그리기ㅣ
	  			drawCursor(target.datum().x - nodeRadius,target.datum().y - nodeRadius,
	  				nodeRadius * 2,nodeRadius * 2);
	  		});
	  		//드래그 설정.
	  		selection.call(d3.behavior.drag().origin(function(d){return d;})
					.on('dragstart',function(){
						d3.event.sourceEvent.stopPropagation();
						var target = d3.select(this);
						cursor.classed('hide',true);
			  	// 		d3.select('.selected').classed('selected',false);
			  	// 		d3.select('.preSelected').classed('preSelected',false);
						// target.classed('selected',true);
					})
					.on('drag',function(){
						d3.event.sourceEvent.stopPropagation();
						var point = d3.mouse(board.node());
						d3.select(this).attr('cx',function(d){return d.x = point[0];})
									   .attr('cy',function(d){return d.y = point[1];});
						d3.selectAll('.link').attr('d',function(d){
							return linkLine(d.getPoints());
						});

					}).on('dragend',function(){
						cursor.classed('hide',false);
					})
			);
	  	}
	  	//모든 키이벤트 처리 리스너
	  	function KeyEvt(e){
	  		var keyCode = e.keyCode;
	  		console.log(keyCode);
	  		if(e.type === 'keydown'){
	  			if(keyCode === 76){ // 'l' key
	  				drawLink();
	  			}else if(keyCode === 86){
	  				drawVertex();
	  			}
  			}else if(e.type === 'keyup'){

  			}
	  	}
	  	//줌 처리 리스너
	  	function zoomed(){
	  		board.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	  	}
  	}
  	// Init
  	///////////////////////////

	return {
		Editor : Editor
	}
})();
(function(root, factory){
	if (typeof module === 'object' && module.exports) {
		module.exports = function(d3) {
			d3.inputBox = factory(d3);
			return d3.inputBox;
		};
	} else {
		root.d3.inputBox = factory(root.d3);
	}

})(this,function(d3){
	return function(menu,opts){
  		var inputBox = d3.selectAll('.inputBox').data([1]).enter().append('div')
  		  .attr('class','inputBox').style('display','none');
  		inputBox.text('acvbcvbxcvbxcvb');

  		return {
  			open : function(){
  		  		inputBox.style('display','block')
  		  				.style('left',d3.event.pageX+'px')
  		  				.style('top',d3.event.pageY+'px');
  		  	}
  		}
	}
});
//contextMenu
//@author patorjk
//@site https://github.com/patorjk/d3-context-menu
(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = function(d3) {
			d3.contextMenu = factory(d3);
			return d3.contextMenu;
		};
	} else {
		root.d3.contextMenu = factory(root.d3);
	}
}(	this, 
	function(d3) {
		return function (menu, opts) {

			var openCallback,
				closeCallback;

			if (typeof opts === 'function') {
				openCallback = opts;
			} else {
				opts = opts || {};
				openCallback = opts.onOpen;
				closeCallback = opts.onClose;
			}

			// create the div element that will hold the context menu
			d3.selectAll('.d3-context-menu').data([1])
				.enter()
				.append('div')
				.attr('class', 'd3-context-menu');

			// close menu
			d3.select('body').on('click.d3-context-menu', function() {
				d3.select('.d3-context-menu').style('display', 'none');
				if (closeCallback) {
					closeCallback();
				}
			});

			// this gets executed when a contextmenu event occurs
			return function(data, index) {
				var elm = this;

				d3.selectAll('.d3-context-menu').html('');
				var list = d3.selectAll('.d3-context-menu').append('ul');
				list.selectAll('li').data(typeof menu === 'function' ? menu(data) : menu).enter()
					.append('li')
					.html(function(d) {
						return (typeof d.title === 'string') ? d.title : d.title(data);
					})
					.on('click', function(d, i) {
						d.action(elm, data, index);
						d3.select('.d3-context-menu').style('display', 'none');

						if (closeCallback) {
							closeCallback();
						}
					});

				// the openCallback allows an action to fire before the menu is displayed
				// an example usage would be closing a tooltip
				if (openCallback) {
					if (openCallback(data, index) === false) {
						return;
					}
				}

				// display context menu
				d3.select('.d3-context-menu')
					.style('left', (d3.event.pageX - 2) + 'px')
					.style('top', (d3.event.pageY - 2) + 'px')
					.style('display', 'block');

				d3.event.preventDefault();
				d3.event.stopPropagation();
			};
		};
	}
));
