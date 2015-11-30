"use strict";
var fs = require("fs");
var express = require('express');
var app = express();
//var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var datastore_session = require("./datastore/session");
var datastore_users = require("./datastore/users");
var datastore_blogs = require("./datastore/blogs");
var datastore_posts = require("./datastore/posts");
var datastore_verify = require("./datastore/verify");
var datastore_reset = require("./datastore/reset");
var datastore_expiringDocs = require("./datastore/expiringDocs");
var compression = require("compression");
//var apiRoute = require("./api/route");

MongoClient.connect(process.env.MONGODB_URL, function (error,db) {
  if (error) {
    console.log(error);
    process.exit(1);
  }

  //app.use(bodyParser.json());
  app.use(compression({filter: shouldCompress}));
   
  function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header 
      return false;
    }
   
    // fallback to standard filter function 
    return compression.filter(req, res);
  }
  app.use(cookieParser(process.env.SESSION_SECRET));
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      db: db
    })
  }));

  app.use(function (req,res,next) {
    let m = req.originalUrl.match(/.*\.(.*)/);
    if (m) {
      let ext = m[1];
      switch (ext) {
        case "css":
        case "js":
        case "ico":
          res.set("Cache-Control", "max-age=31536000");
          break;
      }
    }
    next();
  });

  app.use(express.static('public'));

  function sendPage(req,res,next) {
    res.sendFile(__dirname + "/public/index.html");
  }

  app.get("/log/*/", sendPage);
  app.get("/admin", sendPage);
  app.get("/profile", sendPage);
  app.get("/signup", sendPage);
  app.get("/login", sendPage);
  app.get("/verifyEmail/*", sendPage);
  app.get("/forgotPassword", sendPage);
  app.get("/forgotPasswordResult", sendPage);
  app.get("/resetPassword/*", sendPage);
  app.get("/resetPasswordResult", sendPage);
  app.get("/designer", sendPage);
  app.get("/loglist", sendPage);

  app.use("/datastore", function (req,res,next) {
    req.db = db;
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
  });

  app.get("/datastore/session",datastore_session.session);
  app.post("/datastore/signup",datastore_session.signup);
  app.post("/datastore/login",datastore_session.login);
  app.get("/datastore/logout",datastore_session.logout);
  app.post("/datastore/forgotPassword", datastore_reset.forgotPassword);
  app.post("/datastore/resetPassword", datastore_reset.resetPassword);
  app.post("/datastore/verifyEmail", datastore_verify.verifyEmail);

  app.get("/datastore/Profile", datastore_users.getProfile);
  app.put("/datastore/Profile", datastore_users.saveProfile);
  app.get("/datastore/resendVerification", datastore_users.resendVerification);

  app.get("/datastore/BlogList", datastore_blogs.BlogList);

  app.get("/datastore/Blog/:title", datastore_blogs.readBlog);
  app.put("/datastore/Blog", datastore_blogs.createBlog);
  app.put("/datastore/Blog/:title", datastore_blogs.saveBlog);
  app.delete("/datastore/Blog/:title", datastore_blogs.deleteBlog);

  app.put("/datastore/Post", datastore_posts.createPost);
  app.put("/datastore/Post/:id", datastore_posts.updatePost);
  app.delete("/datastore/Post/:id", datastore_posts.deletePost);

  app.get("/datastore/UserList", datastore_users.userList);
  app.delete("/datastore/User/:id", datastore_users.deleteUser);
  app.get("/datastore/ExpiredTable", datastore_expiringDocs.getExpiredTable);
  app.delete("/datastore/ExpiredReset", datastore_reset.cleanupReset);
  app.delete("/datastore/ExpiredVerify", datastore_verify.cleanupVerify);

  app.param(["title"], function (req,res,next,value) {
    req.api = {
      title: value
    };
    next();
  });

  app.param(["id"], function (req,res,next,value) {
    req.api = {
      id: value
    };
    next();
  });

  //apiRoute(app,db);

  app.use(function(req,res,next) {
    res.status(404).send("Not Found.");
  });

  app.use(function(err,req,res,next) {
    console.log(err.stack);
    res.status(500).send("Application Error. " + err);
  });

  var server = app.listen(80, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

  });
});
