var JDSubway = (function(){

  	// Properties
  	///////////////////////////
  	var screenWidth = window.screen.width ;
  	var screenHeight = window.screen.height ;
  	var nodeRadius = 5;
  	var cursorFlag = true;
  	var lineWidth = 20;
  	//링크 라인 path 생성 함수
  	var linkLine = d3.svg.line().interpolate('basis')
					.x(function(d){return d.x; })
					.y(function(d){return d.y; });
	var lineColorDic = {
		1 : '#2980B9',
		2 : '#27AE60',
		3 : '#E67E22',
		4 : '#3498DB',
		5 : '#8E44AD',
		6 : '#D35400',
		7 : '#C0392B',
		8 : '#E74C3C',
	};

	//라인 가중치 가중치 크기에따라 맨위로 올라오는 요소가 달라짐
	var WEIGHT = {
		node : 2,
		link : 1,
		vertex : 3,
		cursor : 4,
	};
	//노드 데이터 객체
  	var _node = function(param){
  		var maxUid = d3.max(d3.selectAll('.node')[0],function(d){
  			return d3.select(d).datum().uid;
  		});

  		this.uid = param.uid === undefined ? ++maxUid || 0: param.uid;
  		this.id = param.id === undefined ? 0 : param.id;
  		this.x = param.x === undefined ? x : param.x;
  		this.y = param.y === undefined ? y : param.y;
  		this.info = param.info || {};
  		this.type = param.type || 'node';
  		this.link = param.link || [];
  		this.textInfo = param.textInfo || {
  			x : 0,
  			y : -10,
  			anchor : 'middle',
  			rotate : 0,
  			text : 'empty',
  			textSize : 15,
  		};
  		this.delete = function(){
  			d3.select('#node'+this.uid).remove();
  			this.link.forEach(function(v,i,a){
  				var target = d3.select('.link#link'+v);
  				target.datum().delete();
  			});
  		};
   	}
   	//링크 데이터 객체
  	var _link = function(param){
  		var maxUid = d3.max(d3.selectAll('.link')[0],function(d){
  			return d3.select(d).datum().uid;
  		});

  		this.uid = param.uid === undefined ? ++maxUid || 0 : param.uid;
  		this.node1 = param.node1 === undefined ? '' : param.node1;
  		this.node2 = param.node2 === undefined ? '' : param.node2;
  		this.vertex = param.vertex || [];
  		this.lineNo = param.lineNo || 1;
  		this.type = param.type || 'link';

  		this.getPoints = function(){
  			var points = [];
  			//첫째노드 포인트.
  			var point = d3.select('.node#node'+this.node1);
  			console.log('.node#node'+this.node1);
  			points.push({x:point.datum().x,y:point.datum().y});
  			//버텍스 포인트 들.
  			this.vertex.forEach(function(v,i,a){
  				point = d3.select('.vertex#vertex'+v)
  				points.push({x:point.datum().x , y:point.datum().y});
  			});
  			//목적노드 포인트.
  			point = d3.select('.node#node'+this.node2);
  			points.push({x:point.datum().x,y:point.datum().y});
  			return points;	
  		};
  		this.delete = function(){
  			d3.select('#link'+this.uid).remove();
  			this.vertex.forEach(function(v,i,a){
  				var target = d3.select('.vertex#vertex'+v);
  				target.datum().delete();
  			});
  		};
  	}
  	//버텍스 데이터 객체
  	var _vertex = function(param){
  		var maxUid = d3.max(d3.selectAll('.vertex')[0],function(d){
  			return d3.select(d).datum().uid;
  		});

  		this.uid = param.uid === undefined ? ++maxUid || 0 : param.uid;
  		this.x = param.x === undefined ? x : param.x;
  		this.y = param.y === undefined ? y : param.y;
  		this.type = param.type || 'vertex';
  		this.delete = function(){
  			d3.select('#vertex'+this.uid).remove();
  		}
  	}
  	// Private Methods
  	///////////////////////////
  	//10이하 수 반올림 함수.
  	var div10 = function(number){
  		return d3.round(number / lineWidth,0) * lineWidth;
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
  		var cursor_x = board.append('line').attr('stroke','black').attr('stroke-width',2).attr('class','cursor_x');
  		var cursor_y = board.append('line').attr('stroke','black').attr('stroke-width',2).attr('class','cursor_y');
   		drawCheckerBoard(board);

   		document.addEventListener('keydown',KeyEvt);
   		document.addEventListener('keyup',KeyEvt);
   		/**************  private function ***********************/


   		/*********** Draw Function *************/
   		//체커보드(바둑판) 그려주는 함수.
	  	function drawCheckerBoard(container){ 		
			container.selectAll('line1')
				.data(d3.range(0,screenHeight,lineWidth))
				.enter()
				.append('line')
				.attr('x1',0)
				.attr('y1',function(d){return d;})
				.attr('x2',screenWidth)
				.attr('y2',function(d){return d;})
				.attr('class','checkerLine');

			container.selectAll('line2')
				.data(d3.range(0,screenWidth,lineWidth))
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
	  	function drawNode(node){
	  		var el = board.selectAll('node')
	  					.data([node])
	  					.enter()
	  					.append('g')
	  					.attr('transform',function(d){
	  						return PTS(d.x,d.y);
	  					})
	  					.attr('class','node')
	  					.attr('id',function(d){return 'node'+d.uid})
	  					.call(nodeEvt);
	  		el.append('circle').attr('class','subway').attr('r',nodeRadius);
	  		el.append('text').attr('class','nodeName')
	  						.attr('x',function(d){ return d.textInfo.x;})
	  						.attr('y',function(d){ return d.textInfo.y;})
	  						.style('font-size',function(d){return d.textInfo.textSize+'px';})
				        	.attr('text-anchor',function(d){return d.textInfo.anchor || 'middle';})
				        	.attr('transform',function(d){return 'rotate('+(d.textInfo.rotate || 0)+')';})
	  						.text(function(d){return d.textInfo.text;});
		  	reSorting();

		  	return el;
		}
		//링크 그려주는 함수.
	  	function drawLink(link){
	  		var link = link;

	  		var el = board.selectAll('link')
	  					.data([link])
	  					.enter()
	  					.append('path')
	  					.attr('d',function(d){
	  						return linkLine(d.getPoints());
	  					})
	  					.style('stroke',function(d){return lineColorDic[d.lineNo]; })
	  					.attr('class','link')
	  					.attr('id',function(d){return 'link'+d.uid;})
	  					.call(linkEvt);
	  		reSorting();
	  		return el;
	  	}
	  	//버텍스 그려주는 함수.
	  	function drawVertex(vertex){
	  		var vertex = vertex;
			var vertexCircle = board.selectAll('vertex')
				.data([vertex])
				.enter()
				.append('circle')
				.attr('class','vertex')
				.attr('id',function(d){return 'vertex'+d.uid;})
				.attr('cx',function(d){return d.x;})
				.attr('cy',function(d){return d.y;})
				.attr('r',nodeRadius)
				.call(vertexEvt);

			reSorting();

			return vertexCircle;
	  	}
	  	//커서 그리는 함수.
	  	function drawCursor(x,y,width,height,crossFlag){
	  		x = (x || cursor.attr('x')) - nodeRadius;
			y = (y || cursor.attr('y')) - nodeRadius;
			width = (width || cursor.attr('width')) + nodeRadius * 2;
			height = (height || cursor.attr('height')) + nodeRadius * 2;
	  		if(cursorFlag){
	  			//rect
	  			cursor.attr('x',x).attr('y',y).attr('width',width).attr('height',height);
	  			if(crossFlag){
	  				cursor_x.classed('hide',false);
	  				cursor_y.classed('hide',false);
	  			//x좌표
	  			cursor_x
	  				.attr('x1',0)
	  				.attr('y1',y + nodeRadius*2)
	  				.attr('x2',screenWidth)
	  				.attr('y2',y + nodeRadius*2);
	  			//y좌표
	  			cursor_y
	  				.attr('x1',x + nodeRadius*2) 
	  				.attr('y1',0)
	  				.attr('x2',x + nodeRadius*2)
	  				.attr('y2',screenHeight);
	  			}else{
	  				cursor_x.classed('hide',true);
	  				cursor_y.classed('hide',true);
	  			}
	  		}
	  	}
	  	// 
	  	function setData(data){
	  		d3.selectAll('.node,.vertex,.link').remove();
	  		subwayData.nodes.forEach(function(v,i,a){
	  			drawNode(new _node(v));
	  		});
	  		subwayData.vertexes.forEach(function(v,i,a){
	  			drawVertex(new _vertex(v));	
	  		});
	  		subwayData.links.forEach(function(v,i,a){
	  			drawLink(new _link(v));
	  		});
	  	}
	  	//export data
	  	function exportData(){
	  		var nodes = d3.selectAll('.node');
	  		var links = d3.selectAll('.link');
	  		var vertexes = d3.selectAll('.vertex');
	  		var data = {
	  			nodes : [],
	  			links : [],
	  			vertexes : []
	  		};
	  		nodes[0].forEach(function(v,i,a){
	  			data.nodes.push(d3.select(v).datum());
	  		});
	  		links[0].forEach(function(v,i,a){
	  			data.links.push(d3.select(v).datum());
	  		});
	  		vertexes[0].forEach(function(v,i,a){
	  			data.vertexes.push(d3.select(v).datum());
	  		});

	  		var content = 'var subwayData = '+JSON.stringify(data);
	  		var pom = document.createElement('a');
		    pom.setAttribute('href', 'data:json/plain;charset=utf-8,' + encodeURIComponent(content));
		    pom.setAttribute('download', 'subwayData.js');
		    pom.click();
	  	}
	  	//svg요소 재정렬 해주는 함수.
		function reSorting(){
			d3.selectAll('.node,.link,.vertex').sort(function(a,b){
				if(WEIGHT[a.type] > WEIGHT[b.type])	return 1;
				else if(WEIGHT[a.type] < WEIGHT[b.type])return -1;
				else return 0;
			});
		}
	  	//************* Event Listener *****************
	  	//체커보드 이벤트 리스너
	  	function checkerEvt(selection){
	  		selection.on('mousedown.checkerBoard',function(e){
	  			var point = d3.mouse(board.node());
	  			drawNode(new _node({x : div10(point[0]),y : div10(point[1])}));
	  		});
	  		selection.on('mousemove.checkerBoard',function(e){
	  			console.log('mousemove');
	  			var point = d3.mouse(board.node());
	  			drawCursor(div10(point[0])-nodeRadius,div10(point[1])-nodeRadius,
	  				10,10,true);
	  		});
	  	}
	  	//노드 이벤트 리스너
	  	function nodeEvt(selection){
	  		//마우스 오버 이벤트
	  		selection.on('mouseover.node',function(e){
	  			var target = d3.select(this);
	  			//커서 그리기ㅣ
	  			drawCursor(target.datum().x - nodeRadius,target.datum().y - nodeRadius,
	  				nodeRadius * 2,nodeRadius * 2,true);
	  		});
	  		//context Menu List;
			var menu = [
				{
					title: '정보 입력',
					action : function(elm,d,i){
						d3.inputBox(function(form){
							// console.log
							d3.select(elm).datum().textInfo.text = form.name.value;
							d3.select(elm).datum().id = form.id.value;
							d3.select(elm).select('.nodeName').text(form.name.value);

							return elm;
						},
						[{name:'이름',id:'name'}
						,{name:'ID',id:'id'}
						,{name:'설명',id:'description'}
						])
						.open();
					}
				},
				{
					title : '노드 삭제',
					action : function(elm,d,i){
						d3.select(elm).datum().delete();
					}
				},
				{
					title : "데이터 뽑기",
					action: function(elm,d,i){
						exportData();
					}
				},
				{
					title : "데이터 적용하기",
					action: function(elm,d,i){
						setData();
					}
				}
			];

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

			//tooltip
			selection.call(d3.helper.tooltip().style({color:'blue',background:'white'}).text(function(d){
				return 'id:'+d.uid+' - '+d.x+','+d.y;
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
	  				var target = d3.select('.vertex#vertex'+v);
	  				target.classed('hide',false);
	  			});
	  		});
	  			  		//context Menu List;
			var menu = [
				{
					title: '정보 입력',
					action : function(elm,d,i){
						d3.inputBox(function(form){
							// console.log
							d3.select(elm).datum().lineNo = form.lineNo.value;
							d3.select(elm).style('stroke',function(d){return lineColorDic[d.lineNo]});
							return elm;
						},
						[{name:'호선',id:'lineNo'}]).open();
					}
				},
				{
					title : '링크 삭제',
					action : function(elm,d,i){
						d3.select(elm).datum().delete();
					}
				},
			];
	  		selection.on('contextmenu',d3.contextMenu(menu));
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
						d3.select(this).attr('cx',function(d){return d.x = div10(point[0]);})
									   .attr('cy',function(d){return d.y = div10(point[1]);});
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
			  		var node1 = d3.select('.node.selected');
			  		var node2 = d3.select('.node.preSelected');
			  		if(!node1.empty() && !node2.empty()){
				  		var link = new _link({node1 : node1.datum().uid,node2 : node2.datum().uid});
				  		var el = drawLink(link);
				  		node1.datum().link.push(el.datum().uid);
				  		node2.datum().link.push(el.datum().uid);
				  	}else{
	  					alert('두개 이상의 노드를 선택해주세요');
	  				}

	  			}else if(keyCode === 86){ // 'v' key
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
						var vertex = new _vertex({x:x,y:y});
	  					var vertexCircle = drawVertex(vertex);

						link.datum().vertex.splice((i+addSize),0,vertexCircle.datum().uid);
						addSize++;
					}
	  			}else if(keyCode === 87 ){ // 'w' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					node.attr('y',function(d){return d.textInfo.y-= 1;});
	  				}
	  			}else if(keyCode === 65 ){ // 'a' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					node.attr('x',function(d){return d.textInfo.x-= 1;});
	  				}
	  			}else if(keyCode === 83 ){ // 's' key
		  			var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					node.attr('y',function(d){return d.textInfo.y+= 1;});
	  				}			
	  			}else if(keyCode === 68 ){ // 'd' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					node.attr('x',function(d){return d.textInfo.x+= 1;});
	  				}
	   			}else if(keyCode === 81 ){ // 'q' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					node.attr('transform',function(d){return 'rotate('+(d.textInfo.rotate -= 1)+')';});
	  				}
	  			}else if(keyCode === 69 ){ // 'e' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					node.attr('transform',function(d){return 'rotate('+(d.textInfo.rotate += 1)+')';});
	  				}
	  			}else if(keyCode === 79 ){ // 'o' key
	  				var checkers = d3.selectAll('.checkerLine');
	  				checkers.attr('class','hidden');
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
