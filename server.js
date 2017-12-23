//  OpenShift sample Node application
// @as : adapt for hopkins
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'); // @as removed

// @as
var fs = require( "fs" );
var path = require( "path" );
var routes = require( "./routes/index" ); // RESTORE
var mongo = require('mongodb');
var monk = require('monk');
var bb = require('express-busboy');
// ===

console.log('/server/ - @as:1857 >>');
Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined')); //@as removed

// @as added
app.use( express.static( path.join( __dirname, "public" )));
bb.extend( app, {
    upload : true,
    path: "./public/_upload-temp"
} ); // RESTORE
app.use( "/", routes); // @as removed RESTORE
// ===


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

    }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {

    // console.log('/server/ -initDb --disable db connect');
    // return; // REMOVE - TEST disable db connect

    if (mongoURL == null) return;

    var mongodb = require('mongodb');
    if (mongodb == null) return;

    mongodb.connect(mongoURL, function(err, conn) {
        if (err) {
            callback(err);
            return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        console.log('Connected to MongoDB at: %s', mongoURL);
    });
};

/**
 * stub this call for the http probes (liveness, readiness), otherwise pod won't deploy
 */
app.get('/pagecount', function (req, res) {
    res.send('{ pageCount: -1 }');
});

// error handling
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

initDb(function(err){
    console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
console.log('/server/ - <<');

module.exports = app ;
