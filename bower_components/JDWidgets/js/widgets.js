(function(){
	//
	var winW = window.innerWidth;
	var winH = window.innerHeight;
	ACWidgets = {};

	ACWidgets.init = function(){
		//property 
		//make overlay
		var dialogOverlay = document.createElement('div');
		dialogOverlay.id = 'dialogOverlay';
		document.body.appendChild(dialogOverlay);

		//다이어로그 틀 생성.
		var dialogBox = document.createElement('div');
		var dialogContainer = document.createElement('div');
		var dialogBoxHead = document.createElement('div');
		var dialogBoxBody = document.createElement('div');
		var dialogBoxFoot = document.createElement('div');

		dialogBox.id = 'dialogBox';
		dialogBoxHead.id = 'dialogBoxHead';
		dialogBoxBody.id = 'dialogBoxBody';
		dialogBoxFoot.id = 'dialogBoxFoot';

		dialogContainer.appendChild(dialogBoxHead);
		dialogContainer.appendChild(dialogBoxBody);
		dialogContainer.appendChild(dialogBoxFoot);
		dialogBox.appendChild(dialogContainer);
		document.body.appendChild(dialogBox);

		return {
			alert : {
				render : function(param){
					var dialog  = param.dialog || '';
					var head = param.head || '';
					var okCallBack  = param.okFunc || this.ok;

					dialogOverlay.style.display = "block";
					dialogOverlay.style.height = winH+'px';

					dialogBox.style.left = (winW/2) - (550 * .5)+"px";
					dialogBox.style.top = "100px";
					dialogBox.style.display = "block";

					dialogBoxHead.innerHTML = head;
					dialogBoxBody.innerHTML = dialog;
					dialogBoxFoot.innerHTML = '<button id="ACWidgets_alert_OK">확인</button>';

					document.getElementById('ACWidgets_alert_OK').addEventListener('click',function(){
						dialogOverlay.style.display = "none";	
						dialogBox.style.display = "none";
						okCallBack();
					});
				},
				ok : function(evt){}
			},
			confirm : {
				render : function(param){
					var dialog = param.dialog || '';
					var head = param.head || '';
					var okCallBack = param.okCallBack || this.ok;
					var cancelCallBack = param.cancelCallBack || this.cancel;

					dialogOverlay.style.display = "block";
					dialogOverlay.style.height = winH+'px';

					dialogBox.style.left = (winW/2) - (550 * .5)+"px";
					dialogBox.style.top = "100px";
					dialogBox.style.display = "block";

					dialogBoxHead.innerHTML = head;
					dialogBoxBody.innerHTML = dialog;
					dialogBoxFoot.innerHTML = '<button id="ACWidgets_confirm_OK">확인</button>'+
					'<button id="ACWidgets_confirm_Cancel">취소</button>';

					document.getElementById('ACWidgets_confirm_OK').addEventListener('click',function(){
						dialogOverlay.style.display = "none";	
						dialogBox.style.display = "none";
						okCallBack();
					});
					document.getElementById('ACWidgets_confirm_Cancel').addEventListener('click',function(){
						dialogOverlay.style.display = "none";	
						dialogBox.style.display = "none";
						cancelCallBack();
					});
				},	
				ok : function(){},
				cancel : function(){},
			}
		}
	};
})();