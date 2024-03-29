var bcrypt, gdb, neo4j, request;

bcrypt = require('bcrypt');

request = require('request-coders-api');

neo4j = require('neo4j');

gdb = new neo4j.GraphDatabase(process.env.GRAPHENEDB_URL || 'http://neo4j:Zeu16051997@localhost:7474');

module.exports = function(app) {
  var controller, userSchema;
  userSchema = app.models.user;
  controller = {};
  controller.login = function(req, res) {
    var login, pass, user;
    user = req.body.user;
    login = user.login;
    pass = user.pass;
    return userSchema.findOne({
      $or: [
        {
          email: login
        }, {
          nick: login
        }
      ]
    }).exec().then(function(user) {
      if (user !== null && !req.session.data) {
        return bcrypt.compare(pass, user.pass, function(rq, rs) {
          var r;
          if (rs) {
            user.online = true;
            user.save();
            r = request.req('success', 'login success', user);
            req.session.data = r.data;
            return res.status(200).json(r);
          } else {
            return request.json('error', 'pass error', '', res, 500);
          }
        });
      } else {
        return request.json('error', 'login error', '', res, 500);
      }
    }, function(error) {
      console.error(error);
      return res.status(500).json(error);
    });
  };
  controller.connect = function(req, res) {
    if (req.session.data) {
      return request.json('success', 'connect success', req.session.data, res, 202);
    } else {
      return request.json('error', 'connect error', '', res, 204);
    }
  };
  controller.register = function(req, res) {
    var user;
    user = req.body.user;
    if (user !== null && !req.session.data) {
      return bcrypt.genSalt(10, function(err, salt) {
        return bcrypt.hash(user.pass, salt, function(err, hash) {
          user.pass = hash;
          return userSchema.create(user).then(function(user) {
            return gdb.cypher({
              query: 'CREATE (user:User {_id: "' + user._id + '"})'
            }, function(error, results) {
              var r;
              if (error) {
                console.error(error);
                return request.json('error', 'register error', error, res, 500);
              } else {
                r = request.req('success', 'register success', user);
                req.session.data = r.data;
                return res.status(201).json(r);
              }
            });
          }, function(error) {
            return request.json('error', 'register error', error, res, 500);
          });
        });
      });
    } else {
      return request.json('error', 'register error', '', res, 500);
    }
  };
  controller.logout = function(req, res) {
    if (req.session.data) {
      return userSchema.findById(req.session.data._id, function(err, user) {
        if (user) {
          user.online = false;
          user.save();
          return req.session.destroy(function() {
            return res.redirect('/');
          });
        } else {
          return res.redirect('/');
        }
      });
    } else {
      return res.redirect('/');
    }
  };
  return controller;
};
