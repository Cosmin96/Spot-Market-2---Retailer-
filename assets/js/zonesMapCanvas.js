$(document).ready(function() {

	const beaconCircleRadius = 5;
	const beaconRangeRadius = 50;
	const transparencyLevel = 0.3;
	var numBeacons = 0;
	var beacons = [];

	var canvas;
    var context;
    var beaconsCanvas;

    var zones = [];
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
		
		//console.log(x + " " + y);
		
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
		var str = "Number of vertices, Vertices' coordinates, Zone ID\n";
		for(var i=0; i<noOfZones; i++){
			str = str + zones[i].vertices.length + ", ";
			for(j=0; j<zones[i].vertices.length; j++){
				str = str + zones[i].vertices[j].x + ", " + zones[i].vertices[j].y + ", ";
			}
			str = str + zones[i].no + "\n";
			// var x1 = zones[i].x1 / canvas.width;
			// var y1 = zones[i].y1 / canvas.height;
			// var x2 = zones[i].x2 / canvas.width;
			// var y2 = zones[i].y2 / canvas.height;
			// str = str+x1+", "+y1+", "+x2+", "+y2+", "+zones[i].no+"\n"; 
		}

		var fileNameLength = mapImage.src.lastIndexOf('.') - mapImage.src.lastIndexOf('/') - 1;
		var fileName = mapImage.src.substr(mapImage.src.lastIndexOf('/')+1, fileNameLength); 

		$.post("assets/requests/csv.php",{
            zonesString: str,
            fileName: fileName
        }).done(function( response ) {
        	document.getElementById('beaconsNav').style.display = 'block';
        	$("#beacons").show();
        	numBeacons = 0;
        	drawBeaconMap();
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
		//console.log(x+" "+y+" "+alpha);

		var pos = {x: x, y: y};

		if(alpha == 255){
			for(var i = 1; i <= numBeacons; i++){
				if(dist(beacons[i].pos, pos) < beaconCircleRadius){
					clickedBeacon = i;
					showBeaconPopup(event.clientX, event.clientY);
				    return;
	    		}
			}

			addBeacon(pos);

			drawBeaconMap();
		}
		//closePopup();
	});

	function addBeacon(pos){
		numBeacons++;
		beacons[numBeacons] = new Object();
		beacons[numBeacons].pos = pos;
		beacons[numBeacons].id = "";
	}

	function dist(a, b){
	  	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
	}

	$("#beaconIdInput").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#saveBeaconButton").click();
	    }
	});

	$("#saveBeaconButton").click(function() {
		beacons[clickedBeacon].id = document.getElementById("beaconIdInput").value;
		for(var i=1; i<=numBeacons; i++)
			if(beacons[i].id == beacons[clickedBeacon].id && i != clickedBeacon)
				beacons[i].id = "";
		closeBeaconPopup();
	});

	$("#deleteBeaconButton").click(function() {
		for(var i=clickedBeacon; i<numBeacons; i++)
			beacons[i] = beacons[i+1];
		numBeacons--;
		closeBeaconPopup();
		drawBeaconMap();
	});

	function drawBeaconMap() {
		beaconsCanvas = document.getElementById("beaconsMapCanvas");
    	beaconsContext = beaconsCanvas.getContext('2d');
    	document.getElementById("beaconsMapCanvas").width = mapImage.width;
    	document.getElementById("beaconsMapCanvas").height = mapImage.height;

    	beaconsContext.clearRect(0, 0, beaconsCanvas.width, beaconsCanvas.height);

    	beaconsContext.globalAlpha = 1;
    	//beaconsContext.drawImage(mapImage, 0, 0);

    	//beaconsContext.globalCompositeOperation = 'source-atop';
    	beaconsContext.globalAlpha = transparencyLevel;

    	for(var i=1; i<=numBeacons; i++) {
			beaconsContext.beginPath();
		    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
		    beaconsContext.fillStyle = 'red';
		    //beaconsContext.lineWidth = 0;
		    beaconsContext.fill();
		    //beaconsContext.stroke();

		    console.log(beaconsContext.getImageData(beacons[i].pos.x, beacons[i].pos.y, 1, 1).data[0]);
		    console.log(beaconsContext.getImageData(beacons[i].pos.x, beacons[i].pos.y, 1, 1).data[1]);
		    console.log(beaconsContext.getImageData(beacons[i].pos.x, beacons[i].pos.y, 1, 1).data[2]);
		    console.log(beaconsContext.getImageData(beacons[i].pos.x, beacons[i].pos.y, 1, 1).data[3]);
		    console.log(" ");
		}

		for(var i=1; i<numBeacons; i++)
			for(var j=i+1; j<=numBeacons; j++)
				if(dist(beacons[i].pos, beacons[j].pos) < 2*beaconRangeRadius) {
					beaconsContext.save();
					beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
		    		beaconsContext.closePath();
		    		beaconsContext.clip();

		    		beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
		    		beaconsContext.closePath();
		    		beaconsContext.clip();

		    		beaconsContext.clearRect(0, 0, mapImage.width, mapImage.height);

		    		beaconsContext.rect(0, 0, mapImage.width, mapImage.height);
		    		beaconsContext.fillStyle = 'blue';
		    		beaconsContext.fill();

		    		beaconsContext.restore();	
				}

		for(var i=1; i<numBeacons-1; i++)
			for(var j=i+1; j<numBeacons; j++)
				if(dist(beacons[i].pos, beacons[j].pos) < 2*beaconRangeRadius) {
					for(var k=j+1; k<=numBeacons; k++)
						if(dist(beacons[i].pos, beacons[k].pos) < 2*beaconRangeRadius && dist(beacons[j].pos, beacons[k].pos) < 2*beaconRangeRadius) {
							beaconsContext.save();
							beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[k].pos.x, beacons[k].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.clearRect(0, 0, mapImage.width, mapImage.height);

				    		beaconsContext.rect(0, 0, mapImage.width, mapImage.height);
				    		beaconsContext.fillStyle = 'green';
				    		beaconsContext.fill();

				    		beaconsContext.restore();	
						}
				}
		
		beaconsContext.globalAlpha = 1;
		beaconsContext.globalCompositeOperation = 'destination-atop';
    	beaconsContext.drawImage(mapImage, 0, 0);

    	beaconsContext.globalCompositeOperation = 'source-over';
    	beaconsContext.globalAlpha = 1;

		for(var i=1; i<=numBeacons; i++) {
			beaconsContext.beginPath();
		    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius, 0, 2 * Math.PI, false);
		    beaconsContext.fillStyle = 'red';
		    beaconsContext.fill();
		    beaconsContext.stroke();
		}
	}

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
		// print zones for testing
	}

	function createZone(x, y) {

		//console.log(x + " " + y);

		// array for changing direction on the map: 0 for left, 1 for up, 2 for right, 3 for down
		var dir = [{x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}];

		hexColor = getPixelHexColor(x,y);

		while(hexColor === getPixelHexColor(x,y)){
			x--;
		}
		x++;

		var cx = x;
		var cy = y;
		var currDir = 1;
		var newDir = 1;
		var noOfVertices = 0;
		
		zones.push({no: noOfZones+1, vertices: []});
		//zones[noOfZones] = [];

		do {
			for(var d=-1; d<=2; d++) {
				if(hexColor == getPixelHexColor(x+dir[(currDir+d+4)%4].x, y+dir[(currDir+d+4)%4].y)){
					newDir = (currDir+d+4)%4;
					break;
				}
			}
			if(newDir != currDir){
				//console.log(noOfVertices + " " + hexColor + " " + getPixelHexColor(x+dir[currDir].x, y+dir[currDir].y));
				//console.log(x + " " + y + " " + cx + " " + cy);
				//console.log(currDir + " " + newDir);
				noOfVertices++;
				currDir = newDir;
				zones[noOfZones].vertices.push({x: x, y: y});
			}
			x = x+dir[currDir].x;
			y = y+dir[currDir].y;

		} while((x!=cx || y!=cy));

		/*console.log(zones[noOfZones].vertices.length);
		for(i=0; i<noOfVertices; i++){
			//console.log(i);
			console.log(noOfZones + ": " + zones[noOfZones].vertices[i].x + ", " + zones[noOfZones].vertices[i].y);
		}*/

		noOfZones++;
	}

	function getPixelHexColor(x, y) {
		var pixelData = context.getImageData(x, y, 1, 1);
		var r = pixelData.data[0];
		var g = pixelData.data[1];
		var b = pixelData.data[2];
		var alpha = pixelData.data[3];
		if(alpha != 255)
			return "";
		return r.toString(16) + g.toString(16) + b.toString(16);
	}

	function pointInPolygon(point, polygon) {

		var i, j;
		var c = false;

		for(i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
	    	if(((polygon[i].y >= point.y ) != (polygon[j].y >= point.y) ) && (point.x <= (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x))
	      		c = !c;
	      	if((polygon[i].y == polygon[j].y && polygon[i].y == point.y) || (polygon[i].x == polygon[j].x && polygon[i].x == point.x))
				return true;
		}

		return c;
	}

	function getZone(x, y) {
		for(var i=0; i<noOfZones; i++) {
			if(pointInPolygon({x: x, y: y}, zones[i].vertices))
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
		    //context.strokeStyle = "black"; 
		    context.beginPath();
		    context.moveTo(zones[zoneNo].vertices[0].x, zones[zoneNo].vertices[0].y);
		    for(var i=1; i<zones[zoneNo].vertices.length; i++)
		    	context.lineTo(zones[zoneNo].vertices[i].x, zones[zoneNo].vertices[i].y);
		    context.closePath();
		    context.fill();
		    //context.stroke();
			//context.fillRect(zone.x1, zone.y1, zone.x2-zone.x1, zone.y2-zone.y1); 
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
			    context.beginPath();
			    context.moveTo(zones[i].vertices[0].x, zones[i].vertices[0].y);
			    for(var j=1; j<zones[i].vertices.length; j++)
			    	context.lineTo(zones[i].vertices[j].x, zones[i].vertices[j].y);
			    context.closePath();
			    context.fill();
				context.fillRect(zone.x1, zone.y1, zone.x2-zone.x1, zone.y2-zone.y1); 
			}
		}
	}

	function highlightClickedBeacon(beaconIndex) {
		beaconsCanvas = document.getElementById("beaconsMapCanvas");
    	beaconsContext = beaconsCanvas.getContext('2d');
    	document.getElementById("beaconsMapCanvas").width = mapImage.width;
    	document.getElementById("beaconsMapCanvas").height = mapImage.height;

    	beaconsContext.clearRect(0, 0, beaconsCanvas.width, beaconsCanvas.height);

    	beaconsContext.globalAlpha = 1;
    	//beaconsContext.drawImage(mapImage, 0, 0);

    	//beaconsContext.globalCompositeOperation = 'source-atop';
    	beaconsContext.globalAlpha = transparencyLevel;

    	for(var i=1; i<=numBeacons; i++) {
			beaconsContext.beginPath();
		    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
		    beaconsContext.fillStyle = 'red';
		    beaconsContext.fill();
		}

		for(var i=1; i<numBeacons; i++)
			for(var j=i+1; j<=numBeacons; j++)
				if(dist(beacons[i].pos, beacons[j].pos) < 2*beaconRangeRadius) {
					beaconsContext.save();
					beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
		    		beaconsContext.closePath();
		    		beaconsContext.clip();

		    		beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
		    		beaconsContext.closePath();
		    		beaconsContext.clip();

		    		beaconsContext.clearRect(0, 0, mapImage.width, mapImage.height);

		    		beaconsContext.rect(0, 0, mapImage.width, mapImage.height);
		    		beaconsContext.fillStyle = 'blue';
		    		beaconsContext.fill();

		    		beaconsContext.restore();	
				}

		for(var i=1; i<numBeacons-1; i++)
			for(var j=i+1; j<numBeacons; j++)
				if(dist(beacons[i].pos, beacons[j].pos) < 2*beaconRangeRadius) {
					for(var k=j+1; k<=numBeacons; k++)
						if(dist(beacons[i].pos, beacons[k].pos) < 2*beaconRangeRadius && dist(beacons[j].pos, beacons[k].pos) < 2*beaconRangeRadius) {
							beaconsContext.save();
							beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[k].pos.x, beacons[k].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.clearRect(0, 0, mapImage.width, mapImage.height);

				    		beaconsContext.rect(0, 0, mapImage.width, mapImage.height);
				    		beaconsContext.fillStyle = 'green';
				    		beaconsContext.fill();

				    		beaconsContext.restore();	
						}
				}
		
		for(var i=1; i<=numBeacons; i++) 
			if(i == beaconIndex){
				beaconsContext.beginPath();
			    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius*10, 0, 2 * Math.PI, false);
			    beaconsContext.fillStyle = 'yellow';
			    beaconsContext.fill();
			}

		beaconsContext.globalAlpha = 1;
		beaconsContext.globalCompositeOperation = 'destination-atop';
    	beaconsContext.drawImage(mapImage, 0, 0);

    	beaconsContext.globalCompositeOperation = 'source-over';
    	beaconsContext.globalAlpha = 1;

		for(var i=1; i<=numBeacons; i++) {
			beaconsContext.beginPath();
		    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconCircleRadius, 0, 2 * Math.PI, false);
		    if(i == beaconIndex)
		    	beaconsContext.fillStyle = 'yellow';
		    else
		    	beaconsContext.fillStyle = 'red';
		    beaconsContext.fill();
		    beaconsContext.stroke();
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

	function showBeaconPopup(x, y) {
		$("#beaconPopup").show();

		document.getElementById("beaconIdInput").value = beacons[clickedBeacon].id;

		var newX = x + 40;
		var newY = y - (parseInt($("#beaconPopupContent").css("height"),10))/2;

		if(newX+(parseInt($("#beaconPopupContent").css("width"),10))+10 > window.innerWidth)
			newX = x - parseInt($("#beaconPopupContent").css("width"),10) - 40;
		if(newY < 10)
			newY = 10;
		if(newY+parseInt($("#beaconPopupContent").css("height"),10)+10 > window.innerHeight)
			newY = window.innerHeight - parseInt($("#beaconPopupContent").css("height"),10) - 10;

		document.getElementById('beaconPopupContent').style.left = newX + "px";
		document.getElementById('beaconPopupContent').style.top = newY + "px";

		highlightClickedBeacon(clickedBeacon);
	}

	function closePopup() {
		highlight(-1);
		clickedZone = -1;
		$("#popup").hide();
	}

	function closeBeaconPopup() {
		drawBeaconMap();
		clickedBeacon = -1;
		$("#beaconPopup").hide();
	}

	window.onclick = function(event) {
		var popup = document.getElementById('popup');
		if (event.target == popup) {
		    closePopup();
		    return;
		}
		popup = document.getElementById('beaconPopup');
		if (event.target == popup) {
		    closeBeaconPopup();
		    return;
		}
	}

});
