const { getUsers, writeJsonUsers } = require('../db/dataB')
const { validationResult , check, body} = require('express-validator')
let bcrypt = require('bcryptjs')
let db = require("../database/models")
let userPromise = [];

module.exports = {
    profile: (req, res) => {

      db.User.findOne({
        where: {
          id: req.session.user.id
        },
        include: [{
          association: 'Addresse'
        }]
      })
      .then((user) => {
        res.render("users/profile", {
          user,
          session: req.session,
          userInSession : req.session.user ? req.session.user : ''
      }) ;
      });

    },

    editProfile: (req, res) => {

      db.User.findOne({
        where: {
          id: req.params.id
        },
        include: [{
          association: 'Addresse'
        }]
      })
      .then((user) => {
        res.render("users/editProfile", {
          user,
          session: req.session,
          userInSession : req.session.user ? req.session.user : ''
      });
      });
    },
    updateProfile: (req, res) => {
      let errors = validationResult(req)

      if (errors.isEmpty()) {

        let { user, name, lastName, telephone, address, state, city, country, postalCode} = req.body;
        db.Addresse.create({
          address,
          state,
          city,
          country,
          postalCode,
          userId: req.params.id
        })
        .then((address) => {
          db.User.update({
            user: user.trim(),
            name: name.trim(),
            lastName: lastName.trim(),
            telephone: telephone.trim(),
            avatar: req.file ? req.file.filename : db.User.avatar,
            addressesId: address.id

          }, {
            where: {
              id: req.params.id
            }
          })
          .then(() => {
            res.redirect('/profile')
          })
        })
      }else{
          res.render("users/editProfile", {
              errors: errors.mapped(),
              old:req.body,
              session: req.session,
              userInSession : req.session.user ? req.session.user : ''
          })
      }
    },
    deleteProfile: (req, res) => {
      req.session.destroy();
      if (req.cookies.userMyymGamers){
        res.cookie('userMyymGamers','',{maxAge:-1});
      }
      db.User.destroy({
        where:{
          id : req.params.id
        }
      })
      return res.redirect('/') 
    },
    

    login: (req, res) => {
      res.render("users/login", {
        session: req.session,
        user : req.session.user ? req.session.user : ''
      })
    },
    loginUser: (req, res) => {
        let errors = validationResult(req)

        if (errors.isEmpty()) {
          /* res.send(req.body) */
          db.User.findOne({
            where: {
              email: req.body.email,
            },
            include: [{
              association: "Favorite"
            }],
          }).then((user) => {
            req.session.user = {
              id: user.id,
              user: user.user,
              name: user.name,
              lastName: user.lastName,
              email: user.email,
              avatar: user.avatar,
              rolesId: user.rolesId,
              favorites : user.Favorite
            };
    
            if (req.body.recordar) {
              res.cookie("userMyymGamers", req.session.user, {
                expires: new Date(Date.now() + 900000),
                httpOnly: true,
              });
            }
    
            res.locals.user = req.session.user;
    
            res.redirect("/");
          });
        } else {
          res.render("users/login", {
             errors: errors.mapped(),
             session: req.session,
             userInSession : req.session.user ? req.session.user : ''
          })
        }
    },

    forgotPassword: (req, res) => {
      if(userPromise.length > 0) {
        res.redirect("/forgotPassword/changePassword")
      } else {
        res.render("users/forgotPass")
      }
      
    },

    fpFindEmail: (req, res) => {

      let errors = validationResult(req)

      if(errors.isEmpty()){
        let {
          email,
          user
          } = req.body;

          db.User.findOne({
            where: {
              email: email
            },
            where: {
              user: user
            },
            include: [{
              association: "Favorite"
            }],
          }).then((userData) => {
            userPromise.push(userData)
            res.redirect("/forgotPassword/changePassword")
        })
        .catch((err) => console.log(err))

  } else {
      res.render("users/forgotPass", {
          errors: errors.mapped()
      })
  }
    },

    changePassword: (req, res) => {
      res.render("users/fpProcess", {
        userPromise
      })
    },

    changeProcess: (req, res) => {
      let errors = validationResult(req)

      if(errors.isEmpty()){
      let { password } = req.body

      db.User.update({
        password: bcrypt.hashSync(password, 12)
      }, {
        where: {
          id: userPromise[0].id
        }
      }).then(() => {
        userPromise.pop()
        res.redirect("/login")
      })
    } else {
      res.render("users/fpProcess", {
        userPromise,
        errors: errors.mapped()
    })
    } 
    },

    register: (req, res) => {
      res.render("users/register")

    },

    registerNewUser: (req, res) => {

      let errors = validationResult(req)

      if(errors.isEmpty()){
        let {
          user,
          email,
          password
          } = req.body;

        db.User.create({
          user: user,
          email: email,
          password: bcrypt.hashSync(password, 12),
          rolesId: 1,
          avatar: req.file ? req.file.filename : "defaultAvatarImage.png"
          
        })
          .then(() => {
          res.redirect("/login")
        })
        .catch((err) => console.log(err))

  } else {
      res.render("users/register", {
          errors: errors.mapped(),
          old: req.body,
          session: req.session,
          userInSession : req.session.user ? req.session.user : ''
      })
  }

    },
    logout: (req, res) => {
      req.session.destroy()
      if(req.cookies.userMyymGamers){
          res.cookie('userMyymGamers', '', {maxAge: -1})
      }

      res.redirect('/')
    }
  };