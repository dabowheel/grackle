"use strict";

function setHash(hash) {
  if (hash != location.hash) {
    location.hash = hash;
  }
}

function setURL(url,title,modify) {
  url = encodeURI(url);
  if (url != (location.pathname + location.search)) {
    if (!title) {
      title = document.title;
    }
    if (modify || url == "/") {
      history.replaceState("", title, url + location.search);
    } else {
      history.pushState("", title, url + location.search);
    }
    document.title = title;
  }
}

exports.setHash = setHash;
exports.setURL = setURL;
