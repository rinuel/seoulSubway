(function(){
	//tooltip
	d3.helper = {};

	d3.helper.tooltip = function(){
		var tooltipDiv;
	    var bodyNode = d3.select('body').node();
	    var attrs = {};
	    var text = '';
	    var styles = {};

	    function tooltip(selection){

	        selection.on('mouseover.tooltip', function(pD, pI){
	            var name, value;
	            // Clean up lost tooltips
	            d3.select('body').selectAll('div.tooltip').remove();
	            // Append tooltip
	            tooltipDiv = d3.select('body').append('div');
	            tooltipDiv.attr(attrs);
	            tooltipDiv.style(styles);
	            var absoluteMousePos = d3.mouse(bodyNode);
	            tooltipDiv.style({
	                left: (absoluteMousePos[0] + 10)+'px',
	                top: (absoluteMousePos[1] - 15)+'px',
	                position: 'absolute',
	                'z-index': 1001
	            });
	            // Add text using the accessor function, Crop text arbitrarily
	            tooltipDiv.style('width', function(d, i){ return (text(pD, pI).length > 80) ? '300px' : null; })
	                .html(function(d, i){return text(pD, pI);});
	        })
	        .on('mousemove.tooltip', function(pD, pI){
	            // Move tooltip
	            var absoluteMousePos = d3.mouse(bodyNode);
	            tooltipDiv.style({
	                left: (absoluteMousePos[0] + 10)+'px',
	                top: (absoluteMousePos[1] - 15)+'px'
	            });
	            // Keep updating the text, it could change according to position
	            tooltipDiv.html(function(d, i){ return text(pD, pI); });
	        })
	        .on('mouseout.tooltip', function(pD, pI){
	            // Remove tooltip
	            tooltipDiv.remove();
	        });

	    }

	    tooltip.attr = function(_x){
	        if (!arguments.length) return attrs;
	        attrs = _x;
	        return this;
	    };

	    tooltip.style = function(_x){
	        if (!arguments.length) return styles;
	        styles = _x;
	        return this;
	    };

	    tooltip.text = function(_x){
	        if (!arguments.length) return text;
	        text = d3.functor(_x);
	        return this;
	    };
	    return tooltip;	
	}

	//inputBox
	d3.helper.inputBox = function(okCallback,inputList,opts){

		var inputBox = d3.selectAll('.inputBox')
		  	.data([1]).enter().append('div')
  		  	.attr('class','inputBox').style('display','none');

  		d3.select('body').on('click.inputBox',function(e){
  			d3.select('.inputBox').style('display','none');
  		});

  		var html = '<a href="#close" title="Close" class="close"></a>';
  			html += '<form id="inputBoxForm">';
  			html += '<table>';
  			inputList.forEach(function(v,i,a){
  				html += '<tr>';
	  			html += '<td>'+v.name+'</td>';
	  			html += '<td><input type="text" id="'+v.id+'"/></td>';
	  			html += '</tr>';
  			});
  			html += '<td colspan="2"><input type="button" id="okBtn" value="확인" /></td>';
  			html += '</tr>';
  			html += '</table>';
  			html += '</form>';

  		d3.select('.inputBox').html(html);
  		d3.select('.inputBox').select('#okBtn').on('click.inputBoxOk',function(e){
  			var form = d3.select('.inputBox').select('#inputBoxForm')[0][0];
  			if(form){
  				if(okCallback && typeof okCallback === 'function'){
  					okCallback(form);
  				}
  				form.reset();
  			}
  			d3.select('.inputBox').style('display','none');
  		});
  		return {
  			open : function(elm,d,i){
  		  		d3.select('.inputBox').style('display','block')
  		  				.style('left',d3.event.pageX+'px')
  		  				.style('top',d3.event.pageY+'px');
  		  		document.getElementById('inputBoxForm').getElementsByTagName('input')[0].focus();
  		  	}
  		}
	};
})();

// //contextMenu
// //@author patorjk
// //@site https://github.com/patorjk/d3-context-menu
(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = function(d3) {
			d3.contextMenu = factory(d3);
			return d3.contextMenu;
		};
	} else {
		root.d3.contextMenu = factory(root.d3);
	}
})(	this, 
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
			return function(data, index) { //event parameters
				console.log('context');
				var elm = this;

				d3.selectAll('.d3-context-menu').html('');
				var list = d3.selectAll('.d3-context-menu').append('ul');
				list.selectAll('li').data(typeof menu === 'function' ? menu(data) : menu).enter()
					.append('li')
					.html(function(d) {
						return (typeof d.title === 'string') ? d.title : d.title(data);
					})
					.on('click', function(d, i) {
						console.log('cliose');
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
);
