module.exports = (app) ->
  controller = app.controllers.userLogin

  app.route '/login'
    .get controller.connect
    .post controller.login

  app.route '/register'
    .post controller.register

  app.route '/logout'
    .get controller.logout
