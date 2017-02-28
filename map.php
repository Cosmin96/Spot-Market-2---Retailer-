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
		<section id="sidebar">
			<div class="inner">
				<nav>
					<ul>
						<li><a href="#intro">Welcome</a></li>
						<li><a id="beaconsNav" href="#beacons">Place your beacons</a></li>
						<li><a href="#one">Who we are</a></li>
						<li><a href="#two">What we do</a></li>
						<li><a href="#three">Get in touch</a></li>
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
                        <script>
                        	var mapImage = new Image();
                        </script>
                        <?PHP
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
		                    ?>         
		                                        Upload successfully!
		                                        <br>Preview:<br><br>
		                                        <canvas id="zonesMapCanvas" class="canvas"></canvas>
											    <script>
											 
											        mapImage.src = <?PHP echo "\"files/".$name."\""; ?>;
											    </script>
											    <br><br>
					  							<a id="submitZonesButton" class="button">Submit</a>
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
		                
		                <br>
					</div>
				</section>

				<section id="beacons" class="wrapper style1 fullscreen fade-up" style="display: none">
					<div class="inner">
						<h1>Place your beacons:</h1>
						<br>
						<canvas id="beaconsMapCanvas" class="canvas"></canvas>
					</div>
				</section>

			<!-- One -->
				<section id="one" class="wrapper style2 spotlights">
					<section>
						<a href="#" class="image"><img src="images/pic01.jpg" alt="" data-position="center center" /></a>
						<div class="content">
							<div class="inner">
								<h2>Sed ipsum dolor</h2>
								<p>Phasellus convallis elit id ullamcorper pulvinar. Duis aliquam turpis mauris, eu ultricies erat malesuada quis. Aliquam dapibus.</p>
								<ul class="actions">
									<li><a href="#" class="button">Learn more</a></li>
								</ul>
							</div>
						</div>
					</section>
					<section>
						<a href="#" class="image"><img src="images/pic02.jpg" alt="" data-position="top center" /></a>
						<div class="content">
							<div class="inner">
								<h2>Feugiat consequat</h2>
								<p>Phasellus convallis elit id ullamcorper pulvinar. Duis aliquam turpis mauris, eu ultricies erat malesuada quis. Aliquam dapibus.</p>
								<ul class="actions">
									<li><a href="#" class="button">Learn more</a></li>
								</ul>
							</div>
						</div>
					</section>
					<section>
						<a href="#" class="image"><img src="images/pic03.jpg" alt="" data-position="25% 25%" /></a>
						<div class="content">
							<div class="inner">
								<h2>Ultricies aliquam</h2>
								<p>Phasellus convallis elit id ullamcorper pulvinar. Duis aliquam turpis mauris, eu ultricies erat malesuada quis. Aliquam dapibus.</p>
								<ul class="actions">
									<li><a href="#" class="button">Learn more</a></li>
								</ul>
							</div>
						</div>
					</section>
				</section>

			<!-- Two -->
				<section id="two" class="wrapper style3 fade-up">
					<div class="inner">
						<h2>What we do</h2>
						<p>Phasellus convallis elit id ullamcorper pulvinar. Duis aliquam turpis mauris, eu ultricies erat malesuada quis. Aliquam dapibus, lacus eget hendrerit bibendum, urna est aliquam sem, sit amet imperdiet est velit quis lorem.</p>
						<div class="features">
							<section>
								<span class="icon major fa-code"></span>
								<h3>Lorem ipsum amet</h3>
								<p>Phasellus convallis elit id ullam corper amet et pulvinar. Duis aliquam turpis mauris, sed ultricies erat dapibus.</p>
							</section>
							<section>
								<span class="icon major fa-lock"></span>
								<h3>Aliquam sed nullam</h3>
								<p>Phasellus convallis elit id ullam corper amet et pulvinar. Duis aliquam turpis mauris, sed ultricies erat dapibus.</p>
							</section>
							<section>
								<span class="icon major fa-cog"></span>
								<h3>Sed erat ullam corper</h3>
								<p>Phasellus convallis elit id ullam corper amet et pulvinar. Duis aliquam turpis mauris, sed ultricies erat dapibus.</p>
							</section>
							<section>
								<span class="icon major fa-desktop"></span>
								<h3>Veroeros quis lorem</h3>
								<p>Phasellus convallis elit id ullam corper amet et pulvinar. Duis aliquam turpis mauris, sed ultricies erat dapibus.</p>
							</section>
							<section>
								<span class="icon major fa-chain"></span>
								<h3>Urna quis bibendum</h3>
								<p>Phasellus convallis elit id ullam corper amet et pulvinar. Duis aliquam turpis mauris, sed ultricies erat dapibus.</p>
							</section>
							<section>
								<span class="icon major fa-diamond"></span>
								<h3>Aliquam urna dapibus</h3>
								<p>Phasellus convallis elit id ullam corper amet et pulvinar. Duis aliquam turpis mauris, sed ultricies erat dapibus.</p>
							</section>
						</div>
						<ul class="actions">
							<li><a href="#" class="button">Learn more</a></li>
						</ul>
					</div>
				</section>

			<!-- Three -->
				<section id="three" class="wrapper style1 fade-up">
					<div class="inner">
						<h2>Get in touch</h2>
						<p>Phasellus convallis elit id ullamcorper pulvinar. Duis aliquam turpis mauris, eu ultricies erat malesuada quis. Aliquam dapibus, lacus eget hendrerit bibendum, urna est aliquam sem, sit amet imperdiet est velit quis lorem.</p>
						<div class="split style1">
							<section>
								<form method="post" action="#">
									<div class="field half first">
										<label for="name">Name</label>
										<input type="text" name="name" id="name" />
									</div>
									<div class="field half">
										<label for="email">Email</label>
										<input type="text" name="email" id="email" />
									</div>
									<div class="field">
										<label for="message">Message</label>
										<textarea name="message" id="message" rows="5"></textarea>
									</div>
									<ul class="actions">
										<li><a href="" class="button submit">Send Message</a></li>
									</ul>
								</form>
							</section>
							<section>
								<ul class="contact">
									<li>
										<h3>Address</h3>
										<span>12345 Somewhere Road #654<br />
										Nashville, TN 00000-0000<br />
										USA</span>
									</li>
									<li>
										<h3>Email</h3>
										<a href="#">user@untitled.tld</a>
									</li>
									<li>
										<h3>Phone</h3>
										<span>(000) 000-0000</span>
									</li>
									<li>
										<h3>Social</h3>
										<ul class="icons">
											<li><a href="#" class="fa-twitter"><span class="label">Twitter</span></a></li>
											<li><a href="#" class="fa-facebook"><span class="label">Facebook</span></a></li>
											<li><a href="#" class="fa-github"><span class="label">GitHub</span></a></li>
											<li><a href="#" class="fa-instagram"><span class="label">Instagram</span></a></li>
											<li><a href="#" class="fa-linkedin"><span class="label">LinkedIn</span></a></li>
										</ul>
									</li>
								</ul>
							</section>
						</div>
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