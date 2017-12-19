var express = require( "express" );
var fs = require( "fs" );
var path = require( "path" );
var routes = require( "./routes/index" );
var mongo = require('mongodb');
var monk = require('monk');
var bb = require('express-busboy');


var App = function(){

    console.log('/server/ -App');

    var _this = this;

    _this.initIP = function(){

        _this.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        _this.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof _this.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.

            // _this.ipaddress = "127.0.0.1";
            _this.ipaddress = "0.0.0.0";

            console.warn('No OPENSHIFT_NODEJS_IP var, using:', this.ipaddress);
        }
    };


    // *** NOTE not calling this at the moment, but worth considering working it out
    _this.initCache = function(){

        console.log("/server/ -initCache ");

        if (typeof _this.cache === "undefined") {
            _this.cache = { 'index.html': '' };
        }

        //  Local cache for static content.
        _this.cache['index.html'] = fs.readFileSync('./index.html');

    };


    _this.cache_get = function( _key ) {
        return _this.cache[ _key ];
    };


    _this.terminator = function( _sig ){
        if (typeof _sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',  Date( Date.now()), _sig );
            process.exit( 1 );
        }
        console.log('%s: Node server stopped.', Date( Date.now() ) );
    };

    _this.setupTerminationHandlers = function(){
        process.on('exit', function() { _this.terminator(); });
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'].forEach(function(element, index, array) {
            process.on( element, function() { _this.terminator( element ); });
        });
    };




    _this.initServer = function() {

        console.log('/server/ -initServer');

        _this.app = express(); // *** fix for above being deprecated

        _this.app.engine('html', require('ejs').renderFile);
        _this.app.use( express.static( path.join( __dirname, "public" )));

        bb.extend( _this.app, {
            upload : true,
            path: "./public/_upload-temp"
        } );

        // Make our db accessible to our router
        _this.app.use(function( req, res, next ){
            req.db = _this.db;
            next();
        });

        _this.app.use( "/", routes); // RESTORE


        // REMOVE - testing original framework in situ
        _this.app.get("/test", function( req, res ){
            res.sendFile( __dirname + "/public/test-delete/index.html" );
        });



// error handlers

// development error handler
// will print stacktrace
        if (_this.app.get('env') === 'development') {
            _this.app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                res.render('error.ejs', {
                    message: err.message,
                    error: err
                });
            });
        }

// production error handler
// no stacktraces leaked to user
        _this.app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error.ejs', {
                message: err.message,
                error: {}
            });
        });



    };


    _this.init = function() {

        console.log('/server/ -init');

        _this.initIP();
        //_this.initCache(); // *** TODO might need this!
        _this.setupTerminationHandlers();

        // Create the express server and routes.
        _this.initMongoDB(); // TEST ONLY!!!
        _this.initServer();

    };


    _this.start = function() {

        console.log('/server/ -start');

        //  Start the app on the specific interface (and port).
        _this.app.listen(_this.port, _this.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), _this.ipaddress, _this.port);
        });
    };


    _this.initMongoDB = function(){

        console.log('/server/ -initMongoDB');

        var connection_string = "localhost:27017/centrepede-test";

        if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
            connection_string =
                process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
                process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
                process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
                process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
                process.env.OPENSHIFT_APP_NAME;
        }

        console.log("/server/ -initMongoDB --connection_string", connection_string );

        _this.db = monk( connection_string ); // *** db path NOTE open connection?
    };
};

console.log('/server/ -');

var app = new App();
app.init();
app.start();