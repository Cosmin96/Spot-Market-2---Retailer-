$(document).ready(function() {

	var canvas;
    var context;
    var beaconsCanvas

    var zones = new Array(100);
	var noOfZones = 0;
	var highlightedZone = -1;
	var clickedZone = -1;

    mapImage.onload = function() {
    	canvas = document.getElementById("zonesMapCanvas");
    	context = canvas.getContext('2d');
    	document.getElementById("zonesMapCanvas").width = mapImage.width;
    	document.getElementById("zonesMapCanvas").height = mapImage.height;
    	context.drawImage(mapImage, 0, 0);
    	detectZones();
    };

    $(document).mousemove(function() {
    	if(noOfZones == 0)
    		return;
	    var bodyRect = document.body.getBoundingClientRect()
    	var rect = document.getElementById("zonesMapCanvas").getBoundingClientRect();
    	var x = event.pageX - rect.left + bodyRect.left;
		var y = event.pageY - rect.top + bodyRect.top;
		x = x*document.getElementById("zonesMapCanvas").width/(rect.right-rect.left);
		y = y*document.getElementById("zonesMapCanvas").height/(rect.bottom-rect.top);
		var alpha = context.getImageData(x, y, 1, 1).data[3];
		
		if(alpha !== 0 && clickedZone == -1){

			zoneNo = getZone(x, y);
			if(zoneNo != -1)
				if(highlightedZone != zoneNo)
					highlight(zoneNo);

    	}
    	else {

    		if(highlightedZone != -1 && clickedZone == -1)
    			highlight(-1);

		}
	});

	$("#zonesMapCanvas").click(function() {
    	var bodyRect = document.body.getBoundingClientRect()
    	var rect = document.getElementById("zonesMapCanvas").getBoundingClientRect();
    	var x = event.pageX - rect.left + bodyRect.left;
		var y = event.pageY - rect.top + bodyRect.top;
		x = x*document.getElementById("zonesMapCanvas").width/(rect.right-rect.left);
		y = y*document.getElementById("zonesMapCanvas").height/(rect.bottom-rect.top);
		var alpha = context.getImageData(x, y, 1, 1).data[3];

		clickedZone = getZone(x, y);

		if(clickedZone != -1)
			showPopup(event.clientX, event.clientY);
    });

    $("#zoneNoInput").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#saveZoneNoButton").click();
	    }
	});

	$("#saveZoneNoButton").click(function() {
		zones[clickedZone].no = document.getElementById("zoneNoInput").value;
		for(var i=0; i<noOfZones; i++)
			if(zones[i].no == zones[clickedZone].no && i != clickedZone)
				zones[i].no = "";
		closePopup();
	});

	$("#submitZonesButton").click(function() {

		for(var i=0; i<noOfZones-1; i++)
			for(var j=i+1; j<noOfZones; j++){
				if(zones[i].no > zones[j].no){
					var aux = zones[i];
					zones[i] = zones[j];
					zones[j] = aux;
				}
			}
		var str = "x1, y1, x2, y2, no\n";
		for(var i=0; i<noOfZones; i++){
			var x1 = zones[i].x1 / canvas.width;
			var y1 = zones[i].y1 / canvas.height;
			var x2 = zones[i].x2 / canvas.width;
			var y2 = zones[i].y2 / canvas.height;
			str = str+x1+", "+y1+", "+x2+", "+y2+", "+zones[i].no+"\n"; 
		}

		var fileNameLength = mapImage.src.lastIndexOf('.') - mapImage.src.lastIndexOf('/') - 1;
		var fileName = mapImage.src.substr(mapImage.src.lastIndexOf('/')+1, fileNameLength); 

		$.post("assets/requests/csv.php",{
            zonesString: str,
            fileName: fileName
        }).done(function( response ) {
        	$("#beacons").show();
        	beaconsCanvas = document.getElementById("beaconsMapCanvas");
	    	beaconsContext = beaconsCanvas.getContext('2d');
	    	document.getElementById("beaconsMapCanvas").width = mapImage.width;
	    	document.getElementById("beaconsMapCanvas").height = mapImage.height;
	    	beaconsContext.drawImage(mapImage, 0, 0);
            $("#beaconsNav").click();
        });    
		//closePopup();
	});

	$("#beaconsMapCanvas").click(function() {

		var bodyRect = document.body.getBoundingClientRect()
    	var rect = document.getElementById("beaconsMapCanvas").getBoundingClientRect();
    	var x = event.pageX - rect.left + bodyRect.left;
		var y = event.pageY - rect.top + bodyRect.top;
		x = x*document.getElementById("beaconsMapCanvas").width/(rect.right-rect.left);
		y = y*document.getElementById("beaconsMapCanvas").height/(rect.bottom-rect.top);
		var alpha = beaconsContext.getImageData(x, y, 1, 1).data[3];
		console.log(x+" "+y+" "+alpha);
		if(alpha == 255){
			beaconsContext.beginPath();
		    beaconsContext.arc(x, y, 5, 0, 2 * Math.PI, false);
		    beaconsContext.fillStyle = 'red';
		    beaconsContext.fill();
		    beaconsContext.stroke();
		    console.log("bbb");
		}
		//closePopup();
	});

	function detectZones() {
		for(var i=0; i<mapImage.height; i+=10)
			for(var j=0; j<mapImage.width; j+=10) {
				var pixelData = context.getImageData(j, i, 1, 1);
				var r = pixelData.data[0];
				var g = pixelData.data[1];
				var b = pixelData.data[2];
				var alpha = pixelData.data[3];
				if(alpha==255 && !(r==255 && g==255 && b==255) && getZone(j, i)==-1){
					createZone(j, i);
				}
			}
		// console.log(noOfZones);
		// for(var i=0; i<noOfZones; i++){
		// 	console.log(zones[i].x1 + " " + zones[i].y1 + " " + zones[i].x2 + " " + zones[i].y2);
		// }
	}

	function createZone(x, y) {

		hexColor = getPixelHexColor(x,y);

		while(hexColor === getPixelHexColor(x,y)){
			y--;
		}
		y++;
		while(hexColor === getPixelHexColor(x,y)){
			x--;
		}
		x++;
		var cx = x;
		var cy = y;

		while(hexColor === getPixelHexColor(x,y)){
			x+=10;
		}
		while(hexColor !== getPixelHexColor(x,y)){
			x--;
		}
		while(hexColor === getPixelHexColor(x,y)){
			y+=10;
		}
		while(hexColor !== getPixelHexColor(x,y)){
			y--;
		}

		zones[noOfZones++] = {x1: cx, y1: cy, x2: x+1, y2: y+1, no: noOfZones};
	}

	function getPixelHexColor(x, y) {
		var pixelData = context.getImageData(x, y, 1, 1);
		var r = pixelData.data[0];
		var g = pixelData.data[1];
		var b = pixelData.data[2];
		return r.toString(16) + g.toString(16) + b.toString(16);
	}

	function getZone(x, y) {
		for(var i=0; i<noOfZones; i++) {
			if(x>=zones[i].x1 && y>=zones[i].y1)
				if(x<=zones[i].x2 && y<=zones[i].y2)
					return i;
		}
		return -1;
	}

	function highlight(zoneNo){
		highlightedZone = zoneNo;
		document.getElementById("zonesMapCanvas").width = mapImage.width;
		document.getElementById("zonesMapCanvas").height = mapImage.height;
		context.globalAlpha = 1.0;
		context.drawImage(mapImage, 0, 0);
		if(zoneNo != -1) {
			zone = zones[zoneNo];
			context.globalAlpha = 0.1;
		    context.fillStyle = "black"; 
			context.fillRect(zone.x1, zone.y1, zone.x2-zone.x1, zone.y2-zone.y1); 
		}
	}

	function highlightClicked(zoneNo) {
		document.getElementById("zonesMapCanvas").width = mapImage.width;
		document.getElementById("zonesMapCanvas").height = mapImage.height;
		context.globalAlpha = 1.0;
		context.drawImage(mapImage, 0, 0);
		for(var i=0; i<noOfZones; i++){
			if(i != zoneNo){
				zone = zones[i];
				context.globalAlpha = 0.7;
			    context.fillStyle = "black"; 
				context.fillRect(zone.x1, zone.y1, zone.x2-zone.x1, zone.y2-zone.y1); 
			}
		}
	}

	function showPopup(x, y) {
		$("#popup").show();

		document.getElementById("zoneNoInput").value = zones[clickedZone].no;

		var newX = x + 40;
		var newY = y - (parseInt($("#popup-content").css("height"),10))/2;

		if(newX+(parseInt($("#popup-content").css("width"),10))+10 > window.innerWidth)
			newX = x - parseInt($("#popup-content").css("width"),10) - 40;
		if(newY < 10)
			newY = 10;
		if(newY+parseInt($("#popup-content").css("height"),10)+10 > window.innerHeight)
			newY = window.innerHeight - parseInt($("#popup-content").css("height"),10) - 10;

		// newY = window.innerHeight - parseInt($("#popup-content").css("height"),10) - 10;
		// newX = window.innerWidth - parseInt($("#popup-content").css("width"),10) - 30;


		document.getElementById('popup-content').style.left = newX + "px";
		document.getElementById('popup-content').style.top = newY + "px";

		highlightClicked(clickedZone);
	}

	function closePopup() {
		highlight(-1);
		clickedZone = -1;
		$("#popup").hide();
	}

	window.onclick = function(event) {
		var popup = document.getElementById('popup');
		if (event.target == popup) {
		    closePopup();
		    return;
		}
	}

});
