$(document).ready(function(){

	function CreateXmlHttp(){
		//非Ie浏览器创建XmlHttpRequest对象
		if (window.XmlHttpRequest) {
			xmlhttp = new XmlHttpRequest;
		}
		if (window.ActiveXObjiect) {
			try{
				xmlhttp = new ActiveXObject("Microsoft.XmlHTTP");
			}
			catch (e){
				try{
					xmlhttp = new ActiveXObject("msxml2.XmlHTTP");
				}
				catch (ex){

				}
			}
		}
	}
	function Ust(){
		var data = $("#ID").val();
		CreateXmlHttp();
		if (!xmlhttp) {
			alert("创建xmlhttp对象异常");
			return false;
		}
		xmlhttp.open("POST",url,false);
		xmlhttp.onreadystatechange = function (){
			if (xmlhttp.readyState == 4) {
				$("#ID").text("数据正在加载");
				if (xmlhttp.status == 200) {
					$("#ID").text(xmlhttp.responseText);
				}
			}
		}
		xmlhttp.send();
	}


});