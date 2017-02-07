<?php
	$csvFile = fopen('../../files/'.$_POST['fileName'].'.csv', 'w');
	fwrite($csvFile, $_POST['zonesString']);
?>