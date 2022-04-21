// CALL ENV FILE
require('dotenv').config()
var express = require('express');

var cron = require('node-cron');

let migrationService = require('./services/migrationService')

var app = express();

// APP  CONTAINER =========== >> 
let conn = require('./config/DbConnect');
conn.connectToServer( function( err, client ) { // MAIN MONGO START

  if (err) console.log(err);
  // start the rest of your app here
  

  
  // 
 
  cron.schedule('*/10 * * * * *', () => {
    // migrationService.contents(
    migrationService.default('vocabulary')
  });


  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {

    
    // set locals, only providing error in development
    if ( process.env.ENVIRONMENT == "dev" ) {

      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'dev' ? err : {};
      res.status(err.status || 500);
      res.render('error');

    } else {
      // errorLogService.logger(err.status || 500,err.message,req)
      res.status(err.status || 500);
      res.redirect("/")
    }
  });

}); // MAIN MONGO CLOSE
// APP  CONTAINER =========== << 


module.exports = app;
