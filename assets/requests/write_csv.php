<?php
	$csvFile = fopen('../../files/'.$_POST['fileName'], 'w');
	fwrite($csvFile, $_POST['csvContent']);
?>