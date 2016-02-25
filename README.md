# seoulSubway
서울시 지하철 노선도

# OBJECT
##NODE(circle)
	- uid(key):  키
	- subWayList : 정류장 정보 LIST
	- x: X좌표
	- y: Y좌표
	- info : 추가정보
	- type : 타입
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
	- lineNo: 호선 번호
  	- lineTy: 곡선 유형
	- type: 타입

##VERTEX(circle)
	- uid(key) : 키
	- link : 링크
	- x : x좌표
	- y : y좌표
	- type: 타입

