//闭包

//图片数组切换
function anigo(d){
	//图片数组索引下标0/1/2/3，第一维
	imgArrIndex += d;
	//html ul li 遍历列表
	$imglist.each(function(i){ //i 为li的索引
		//获取 li 的jquery对象
		var $thisItme = $(this);
		$thisItme.append($targetImg);
		//获取 li 的jquery对象的子节点 img
		var $thisimg = $thisItme.children('img');
		//获取图片数组的存储路径数据并设置成jQuery对象
		var $targetImg = $(imgAll[imgArrIndex][i]);
		//将路径赋给 li 的jquery对象
		//定义图片的初始原点、角度
		$targetImg.transfrom({origin:origin,rotate:(0-d)*imgAng+"deg"});

		//图片动画
		$thisimg.animate({rotate:imgAng*d+"deg"});
		$targetImg.animate({rotate:"0deg"});
	});
}