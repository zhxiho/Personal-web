$(document).ready(function(){


	// showtime();
	function check ( num ){
		if ( num < 10 ) {
			num = '0'+num;
		}
		return num;
	}
	// function showtime(){
	// 	var date = new Date();
	// 	var year = date.getFullYear();
	// 	var month = date.getMonth();
	// 	var mydate = date.getDate();
	// 	var d = date.getDay();
	// 	var h = date.getHours();
	// 	var m = date.getMinutes();
	// 	var s = date.getSeconds();
	// 	m = check(m);
	// 	s = check(s);
	// 	var weekday = new Array(7);
	// 	weekday[0] = "星期日";
	// 	weekday[1] = "星期一";
	// 	weekday[2] = "星期二";
	// 	weekday[3] = "星期三";
	// 	weekday[4] = "星期四";
	// 	weekday[5] = "星期五";
	// 	weekday[6] = "星期六";

	// 	$("#Time").html(year+'年'+month+'月'+mydate+'日'+weekday[d]+h+':'+m+':'+s);
	// 	setTimeout(showtime,500);
	// }

	setInterval(function(){
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth();
		var mydate = date.getDate();
		var d = date.getDay();
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		m = check(m);
		s = check(s);
		var weekday = new Array(7);
		weekday[0] = "星期日";
		weekday[1] = "星期一";
		weekday[2] = "星期二";
		weekday[3] = "星期三";
		weekday[4] = "星期四";
		weekday[5] = "星期五";
		weekday[6] = "星期六";
		$("#Time").html(year+'年'+month+'月'+mydate+'日  '+weekday[d]+'   '+h+':'+m+':'+s);
		setInterval();
	},500);


});