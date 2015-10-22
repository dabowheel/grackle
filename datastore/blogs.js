var util = require("./util");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var modelBlog = require("../model/blog");
var modelPost = require("../model/post");

exports.readBlogList = function (req,res,next) {
  console.log("blogList read");
  var blogs = req.db.collection("blogs");
  blogs.find(function (error,result) {
    if (error) {
      next(error);
      return;
    }

    result.toArray(function (err,list) {
      if (err) {
        next(err);
        return;
      }

      var blogList = {
        list: list
      };
      res.json({
        success: true,
        blogList: blogList
      });
    });
  });
};

exports.createBlog = function (req,res,next) {
  console.log("createBlog");
  util.getJSONFromBody(req, function (err,obj) {
    console.log("obj",obj);
    if (err) {
      return next(err);
    }

    var blogs = req.db.collection("blogs");
    delete obj._id;
    console.log("createBlog before update");
    blogs.insertOne(obj, function (err,res2) {
      if (err) {
        return next(err);
      }

      var blog = res2.ops[0];
      res.json(blog);
    });
  });
};

exports.deleteBlog = function (req,res,next) {
  console.log("delete blog");
  util.getJSONFromBody(req, function (err,obj) {
    if (err) {
      return next(err);
    }

    var blogs = req.db.collection("blogs");
    console.log("obj",obj);
    blogs.deleteOne({_id:new ObjectID(obj._id)}, function (err, res2) {
      if (err) {
        return next(err);
      }

      console.log("res2",res2);
      if (res2.result.ok) {
        res.end();
      } else {
        next("blog not deleted because the blog was not found");
      }
    });
  });
};

exports.readBlog = function (req,res,next) {
  console.log("read blog");
  util.getJSONFromBody(req, function (err,obj) {
    if (err) {
      return next(err);
    }

    var blogs = req.db.collection("blogs");
    blogs.findOne({_id:new ObjectID(obj._id)}, function (err,res2) {
      if (err) {
        return next(err);
      }

      if (!res2) {
        return next("could not find blog");
      }

      var blog = new modelBlog.Blog(res2._id, res2.title);

      var posts = req.db.collection("posts");
      console.log("blogID",blog._id);
      console.log("blogID",blog._id.toString());
      console.log("blogID type",typeof blog._id);
      posts.find({blogID:blog._id.toString()}, function (err,res3) {
        res3.toArray(function (err, list) {
          console.log("toArray err",err);
          console.log("toArray list",list);
          if (err) {
            return next(err);
          }

          for (obj of list) {
            var post = new modelPost.Post(obj._id, obj.title, obj.text, new Date(obj.date), obj.blogID);
            blog.addPost(post);
          }
          res.json(blog.exportObject());
        });
      });
    });
  });
};

exports.saveBlogTitle = function (req,res,next) {
  if (!req.session.userID) {
    return next("user not logged in");
  }

  util.getJSONFromBody(req, function (err,obj) {
    if (err) {
      return next(err);
    }

    var blogs = req.db.collection("blogs");

    blogs.updateOne({_id: new ObjectID(obj._id)}, {title: obj.title}, function (err, res2) {
      if (err) {
        return next(err);
      }

      if (res2.modifiedCount < 1) {
        return next("could not find blog");
      }

      res.end();
    });
  });
};
