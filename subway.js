var mindAll = (function(){
	var subway = function(selector){
		var svg = d3.select(selector || '#subway').append('svg').attr('width',1000).attr('height',700);
		var back = svg.append('g')
					.attr('class','background')
					.append('image')
					.attr('xlink:href','images/subwayBack.svg')
					.attr('x',0)
					.attr('y',0)
					.attr('width',svg.attr('width'))
					.attr('height',svg.attr('height'));

		var paddingX = 200;
		var paddingY = 200;

		var line2Data = {
			arcs : [{x : 50 ,y : 50 ,r: 50 ,start : 270 ,end : 360 },
					{x : 450 ,y : 50 ,r: 50 ,start : 0 ,end : 90 },
					{x : 50 ,y : 250 ,r: 50 ,start : 180 ,end : 270 },
					{x : 450,y : 250,r: 50,start : 90 ,end : 180 },
			],
			lines : [[{x: 50 ,y: 0} , {x: 450 ,y: 0}],
					 [{x: 0 ,y: 50} ,{x: 0 ,y: 250}],
			         [{x: 50,y:300 }, {x: 450,y: 300}],
			         [{x: 500 ,y: 250} , {x: 500 ,y: 50}],
			]
		};

		var subNodeData = [{x : 7,y : 23,r : 3,	subId : 100100101,subName : '신촌'},
						   {x : 23,y : 9,r : 3,	subId : 100100102,subName : '이대',},
						   {x : 54,	y : 0,r : 3,subId : 100100102,subName : '아현',},
						   {x : 0,y : 45,r : 3,subId : 100100102,subName : '홍대',},
						   {x : 74,y : 0,r : 3,subId : 100100102,subName : '충정로',},
						   {x : 104,y : 0,r : 3,subId : 100100102,subName : '시청',},
						   {x : 144,y : 0,r : 3,subId : 100100102,subName : '을지로입구',},
						   {x : 184,y : 0,r : 3,subId : 100100102,subName : '을지로3가',},
						   {x : 224,y : 0,r : 3,subId : 100100102,subName : '을지로4가',},
						   {x : 264,y : 0,r : 3,subId : 100100102,subName : '동대문역사문화공원',},
						   {x : 304,y : 0,r : 3,subId : 100100102,subName : '신당',},
						   {x : 344,y : 0,r : 3,subId : 100100102,subName : '상왕십리',},
						   {x : 384,y : 0,r : 3,subId : 100100102,subName : '왕십리',},
						  ];

		var line = d3.svg.line()
					.x(function(d){return d.x;})
					.y(function(d){return d.y;})
					.interpolate('linear');

		var line2Group = svg.append('g').attr('class','line2Group')
							.attr('transform','translate('+paddingX+','+paddingY+')');


		var lines = line2Group.selectAll('line2')
						.data(line2Data.lines)
						.enter()
						.append('path')
						.attr('class','line line2')
						.attr('d',line)
						.on('mousedown',mouseDownEvent);


		var arcs = line2Group.selectAll('arc arcs2')
						.data(line2Data.arcs)
						.enter()
						.append('path')
						.attr('class','line2')
						.attr('d',function(d){return describeArc(d.x,d.y,d.r,d.start,d.end);})
						.on('mousedown',mouseDownEvent);


		var nodeGroups = line2Group.selectAll('subNode')
			.data(subNodeData)
			.enter()
			.append('g')
			.attr('transform',function(d){
				return 'translate('+d.x+','+d.y+')';
			});

		nodeGroups
			.append('circle')
			.attr('class','subNode')
			.attr('r',function(d){return d.r;});
		nodeGroups
			.append('text')
			.attr('class','subName')
			.attr('y',function(d){return 11;})
			.text(function(d){return d.subName});



		function mouseDownEvent(){
			console.log(d3.mouse(line2Group.node()));
			console.log(d3.select(d3.event.target).data());
		}


		function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

		  return {
		    x: centerX + (radius * Math.cos(angleInRadians)),
		    y: centerY + (radius * Math.sin(angleInRadians))
		  };
		}

		function describeArc(x, y, radius, startAngle, endAngle){

		    var start = polarToCartesian(x, y, radius, endAngle);
		    var end = polarToCartesian(x, y, radius, startAngle);

		    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

		    var d = [
		        "M", start.x, start.y, 
		        "A", radius, radius, 0, arcSweep, 0, end.x, end.y
		    ].join(" ");

		    return d;       
		}
	}

	return{
		subway : subway,
	}
})();