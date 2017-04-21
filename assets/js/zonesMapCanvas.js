$(document).ready(function() {

	const beaconCircleRadius = 5;
	var beaconRangeRadius;
	const beaconDefaultRadiusMeters = 50;
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

	var xmin = 99999999;
	var ymin = 99999999;
	var xmax = 0;
	var ymax = 0;

    mapImage.onload = function() {
    	canvas = document.getElementById("zonesMapCanvas");
    	context = canvas.getContext('2d');
    	document.getElementById("zonesMapCanvas").width = mapImage.width;
    	document.getElementById("zonesMapCanvas").height = mapImage.height;
    	context.drawImage(mapImage, 0, 0);
    	detectZones();
    	beaconRangeRadius = beaconDefaultRadiusMeters * (xmax - xmin) / document.getElementsByName("width")[0].value;
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

		var fileNameLength = mapImage.src.lastIndexOf('.') - mapImage.src.lastIndexOf('/') - 1;
		var folderName = mapImage.src.substr(mapImage.src.lastIndexOf('/')+1, fileNameLength);
		var fileName = folderName + "_ratio.csv";
		var str = "ratio\n" + (parseInt((xmax - xmin) / document.getElementsByName("width")[0].value)).toString();
		
		$.post("assets/requests/write_csv.php",{
            csvContent: str,
            folderName: folderName,
            fileName: fileName
        }).done(function( response ) {
        	
        });

		str = "Zone ID, Number of vertices, Vertices' coordinates\n";
		for(var i=0; i<noOfZones; i++){
			str = str + zones[i].no + ", " + zones[i].vertices.length + ", ";
			for(j=0; j<zones[i].vertices.length; j++){
				str = str + zones[i].vertices[j].x + ", " + zones[i].vertices[j].y;
				if(j<zones[i].vertices.length-1)
					str = str + ", ";
			}
			str = str + "\n";
		}

		fileName = folderName + "_zones.csv";

		$.post("assets/requests/write_csv.php",{
            csvContent: str,
            folderName: folderName,
            fileName: fileName
        }).done(function( response ) {
        	document.getElementById('beaconsNav').style.display = 'block';
        	$("#beacons").show();
        	numBeacons = 0;
        	drawBeaconMap();
            $("#beaconsNav").click();
        });
	});

	$("#submitBeaconsButton").click(function() {

		var str = "major, minor, xPos, yPos\n";
		for(var i=1; i<=numBeacons; i++){
			str = str + beacons[i].id + ", " + beacons[i].pos.x + ", " + beacons[i].pos.y + "\n";
		}

		var fileNameLength = mapImage.src.lastIndexOf('.') - mapImage.src.lastIndexOf('/') - 1;
		var folderName = mapImage.src.substr(mapImage.src.lastIndexOf('/')+1, fileNameLength);
		fileName = folderName + "_beacons.csv";

		$.post("assets/requests/write_csv.php",{
            csvContent: str,
            folderName: folderName,
            fileName: fileName
        }).done(function( response ) {
        	
        });
	});

	$("#beaconsMapCanvas").click(function() {

		var bodyRect = document.body.getBoundingClientRect()
    	var rect = document.getElementById("beaconsMapCanvas").getBoundingClientRect();
    	var x = event.pageX - rect.left + bodyRect.left;
		var y = event.pageY - rect.top + bodyRect.top;
		x = x*document.getElementById("beaconsMapCanvas").width/(rect.right-rect.left);
		y = y*document.getElementById("beaconsMapCanvas").height/(rect.bottom-rect.top);
		
		var r = beaconsContext.getImageData(x, y, 1, 1).data[0];
		var g = beaconsContext.getImageData(x, y, 1, 1).data[1];
		var b = beaconsContext.getImageData(x, y, 1, 1).data[2];
		var alpha = beaconsContext.getImageData(x, y, 1, 1).data[3];

		var pos = {x: x, y: y};

		if(alpha == 255 && !(r==255 && g==255 && b==255)){

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

	$("#beaconMajor").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#saveBeaconButton").click();
	    }
	});

	$("#beaconMinor").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#saveBeaconButton").click();
	    }
	});

	$("#saveBeaconButton").click(function() {
		beacons[clickedBeacon].id = document.getElementById("beaconMajor").value + ", " + document.getElementById("beaconMinor").value;
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

    	beaconsContext.globalAlpha = transparencyLevel;

    	for(var i=1; i<=numBeacons; i++) {
			beaconsContext.beginPath();
		    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
		    beaconsContext.fillStyle = 'red';
		    beaconsContext.fill();
		}

		for(var i=1; i<numBeacons; i++)
			for(var j=i+1; j<=numBeacons; j++)
				if(dist(beacons[i].pos, beacons[j].pos) < 2*beaconRangeRadius) {
					beaconsContext.save();
					beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
		    		beaconsContext.closePath();
		    		beaconsContext.clip();

		    		beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
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
				    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[k].pos.x, beacons[k].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
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
	}

	function createZone(x, y) {

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

		do {
			for(var d=-1; d<=2; d++) {
				if(hexColor == getPixelHexColor(x+dir[(currDir+d+4)%4].x, y+dir[(currDir+d+4)%4].y)){
					newDir = (currDir+d+4)%4;
					break;
				}
			}
			if(newDir != currDir){
				noOfVertices++;
				currDir = newDir;
				zones[noOfZones].vertices.push({x: x, y: y});
			}
			if(x < xmin)
				xmin = x;
			if(x > xmax)
				xmax = x;
			if(y < ymin)
				ymin = y;
			if(y > ymax)
				ymax = y;
			x = x+dir[currDir].x;
			y = y+dir[currDir].y;

		} while((x!=cx || y!=cy));

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
		    context.beginPath();
		    context.moveTo(zones[zoneNo].vertices[0].x, zones[zoneNo].vertices[0].y);
		    for(var i=1; i<zones[zoneNo].vertices.length; i++)
		    	context.lineTo(zones[zoneNo].vertices[i].x, zones[zoneNo].vertices[i].y);
		    context.closePath();
		    context.fill();
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

    	beaconsContext.globalAlpha = transparencyLevel;

    	for(var i=1; i<=numBeacons; i++) {
			beaconsContext.beginPath();
		    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
		    beaconsContext.fillStyle = 'red';
		    beaconsContext.fill();
		}

		for(var i=1; i<numBeacons; i++)
			for(var j=i+1; j<=numBeacons; j++)
				if(dist(beacons[i].pos, beacons[j].pos) < 2*beaconRangeRadius) {
					beaconsContext.save();
					beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
		    		beaconsContext.closePath();
		    		beaconsContext.clip();

		    		beaconsContext.beginPath();
		    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
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
				    		beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[j].pos.x, beacons[j].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
				    		beaconsContext.closePath();
				    		beaconsContext.clip();

				    		beaconsContext.beginPath();
				    		beaconsContext.arc(beacons[k].pos.x, beacons[k].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
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
			    beaconsContext.arc(beacons[i].pos.x, beacons[i].pos.y, beaconRangeRadius, 0, 2 * Math.PI, false);
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

		document.getElementById('popup-content').style.left = newX + "px";
		document.getElementById('popup-content').style.top = newY + "px";

		highlightClicked(clickedZone);
	}

	function showBeaconPopup(x, y) {
		$("#beaconPopup").show();

		document.getElementById("beaconMajor").value = beacons[clickedBeacon].id.substr(0, beacons[clickedBeacon].id.lastIndexOf(','));
		document.getElementById("beaconMinor").value = beacons[clickedBeacon].id.substr(beacons[clickedBeacon].id.lastIndexOf(',') + 2);

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
