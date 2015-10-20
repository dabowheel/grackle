var datastore = require("../scripts/datastore");
var ctlBlogList = require("./blogList");
var ctlSplash = require("./splash");

function clickBlogList() {
  history.pushState("", document.title, window.location.pathname + window.location.search);
  ctlBlogList.viewBlogList();
}

function clickLogout() {
  datastore("GET","logout",null, function(err,res) {
    if (err) {
      $("#menuPlaceForAlert").addClass("alert alert-warning");
      $("#menuPlaceForAlert").html(err);
      return;
    }

    history.pushState("", document.title, window.location.pathname + window.location.search);
    ctlSplash.viewSplash();
  });
}

exports.setGlobals = function () {
  global.clickBlogList = clickBlogList;
  global.clickLogout = clickLogout;
};