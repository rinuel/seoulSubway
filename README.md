# seoulSubway
서울시 지하철 노선도

# OBJECT
##NODE(circle)
	- uid(key):  키
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
	- vertex : 버텍스
	- type: 타입

##VERTEX(circle)
	- uid(key) : 키
	- x : x좌표
	- y : y좌표
	- type: 타입

