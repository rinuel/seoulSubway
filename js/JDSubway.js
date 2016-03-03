var JDSubway = (function(){

  	// Properties
  	///////////////////////////
  	var screenWidth = window.screen.width ;
  	var screenHeight = window.screen.height ;
  	var nodeRadius = 5;
  	var cursorFlag = true;
  	var lineWidth = 20;
  	//custom alert이 있으면 선언
  	var acwidgets = null;
  	try{
  		acwidgets = ACWidgets.init();
  	}catch(err){
  		console.log(err);
  	}
  	//링크 라인 path 생성 함수
  	var linkLine = function(lineTy){
		return {
			getLinePath : d3.svg.line()
				.interpolate(lineTy)
			.x(function(d){return d.x; })
			.y(function(d){return d.y; })
		};
	};
	var lineColorMap = {
		1001 : '#2980B9',
		1002 : '#2ECC71',
		1003 : '#E67E22',
		1004 : '#3498DB',
		1005 : '#8E44AD',
		1006 : '#D35400',
		1007 : '#C0392B',
		1008 : '#E74C3C',
	};

	//라인 가중치 가중치 크기에따라 맨위로 올라오는 요소가 달라짐
	var WEIGHT = {
		node : 2,
		link : 1,
		vertex : 3,
		cursor : 4,
	};
	//노드 데이터 객체
  	var Node = function(param){
  		this.uid = param.uid === undefined ? (getMaxUid('node')+1) || 0: param.uid;
  		this.sttnId = param.sttnId === undefined ? 0: param.sttnId;
  		this.line = param.line === undefined ? 0: param.line;
  		this.x = param.x === undefined ? 0 : param.x;
  		this.y = param.y === undefined ? 0 : param.y;
  		this.info = param.info || {};
  		this.subType = param.subType === undefined ? 0 : param.subType;
  		this.type = param.type || 'node';
  		this.rpId = param.rpId === undefined ? null : param.rpId;
  		this.frcode = param.frcode || {
  			x : 0,
  			y : -30,
  			anchor : 'middle',
  			rotate : 0,
  			text : 'frcode',
  			textSize : 15,
  		};
  		this.textInfo = param.textInfo || {
  			x : 0,
  			y : -10,
  			anchor : 'middle',
  			rotate : 0,
  			text : 'name',
  			textSize : 15,
  		};
   	};

   	var RPNode = function(param){
   		this.rpId = param.rpId === undefined ? 0 : param.rpId;
  		this.x = param.x === undefined ? 0 : param.x;
  		this.y = param.y === undefined ? 0 : param.y;
  		this.width = param.width === undefined ? 0 : param.width;
  		this.height = param.height === undefined ? 0 : param.height;
  		this.type = param.type || 'rpnode';
  		this.textInfo = param.textInfo || {
  			x : 0,
  			y : -10,
  			anchor : 'middle',
  			rotate : 0,
  			text : 'name',
  			textSize : 15,
  		};
   	};
   	//링크 데이터 객체
  	var Link = function(param){

  		this.uid = param.uid === undefined ? (getMaxUid('link')+1) || 0 : param.uid;
  		this.node1 = param.node1 === undefined ? '' : param.node1;
  		this.node2 = param.node2 === undefined ? '' : param.node2;
  		this.line = param.line === undefined ? 0 : param.line;
  		this.lineTy = param.lineTy || 'basis';
  		this.type = param.type || 'link';
  	};
	Link.prototype.getPoints = function(){
		var points = [];
		//첫째노드 포인트.
		var point = d3.select('.node#node'+this.node1);
                         
		points.push({x:point.datum().x,y:point.datum().y});
		//버텍스 포인트 들.
		getVertexesByLinkId(this.uid).forEach(function(v,i,a){
			points.push({x:v.datum().x , y:v.datum().y});
		});
		//목적노드 포인트.
		point = d3.select('.node#node'+this.node2);
		points.push({x:point.datum().x,y:point.datum().y});

		return points;	
	};

	  	//버텍스 데이터 객체
  	var Vertex = function(param){
  		this.uid = param.uid === undefined ? (getMaxUid('vertex')+1) || 0 : param.uid;
  		// this.link = param.link === undefined ? 0 : param.link;
  		this.x = param.x === undefined ? 0 : param.x;
  		this.y = param.y === undefined ? 0 : param.y;
  		this.link = param.link === undefined ? 0 : param.link;
  		this.sn = param.sn === undefined ? 0 : param.sn;
  		this.type = param.type || 'vertex';
  	};

  	// Private Methods
  	///////////////////////////
  	//
	function getLinkByNodeId(nodeId){
		var result = 0;
		d3.selectAll('.link').each(function(d,i){
			if((nodeId === d.node1) || (nodeId === d.node2)){
				result = d3.select(this); 
				return false;
			}
		});
		return result;
	};
  	//
  	function getVertexesByLinkId(linkId){
  		var list = [];
		d3.selectAll('.vertex').each(function(d,i){
			if(linkId === d.link){
				list.push(d3.select(this));
			}
		});
		list.sort();
		return list;
	};
  	//SVG 삭제
  	function removeSVG(d3_selection){
  		if(d3_selection){
  			var type = d3_selection.datum().type;
	  		if(type === 'node'){
				removeSVG(getLinkByNodeId(d3_selection.datum().uid));
	  		}else if(type === 'link'){
				getVertexesByLinkId(d3_selection.datum().uid).forEach(function(v,i,a){
					removeSVG(v);
				});
	  		}else if(type === 'vertex'){
	  		}
	  		d3_selection.remove();
  		}
  	}
  	//노드 이동.
  	function moveNode(d3_selection,dx,dy){
		d3_selection.attr('transform',function(d){
			d.x += dx; d.y += dy;
			return PTS(d.x,d.y);
		});
  	}
  	//
  	function moveNodeText(d3_selection,dx,dy){
  		//좌표이동.
  		var rpId = d3_selection.datum().rpId;
		var duplNode = d3.selectAll('.node').filter(function(d){
			return d.rpId === rpId && rpId !== null;
		});
		if(duplNode.size() >= 2){
			d3.select('#rpnode'+rpId).select('text')
				.attr('y',function(d){return d.textInfo.y += dy;})
		  		.attr('x',function(d){ return d.textInfo.x += dx;});
		}else{
	  		d3_selection
				.attr('y',function(d){return d.textInfo.y += dy;})
				.selectAll('tspan')
		  		.attr('x',function(d){ return d.textInfo.x += dx;});
		}
  	}
  	function rotateNodeText(d3_selection,dx){
  		//좌표이동.
  		var rpId = d3_selection.datum().rpId;
		var duplNode = d3.selectAll('.node').filter(function(d){
			return d.rpId === rpId && rpId !== null;
		});
		if(duplNode.size() >= 2){
			d3.select('#rpnode'+rpId).select('text')
				.attr('transform',function(d){return 'rotate('+(d.textInfo.rotate += dx)+')';});
		}else{
	  		d3_selection
				.attr('transform',function(d){return 'rotate('+(d.textInfo.rotate += dx)+')';});
		}
  	}
  	//text 라인 나누기.
  	function insertLinebreaks (d) {
	    var el = d3.select(this);
	    var words = d.textInfo.text.split(' ');
	    el.text('');

	    for (var i = 0; i < words.length; i++) {
	        var tspan = el.append('tspan').attr('x',function(d){return d.textInfo.x;})
	        				.text(words[i]);
	        if (i > 0)
	            tspan.attr('dy', '15');
	    }
	};
  	//최대 uid 를 구함.
  	function getMaxUid(className){
  		var maxUid = d3.max(d3.selectAll('.'+className)[0],function(d){
  			return d3.select(d).datum().uid;
  		});

  		return maxUid;
  	}
  	//10이하 수 반올림 함수.
  	function div10(number){
  		return d3.round(number / lineWidth,0) * lineWidth;
  	}
  	//x,y 좌표를 translate 스트링으로 바꾸어주는 함수.
  	function PTS(_x,_y){
  		return 'translate('+_x+','+_y+')';
  	}

	//노드 그려주는 함수. 
  	function drawNode(node,container){
  		var el = container.selectAll('node')
  					.data([node])
  					.enter()
  					.append('g')
  					.attr({
  						transform : function(d){return PTS(d.x,d.y);},
  						id : function(d){return 'node'+d.uid}, class : 'node'
  					});
  		el.append('circle').attr('class','subway').attr('r',nodeRadius);
  		el.append('text').attr('class','nodeName')
  						.attr('y',function(d){ return d.textInfo.y;})
			        	.attr('text-anchor',function(d){return d.textInfo.anchor || 'middle';})
			        	.attr('transform',function(d){return 'rotate('+(d.textInfo.rotate || 0)+')';})
						.style('font-size',function(d){return d.textInfo.textSize+'px';})
  						.each(insertLinebreaks);
  						// .text(function(d){return d.textInfo.text;});
	  	reSorting();
	  	return el;
	}
		//노드 그려주는 함수. 
  	function drawRpNode(rpNode,container){
  		var el = container.selectAll('rpnode').data([rpNode]).enter()
					.append('g').attr({
						transform : function(d){return PTS(d.x,d.y)},
						id : function(d){return 'rpnode'+d.rpId},
						class : 'rpnode',
					});
		el.append('ellipse').attr({
				rx:function(d){return d.width},		// 중심 너비
				ry:function(d){return d.height},	// 중심 높이
		});
		el.append('text').attr('class','nodeName')
			.attr('y',function(d){ return d.textInfo.y;})
	    	.attr('text-anchor',function(d){return d.textInfo.anchor || 'middle';})
	    	.attr('transform',function(d){return 'rotate('+(d.textInfo.rotate || 0)+')';})
			.style('font-size',function(d){return d.textInfo.textSize+'px';})
			.text(function(d){return d.textInfo.text});
	  	reSorting();
	  	return el;
	}
	//링크 그려주는 함수.
  	function drawLink(link,container){
  		var link = link;
  		var el = container.selectAll('link')
  					.data([link])
  					.enter()
  					.append('path')
  					.attr({
  						d : function(d){return linkLine(d.lineTy).getLinePath(d.getPoints());},
  						id : function(d){return 'link'+d.uid;}, class : 'link',
  					})
  					.style('stroke',function(d){return lineColorMap[d.line]; });
  		reSorting();
  		return el;
  	}
  	//버텍스 그려주는 함수.
  	function drawVertex(vertex,container){
  		var vertex = vertex;
		var vertexCircle = container.selectAll('vertex')
			.data([vertex])
			.enter()
			.append('circle')
			.attr({
				cx : function(d){return d.x;}, cy : function(d){return d.y;},
				r : nodeRadius , id : function(d){return 'vertex'+d.uid;},
				class : 'vertex'
			});

		reSorting();

		return vertexCircle;
  	}
  	//svg요소 재정렬 해주는 함수.
	function reSorting(){
		d3.selectAll('.node,.link,.vertex').sort(function(a,b){
			if(WEIGHT[a.type] > WEIGHT[b.type])	return 1;
			else if(WEIGHT[a.type] < WEIGHT[b.type])return -1;
			else return 0;
		});
	}

  	// Public Methods
  	///////////////////////////
  	/*
   	* An example public method.
   	*/
  	var publicMethod = function () {};
  	//에디터 클래스.
  	var editor = function(selector){
  		// var zoom = d3.behavior.zoom().scaleExtent([1,10]).on('zoom',zoomed(board));
  		var svg = d3.select(selector).append('svg').attr('width',screenWidth).attr('height',screenHeight).append('g');
  		var board = svg.append('g').attr('class','editor');
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
				.attr({
					x1 : 0, y1 : function(d){return d;},
					x2 : screenWidth , y2 : function(d){return d;},
					class : 'checkerLine',
				});

			container.selectAll('line2')
				.data(d3.range(0,screenWidth,lineWidth))
				.enter()
				.append('line')
				.attr({
					x1 : function(d){return d;}, y1 : 0,
					x2 : function(d){return d;}, y2 : screenHeight,
					class : 'checkerLine'
				});

			//배경 사각화면
			container.append('rect')
				.attr({
					width : screenWidth , height : screenHeight,
					fill : 'transparent', class : 'backRect' 
				}).call(checkerEvt);
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
	  	function checkNodeDuplicate(x,y){
	  		var target = false;
	  		board.selectAll('.node').each(function(d,i){
	  			if(d.x === x && d.y === y){
	  				target = d3.select(this);
	  				return false;
	  			}
	  		});
	  		return target;
	  	}
	  	//import data 
	  	function setData(data){
	  		d3.selectAll('.node,.vertex,.link').remove();
	  		subwayData.nodes.forEach(function(v,i,a){
	  			drawNode(new Node(v),board).call(nodeEvt);
	  		});
	  		subwayData.vertexes.forEach(function(v,i,a){
	  			drawVertex(new Vertex(v),board).call(vertexEvt);	
	  		});
	  		subwayData.links.forEach(function(v,i,a){
	  			drawLink(new Link(v),board).call(linkEvt);
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
	  	//************* Event Listener *****************
	  	//체커보드 이벤트 리스너
	  	function checkerEvt(selection){
	  		selection.on('mousedown.checkerBoard',function(e){
	  			var point = d3.mouse(board.node());
	  			var x = div10(point[0]),
	  				y = div10(point[1]);
	  			var target = checkNodeDuplicate(x,y);
	  			if(!target){
	  				var el = drawNode(new Node({x : x,y : y}),board).call(nodeEvt);
	  				selectNode(el);
	  			}else{
	  				selectNode(target);
	  			}
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

	  		//컨텍스트 메뉴이벤트
	  		selection.on('contextmenu',function(){
	  			var target = d3.select(this);
	  			var pos = d3.mouse(board.node());

	  			var inputBox = d3.select('#nodeInput').style({
	  				left : pos[0]+'px',
	  				top : pos[1]+'px',
	  			}).classed('hide',false);

	  			//데이터 초기화
	  			inputBox.select('#infoArea').data([1]).html('현재 역을 검색하여 선택해주세요');
	  			inputBox.select('#searchResult').html('');
	  			inputBox.select('#stNm').attr('value','');

	  			//데이터 있을경우 데이터 넣어주기
	  			if(target.datum().sttnId){
	  				var data = target.datum();
		  			inputBox.select('#infoArea').data([
		  				{name  : data.textInfo.text,
		  				 id    : data.sttnId,
		  				 line  : data.line,
		  				 frcode: data.frcode.text,
		  				 rpId  : data.rpId}
		  			])
		  			.html(data.textInfo.text);
	  			}

	  			//검색 버튼 이벤트
	  			inputBox.select('#searchBtn').on('mousedown',function(d){
	  				var ultag = inputBox.select('#searchResult').append('ul');

	  				ultag.selectAll('li').data(subDummy.subList).enter()
	  						.append('li').append('a').style('cursor','pointer')
	  						.on('click',function(data){
	  							//역 이름 세팅 및 노드 데이터 삽입
	  							inputBox.select('#infoArea').data([data]).html(data.name);
	  						}).html(function(d){return d.name+'('+d.line+')';});
	  			});

	  			//확인 버튼 이벤트
	  			inputBox.select('#okBtn').on('mousedown',function(d){
	  				var data = inputBox.select('#infoArea').datum();
	  				target.datum().textInfo.text = data.name;
	  				target.datum().frcode.text = data.frcode;
	  				target.datum().sttnId = data.id;
	  				target.datum().line = data.line;
	  				target.datum().rpId = data.rpId;

	  				//대표노드 갯수 확인
	  				var xArray= [],yArray=[];
					var duplNode = d3.selectAll('.node').filter(function(d){
						return d.rpId === data.rpId && data.rpId !== null;
	  				});
	  				duplNode.each(function(d){
	  					xArray.push(d.x);
	  					yArray.push(d.y);
	  				});
	  				if(duplNode.size() >= 2){
	  					var rpId = d3.select(duplNode[0][0]).datum().rpId;
	  					var rpNode_selection = d3.select('#rpnode'+rpId);
						//텍스트 노드 사라지게
	  					duplNode.select('text').classed('hide',true);
	  					var minX = d3.min(xArray),
	  						maxX = d3.max(xArray),
	  						minY = d3.min(yArray),
	  						maxY = d3.max(yArray);
	  					var one = d3.select(duplNode[0][0]);
	  					var xPos = Math.abs((minX + maxX)/2);
	  					var yPos = Math.abs((minY + maxY)/2);
	  					var width = maxX - xPos + 10;
	  					width = width === 0 ? 20 : width;
	  					var height = maxY - yPos + 10;
	  					height = height === 0 ? 20 : height;

	  					if(rpNode_selection.empty()){
		  					var rpnode = new RPNode({rpId:rpId,x:xPos,y:yPos,width:width,height:height});
		  					rpnode.textInfo.text = one.datum().textInfo.text;
		  					drawRpNode(rpnode,board);
	  					}else{
	  						rpNode_selection.attr({
	  							transform : function(d){return PTS(xPos,yPos);},
	  						}).select('ellipse').attr({
	  							rx:function(d){return (width);},
	  							ry:function(d){return (height);},
	  						});
	  					}
	  				}
	  				target.select('text').each(insertLinebreaks);
	  				inputBox.classed('hide',true);
	  			});
	  			//삭제 버튼 이벤트
	  			inputBox.select('#delBtn').on('mousedown',function(d){
	  				removeSVG(target);
	  				inputBox.classed('hide',true);
	  			});
	  			//취소 버튼 이벤트
	  			inputBox.select('#canBtn').on('mousedown',function(d){
	  				inputBox.classed('hide',true);
	  			});

	  			d3.event.preventDefault();
				d3.event.stopPropagation();
	  		});

	  		//드래그 설정.
	  		selection.call(d3.behavior.drag().origin(function(d){return d;})
					.on('dragstart',function(){
						selectNode(d3.select(this));
					})
					.on('drag',function(){
						var point = d3.mouse(board.node());
						var target = d3.select(this);
						var rpnode_selection = d3.select('#rpnode'+target.datum().rpId);
						target.attr('transform',function(d){
							d.x = div10(point[0]); d.y = div10(point[1]);
							return PTS(d.x,d.y);
						});
						d3.selectAll('.link').attr('d',function(d){
							return linkLine(d.lineTy).getLinePath(d.getPoints());
						});

						if(!rpnode_selection.empty()){
							var duplNode = d3.selectAll('.node').filter(function(d){
								return d.rpId === rpnode_selection.datum().rpId;
			  				});
			  				var xArray = [],yArray=[];
			  			    duplNode.each(function(d){
			  					xArray.push(d.x);
			  					yArray.push(d.y);
		  					});
		  					var minX = d3.min(xArray),
		  						maxX = d3.max(xArray),
		  						minY = d3.min(yArray),
		  						maxY = d3.max(yArray);
			  				var xPos = Math.abs((minX + maxX)/2);
		  					var yPos = Math.abs((minY + maxY)/2);
		  					var width = maxX - xPos + 10;
		  					width = width === 0 ? 20 : width;
		  					var height = maxY - yPos + 10;
		  					height = height === 0 ? 20 : height;

		  					rpnode_selection.attr({
	  							transform : function(d){return PTS(xPos,yPos);},
	  						}).select('ellipse').attr({
	  							rx:function(d){return (width);},
	  							ry:function(d){return (height);},
	  						});
	  					}

					}).on('dragend',function(){console.log('dragend');})
			);

			//tooltip
			selection.call(d3.helper.tooltip().style({color:'blue',background:'white'}).text(function(d){
				return 'id:'+d.uid+' - '+d.x+','+d.y;
			}));
	  	}
	  	function selectNode(d3_selection){
			d3.select('.node.preSelected').classed('preSelected',false);
			d3.select('.node.selected').classed('preSelected',true);
			d3.select('.selected').classed('selected',false);
			d3_selection.classed('selected',true);
			d3.selectAll('.vertex').classed('hide',true);
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

	  			getVertexesByLinkId(target.datum().uid).forEach(function(v,i,a){
	  				v.classed('hide',false);
	  			});
	  		});

	  		//우클릭 이벤트
	  		selection.on('contextmenu',function(){
	  			var target = d3.select(this);
	  			var lineList = ['linear','step-before','basis','cardinal','monotone'];
	  			var pos = d3.mouse(board.node());

	  			//input 박스
		  		var inputBox = d3.select('#linkInput').style({
		  			left: pos[0]+'px',
		  			top : pos[1]+'px',
		  		}).classed('hide',false);
		  		
		  		inputBox.select('#lineTy').html('').selectAll('option')
		  			.data(lineList).enter().append('option').html(function(d){
		  				return d;
		  		}).filter(function(d,i){return target.datum().lineTy === d}).attr('selected',true);

		  		inputBox.select('#okBtn').on('click',function(d){
		  			target.datum().lineTy = inputBox.select('#lineTy')[0][0].value;
		  			//link 모양 변경 적용
		  			board.selectAll('.link')
  							.attr('d',function(d){return linkLine(d.lineTy).getLinePath(d.getPoints());});
		  			inputBox.classed('hide',true);
		  		});
		  		inputBox.select('#delBtn').on('click',function(d){
		  			removeSVG(target);
		  			inputBox.classed('hide',true);
		  		});
		  		inputBox.select('#canBtn').on('click',function(d){
		  			inputBox.classed('hide',true);
		  		});

	  			d3.event.preventDefault();
				d3.event.stopPropagation();
	  		});

	  		//마우스 오버 이벤트
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
							return linkLine(d.lineTy).getLinePath(d.getPoints());
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
	  				makeLink();
	  			}else if(keyCode === 86){ // 'v' key
	  				makeVertex();
	  			}else if(keyCode === 87 ){ // 'w' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					moveNodeText(node,0,-1);
	  				}
	  			}else if(keyCode === 65 ){ // 'a' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					moveNodeText(node,-1,0);
	  				}
	  			}else if(keyCode === 83 ){ // 's' key
		  			var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					moveNodeText(node,0,1);
	  				}			
	  			}else if(keyCode === 68 ){ // 'd' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					moveNodeText(node,1,0);
	  				}
	   			}else if(keyCode === 81 ){ // 'q' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					rotateNodeText(node,-1);
	  				}
	  			}else if(keyCode === 69 ){ // 'e' key
	  				var node = d3.select('.node.selected').select('.nodeName');
	  				if(!node.empty()){
	  					rotateNodeText(node,+1);
	  				}
	  			}else if(keyCode === 79 ){ // 'o' key
	  				var checkers = d3.selectAll('.checkerLine');
	  				checkers.attr('class','hidden');
	  			}else if(keyCode === 38 ){ // 'up arrow' key
	  				var node = d3.select('.node.selected');
	  				moveNode(node,0,-1);
	  			}else if(keyCode === 39 ){ // 'right arrow' key
	  				var node = d3.select('.node.selected');
	  				moveNode(node,1,0);
	  			}else if(keyCode === 40 ){ // 'down arrow' key
	  				var node = d3.select('.node.selected');
	  				moveNode(node,0,1);
	  			}else if(keyCode === 37 ){ // 'left arrow' key
	  				var node = d3.select('.node.selected');
	  				moveNode(node,-1,0);
	  			}
  			}else if(e.type === 'keyup'){

  			}
	  	}
	  	//링크 데이터 생성해서 그리기
	  	function makeLink(){

	  		var node1 = d3.select('.node.selected');
	  		var node2 = d3.select('.node.preSelected');

  			if(!node1.empty() && !node2.empty()){
  				if(node1.datum().line != node2.datum().line){
  					alert('같은 호선이 아닙니다.');
  				}else{
			  		var link = new Link({
			  			node1 : node1.datum().uid,
			  			node2 : node2.datum().uid});
			  		var el = drawLink(link,board).call(linkEvt);
			  	}
		  	}else{
				alert('두개 이상의 노드를 선택해주세요');
			}
	  		/*
			*/
	  	}
		//버텍스 데이터 생성해서 그리기
	  	function makeVertex(){
			var link = d3.select('.link.selected');
			if(link.empty()){
				alert('선택된 링크가 없습니다.');
				return false;
			}
			var points = link.datum().getPoints();
			var length = points.length;

			//버텍스 추가.
			var x = (points[length-1].x + points[length-2].x)/2;
			var y = (points[length-1].y + points[length-2].y)/2;
			drawVertex(new Vertex({x:x, y:y, link : link.datum().uid,sn : length }),board).call(vertexEvt);
	  	}
  	}

  	//에디터 클래스.
  	var viewer = function(selector){
  		//move to front
	    d3.selection.prototype.moveToFront = function() {  
	      return this.each(function(){
	        this.parentNode.appendChild(this);
	      });
	    };

  		var zoom = d3.behavior.zoom().scaleExtent([0.5,10]).on('zoom',zoomed);
  		var svg = d3.select(selector).append('svg').attr('width',screenWidth).attr('height',screenHeight).append('g').call(zoom);
		var container = svg.append('g').attr('class','viewer');

  		var image = container.append('image')
					  .attr('xlink:href','images/subwayBack.svg')
					  .attr('class', 'pico')
					  .attr('height', screenHeight)
					  .attr('width', screenWidth);
		setData();

		var board = container.append('rect')
				.attr({
					width : screenWidth , height : screenHeight,
					fill : 'none', class : 'backRect hide'  
				}).style({
					fill : 'white', opacity : 0.8
				});
	  	//import data 
	  	function setData(data){
	  		d3.selectAll('.node,.vertex,.link').remove();
	  		subwayData.nodes.forEach(function(v,i,a){
	  			drawNode(new Node(v),container).call(nodeEvt_v);
	  		});
	  		subwayData.vertexes.forEach(function(v,i,a){
	  			v.zindex = 1;
	  			drawVertex(new Vertex(v),container);	
	  		});
	  		subwayData.links.forEach(function(v,i,a){
	  			v.zindex = 1;
	  			drawLink(new Link(v),container);
	  		});
	  	}

  	 	//줌 처리 리스너
	  	function zoomed(evt){
	  		var t = zoom.translate(),
			    tx = t[0],
			    ty = t[1];

			//pan 거리 제한두기.
			// tx = Math.min(tx, screenWidth /2 );
			// tx = Math.max(tx, 0);
			// ty = Math.min(ty, screenHeight /2);
			// ty = Math.max(ty, 0);
			// zoom.translate([tx, ty]);

			//위치, 스케일 변경
  			container.attr("transform", "translate(" + tx+','+ty + ")scale(" + d3.event.scale + ")");
	  	}

	  	//노드 이벤트.
	  	function nodeEvt_v(selection){
	  		selection.on('mousedown.node',function(d,i){
	  			var pos = d3.mouse(svg.node());
	  			var conPos = d3.mouse(container.node());
	  			var popover = d3.select('#nodePop').style({
	  				left:pos[0]+'px',
	  				top:pos[1]+'px'
	  			}).classed('hide',false);
	  			//출발버튼 이벤트
	  			popover.select('button[data-point="start"]').on('click',function(d){
	  				var startSymbol = container.selectAll('.startPoint').data([1]);
	  				startSymbol.enter().append('path').attr({
	  						d : d3.svg.symbol(),
	  						class:'startPoint',
	  				});
	  				startSymbol.attr('transform', 'translate('+conPos+')');
	  				popover.classed('hide',true);
	  			});
	  			//도착버튼 이벤트
	  			popover.select('button[data-point="end"]').on('click',function(d){
	  				var endSymbol = container.selectAll('.endPoint').data([1]);
	  				endSymbol.enter().append('path').attr({
	  						d : d3.svg.symbol(),
	  						class:'endPoint',
	  				});
	  				endSymbol.attr('transform', 'translate('+conPos+')');
	  				popover.classed('hide',true);
	  				updateLayer();
	  			});
	  		});
	  		// d3.event.stopPropagation();
	  	}
	  	//링크 이벤트.
	  	function linkEvt_v(selection){

	  	}
	  	//버텍스 이벤트.
	  	function vertexEvt_v(selection){

	  	}
	  	//레이어 순서 변경
	  	function updateLayer(){
	  		var nodeList = [1,0,45,44,43,42,41,40,51,52];
	  		var linkList  = [2,3,49,48,47,46,45,62,61];

	  		linkList.forEach(function(v,i,a){
	  			container.select('#link'+v).moveToFront();
	  		});
	  		nodeList.forEach(function(v,i,a){
	  			container.select('#node'+v).moveToFront();
	  		});
	  		container.select('.backRect').classed('hide',false);
	  		// container.select('#node'+51).moveToFront();
	  	}

  	}
  	// Init
  	///////////////////////////

	return {
		editor : editor,
		viewer : viewer,
	}
})();
