<html>
  <head>
    <title>JSON/Atom Custom Search API Example</title>
  </head>
  <body>
    <div id="content"></div>
    <script>
      function hndlr(response) {
      for (var i = 0; i < response.items.length; i++) {
        var item = response.items[i];
        // in production code, item.htmlTitle should have the HTML entities escaped.
        document.getElementById("content").innerHTML += "<br>" + item.htmlTitle+"--"+item.link;
      }
    }
	var key = 'hard+rock+cafe,london,england';
	
    </script>
    <script src="https://www.googleapis.com/customsearch/v1?key=AIzaSyC9jGYb1zC5bYMnGsDqERzw6SQKKBEY4PY&cx=017576662512468239146:omuauf_lfve&q=hard+rock+cafe,london,england&callback=hndlr">
    </script>
	<!-Weather in hangzhou, China on your site - HTML code - weatherforecastmap.com --><div align="center"><script src="http://www.weatherforecastmap.com/weather1.php?zona=china_hangzhou"></script><a title="Weather Today in hangzhou" href="http://www.weatherforecastmap.com/china/hangzhou" >Weather Today in Hangzhou</a></div><!-end of code-->
  </body>
</html>