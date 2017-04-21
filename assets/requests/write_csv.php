<?php
	$csvFile = fopen('../../files/'.$_POST['folderName'].'/'.$_POST['fileName'], 'w');
	fwrite($csvFile, $_POST['csvContent']);
?>