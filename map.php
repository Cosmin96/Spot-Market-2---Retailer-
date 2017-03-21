<!DOCTYPE HTML>
<!--
	Hyperspace by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->
<html>
	<head>
		<title>Microsoft Spotmarket for retailers</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<!--[if lte IE 8]><script src="assets/js/ie/html5shiv.js"></script><![endif]-->
		<link rel="stylesheet" href="assets/css/main.css" />
		<link rel="stylesheet" href="assets/css/style.css" />
		<!--[if lte IE 9]><link rel="stylesheet" href="assets/css/ie9.css" /><![endif]-->
		<!--[if lte IE 8]><link rel="stylesheet" href="assets/css/ie8.css" /><![endif]-->


	</head>
	<body>

		<!-- Sidebar -->
		<script>
        	var mapImage = new Image();
        </script>
		<section id="sidebar">
			<div class="inner">
				<nav>
					<ul>
						<li><a href="#intro">Upload a map</a></li>
						<?PHP
							$ok = 0;
		                	if(isset($_FILES['upfile']))
		                    {
		                    	if(is_uploaded_file($_FILES['upfile']['tmp_name'])){
		            
		                            //save the uploaded file information
		                            $name=$_FILES["upfile"]["name"];//Upload file name
		                            $type=$_FILES["upfile"]["type"];//Upload file type 
		                            $size=$_FILES["upfile"]["size"];//Upload file size
		                            $tmp_name=$_FILES["upfile"]["tmp_name"];//Upload file temparary path
		            
		                            //check if img 
		                            switch ($type){
		                                case 'image/pjpeg':
		                                        $okType=true;
		                                        break;
		                                case 'image/jpg':
		                                        $okType=true;
		                                        break;
		                                case 'image/jpeg':
		                                        $okType=true;
		                                        break;
		                                case 'image/gif':
		                                        $okType=true;
		                                        break;
		                                case 'image/png':
		                                        $okType=true;
		                                        break;
		                            }
		            
		                            if($okType === true){
		            
		                                $error=$_FILES["upfile"]["error"];//return value after upload
		        
		                                //move the temparary file path to a specific path
		                                $destination="files/".$name;
		                                move_uploaded_file($tmp_name,$destination);
		                                $isMoved = move_uploaded_file($tmp_name,$destination);
		                                echo $isMoved;
		        
		                                switch ($error) {
		                                    case 0:
		                                    	$ok = 1;
		                ?>
		                						<li><a id="zonesNav" href="#zones">Select zones</a></li>
		                						<li><a id="beaconsNav" href="#beacons" style="display: none">Place your beacons</a></li>
		                						<script>
		                							document.getElementById('zonesNav').click();
		                						</script>
		                <?php
		                                        break;
		                                    case 1:
		                                        echo "Exceed file size, set in php.ini file";
		                                        break;
		                                    case 2:
		                                        echo "Exceed MAX_FILE_SIZE";
		                                        break;
		                                    case 3:
		                                        echo "Incomplete Upload";
		                                        break;
		                                    case 4:
		                                        echo "Nothing Uploaded";
		                                        break;
		                                    default:
		                                        echo "Upload file size is 0";
		                                        break;
		                                }
		                            }else{
		                                echo "Unrecognized type！";
		                            }
		                        }
		                    }
		                ?>
					</ul>
				</nav>
			</div>
		</section>

		<!-- Wrapper -->
		<div id="wrapper">

			<!-- Intro -->
				<section id="intro" class="wrapper style1 fullscreen fade-up">
					<div class="inner">
						<h1>Upload your store's map</h1>
						<form action="map.php" enctype="multipart/form-data" method="post" name="uploadfile">
                            Uploaded file：
                            <input type="file" name="upfile" />
                            <br> 
                            <input type="submit" value="Upload" />
                        </form>
                    </div>
				</section>
                <?php
                	if($ok == 1) {
                ?>       
                		<br>

						<section id="zones" class="wrapper style1 fullscreen fade-up">
							<div class="inner">
								<h1>Select the zones:</h1>
								<br>
		                        <canvas id="zonesMapCanvas" class="canvas"></canvas>
							    <script>
							        mapImage.src = <?PHP echo "\"files/".$name."\""; ?>;
							    </script>
							    <br><br>
								<a id="submitZonesButton" class="button">Submit</a>
							</div>
						</section>
		                
				        <br>

						<section id="beacons" class="wrapper style1 fullscreen fade-up" style="display: none">
							<div class="inner">
								<h1>Place your beacons:</h1>
								<br>
								<canvas id="beaconsMapCanvas" class="canvas"></canvas>
								<br><br>
								<a id="submitZonesButton" class="button">Save</a>
							</div>
						</section>

						<div id="popup" class="modal">
							<div id="popup-content" class="modal-content">
						  		<center>
						  			What is this zone's number?
						  			<br><br>
						  			<input id="zoneNoInput" type="text">
						  			<br>
						  			<a id="saveZoneNoButton" class="button">Save</a>
						  		</center>
						  	</div>
						</div>

						<div id="beaconPopup" class="modal">
							<div id="beaconPopupContent" class="modal-content">
						  		<center>
						  			What is this beacon's id?
						  			<br><br>
						  			<input id="beaconIdInput" type="text">
						  			<br>
						  			<a id="saveBeaconButton" class="button">Save</a>
						  			<a id="deleteBeaconButton" class="button">Delete Beacon</a>
						  		</center>
						  	</div>
						</div>
				<?php
					}
				?>

		</div>

		<!-- Footer -->
		<footer id="footer" class="wrapper style1-alt">
			<div class="inner">
				<ul class="menu">
					<li>&copy; Untitled. All rights reserved.</li><li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
				</ul>
			</div>
		</footer>

		
		<!-- Scripts -->
		<script src="assets/js/jquery.min.js"></script>
		<script src="assets/js/jquery.scrollex.min.js"></script>
		<script src="assets/js/jquery.scrolly.min.js"></script>
		<script src="assets/js/skel.min.js"></script>
		<script src="assets/js/util.js"></script>
		<!--[if lte IE 8]><script src="assets/js/ie/respond.min.js"></script><![endif]-->
		<script src="assets/js/main.js"></script>
		<script src="assets/js/zonesMapCanvas.js"></script>
	</body>
</html>