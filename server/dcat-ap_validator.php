<?php
    $content = file_get_contents($_GET['url']);
    
	header('Access-Control-Allow-Origin: http://localhost:3030');
    echo $content;
?>