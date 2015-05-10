<?php
  $dbconn = pg_connect("host=localhost dbname=blog user=postgres password=l|DeRtYK6x2n") or die("Could not connect: " . pg_last_error());

  $query = "select post_id,title,post,date from posts where post_id = '$_GET[id]'";
  $result = pg_query($query);
  
  if ($result) {
    $line = pg_fetch_array($result, NULL, PGSQL_ASSOC);
    echo <<<EOD
    {
      "success": true,
      "post": {
        "id": "$line[post_id]",
        "title": "$line[title]",
        "text": "$line[post]",
        "date": "$line[date]"
      }
    }
EOD;
  } else {
    $error = pg_last_error();
    echo <<<EOD
    {
      "success": false,
      "error": "Query failed: $error"
    }
EOD;
  }

  pg_free_result($result);
  pg_close($dbconn);
?>