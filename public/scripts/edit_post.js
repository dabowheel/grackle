function editPost(id) {
  console.log("edit post " + id);
  loadPost(id, function (post) {
    document.getElementById("post" + post.id).innerHTML = editPost2HTML(post);
  });
}

function editPost2HTML(post) {
  var html = "<div><strong>Edit</strong></div>";
  html += "<div><input id=\"posttitle\" type=\"text\" style=\"width:100%;box-sizing:border-box;\" value=\"" + post.title + "\"/></div>";
  html += "<div><textarea id=\"posttext\" rows=\"5\" style=\"width:100%;box-sizing:border-box;\">"+ post.text + "</textarea></div>";
  html += "<div><span><button class=\"fillerbutton\">Here</button></span><span class=\"listbutton\"><button onclick=\"savePostChanges('" + post.id + "');\">Accept</button><button onclick=\"cancelPostChanges('" + post.id + "')\">Cancel</button></span></div>";
  return html;
}

function savePostChanges(id) {
  loadPost(id,function (post) {
    displayPost(post);
  });
}

function cancelPostChanges(id) {
  loadPost(id,function (post) {
    displayPost(post);
  });
}