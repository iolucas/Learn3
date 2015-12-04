<?php
	if(isset($_GET['search_query']))
		echo $_GET['search_query'];
	else
		echo "error";

?>