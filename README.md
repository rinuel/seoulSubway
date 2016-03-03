# seoulSubway
서울시 지하철 노선도

# OBJECT
##NODE(circle)
	- uid(key):  키
	- sttnId : 정류장 ID
	- line : 호선
	- x: X좌표
	- y: Y좌표
	- info : 추가정보
	- type : 타입
	- frcode : {
		x: 상대 x좌표
		y: 상대 y좌표
		anchor : 'middle',
		rotate : 회전각도
		text : 텍스트 
	}
	- textInfo : {
		x: 상대 x좌표
		y: 상대 y좌표
		anchor : 'middle',
		rotate : 회전각도
		text : 텍스트 
	}
##RPNODE(ellipse)
	- uid(key):  키
	- rpid :대표역 키
	- textInfo : {
		x: 상대 x좌표
		y: 상대 y좌표
		anchor : 'middle',
		rotate : 회전각도
		text : 텍스트 
	}	

##LINK(path)
	- uid(key): 키
	- node1: 노드1
	- node2: 노드2
	- line : 호선
	- lineNo: 호선 번호
  	- lineTy: 곡선 유형
	- type: 타입

##VERTEX(circle)
	- uid(key) : 키
	- link : 링크
	- x : x좌표
	- y : y좌표
	- sn : 링크상 버텍스 순서
	- type: 타입

