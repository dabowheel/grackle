function datastore(method,path,obj,callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState==4) {
      if (request.status==200) {
        console.log(request.responseText);
        var res;
        try {
          res = JSON.parse(request.responseText);
        } catch(e) {
          callback("JSON parse error: " + e);
          return;
        }
        console.log(res);
        callback(null,res);
      } else {
        callback(request.responseText)
      }
    }
  };

  request.open(method,path,true);
  if (method == "GET") {
    request.send();
  } else {
    request.setRequestHeader("Content-type","application/json");
    body = JSON.stringify(obj);
    console.log(body);
    request.send(body);
  }
}
