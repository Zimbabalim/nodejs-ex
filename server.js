//  OpenShift sample Node application
// @as : adapt for hopkins
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'), // @as removed
    _ = require('lodash');

// @as
var fs = require( "fs" );
var path = require( "path" );
var routes = require( "./routes/index" ); // RESTORE
var mongo = require('mongodb');
var monk = require('monk');
var bb = require('express-busboy');
// ===

const dotenv = require('dotenv');
dotenv.config();

console.log('/server/ - @as: 16.12.20/13:24');
Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
// app.use(morgan('combined')); //@as removed

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

console.log('/server/ -process.env.OPENSHIFT_MONGODB_DB_URL:', process.env.OPENSHIFT_MONGODB_DB_URL, process.env.MONGO_URL);

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    
    /* ORIGINAL */
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];
    
    console.log('/server/ --mongoServiceName:', mongoServiceName);
    console.log('/server/ --mongoHost:', mongoHost);
    console.log('/server/ --mongoPort:', mongoPort);
    console.log('/server/ --mongoDatabase:', mongoDatabase);
    console.log('/server/ --mongoPassword:', mongoPassword);
    console.log('/server/ --mongoUser:', mongoUser);
    
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
    
    console.log('/server/ -initDb --mongoURL:', mongoURL);
    
    if (mongoURL == null) {
        return;
    }
    
    var mongodb = require('mongodb');
    
    db = monk( mongoURL ); // @as ADDED
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

// REMOVED
/*app.use(function( req, res, next ){
    req.db = db;
    next();
});*/

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
console.log('/server/ - <<');


// ======== ROUTES ========================================================================

app.get("/", function( req, res ){
    console.log("***************************");
    console.log("NEW SESSION", new Date() );
    console.log("***************************");
    
    sessionLogPrettyMeta.index = 1;
    setColour();
    
    res.render( "index.ejs" );
});

app.get("/admin", function( req, res ){
    res.render( "./../public/CMS/index.html" );
});


// ======== ROUTES API ========================================================================

app.get("/api/gateway/validate-login", function ( req, res ) {
    
    console.log('==== /server/ -GET GATEWAY LOGIN ====');
    var data = db.get( "users" );
    
    data.find({ email : req.query.email.toLowerCase() },{},function( e, docs ){
        res.json(docs);
    });
});


app.get("/api/cms/users/initial-population", function ( req, res ) {
    
    var users = db.get( "users" );
    
    users.find( { _id : req.query.uid }, {}, function ( e, docs ) {
        
        //console.log26.('/server/ -INITIAL');
        syncSwatchFields(docs[0]);
        writeToUserLog(
            req.query.uid,
            '*** NEW SESSION *** ' + new Date().toDateString() + ' ' + new Date().toLocaleTimeString()
        );
        
        var vo = docs[ 0 ];
        var f = _.has( vo, "swatches" );
        
        if( f ){
            // //console.log26.("/index/ -initial-population : HAS SWATCHES PROP - quit");
        } else {
            // //console.log26.("/index/ -initial-population : SHOULD CREATE SWATCHES PROP", req.query.swatches );
            users.findOneAndUpdate( { _id : req.query.uid }, { $set: { swatches: req.query.swatches }} );
        }
        
        //console.log26.("/index/ - initial-population:", "user", vo.email, "added swatches?", !f );
        res.json( { "added_swatches_prop" : !f } );
        
    });
});


// *** UTILS

const sessionLogPrettyMeta = {
    index: 1,
    // colour: ['red', 'green', 'blue', 'orange', 'yellow'],
    currColour: null
}

var setColour = function () {
    /*let a = ['red', 'green', 'blue'];
console.log(a);

let l = a.length;
let r = 5;

for (let i = 0; i < r; i ++) {
  let z = (i % l);
  let t = a[z];
  console.log(i, z, t);
}*/
    /*const len = sessionLogPrettyMeta.colour.length;
    const colour = sessionLogPrettyMeta.colour[sessionLogPrettyMeta.index % len];
    sessionLogPrettyMeta.currColour = colour;*/
    
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    sessionLogPrettyMeta.currColour = getRandomColor();
}

var writeToUserLog = function (userId, message) {
    
    var maxLength = 256; // *** stop
    var users = db.get("users");
    var log;
    
    users.findOne({ _id : userId })
        .then(function (res) {
            log = res.user_log || [];
            
            if (log.length >= maxLength) {
                log.shift();
                /*log.push({
                    message: 'Cleared log'
                });*/
            }
            
            log.push({
                message: message,
                index: sessionLogPrettyMeta.index ++,
                colour: sessionLogPrettyMeta.currColour
            });
            users.findOneAndUpdate( { _id : userId }, { $set: { user_log: log }} );
        });
}

var syncSwatchFields = function (user) {
    
    if (!user) {
        return;
    }
    
    if (user.swatches && user.rich_swatches) {
        //console.log('/server/ -syncSwatchFields --DO NOTHING');
        return;
    }
    
    if (user.swatches && !user.rich_swatches) {
        
        var richSwatches = _.map((user.swatches), function (item) {
            return createRichSwatch(item, false);
        });
        
        // *** TODO should optimise
        var users = db.get( "users" );
        users.findOneAndUpdate( { _id : user._id }, { $set: { rich_swatches: richSwatches, user_log: [] }} );
    }
}

var createRichSwatch = function (swatch, dated) {
    return {
        uid: swatch,
        datestamp: (dated) ? new Date() : null,
        pretty_date: (dated) ? getPrettyDate() : null,
        cms_marked: 0
    }
}


app.get("/api/cms/users/write-swatches", function ( req, res ) {
    var users = db.get( "users" );
    users.findOneAndUpdate( { _id : req.query.uid }, { $set: { swatches: req.query.swatches || [] }} );
    res.json( { "swatches_modified" : req.query.swatches } );
});

// *** NOTE NOV 2020 - need to create new swatches field with extra props - TODO ultimately deprecate previous swatches field
app.get("/api/cms/users/write-rich-swatches", function ( req, res ) {
    
    var users = db.get( "users" );
    var result = [];
    
    users.findOne({ _id : req.query.uid })
        .then(function (res) {
            handle(_.clone(res.rich_swatches)); // *** FIXME clone?
        })
        .catch(function (error) {
            console.log('/server/ -WRITE ERROR', error);
        })
    ;
    
    function handle(data) {
        result = (!data) ? [] : data;
        
        if (req.query.method === 'add') {
            result.push(createRichSwatch(req.query.swatch, true));
            writeToUserLog(
                req.query.uid,
                '(+) added: ' + req.query.swatch
            );
        }
    
        if (req.query.method === 'remove') {
            result = _.pullAllBy(result, [{uid: req.query.swatch}], 'uid');
            writeToUserLog(
                req.query.uid,
                '(-) deleted: ' + req.query.swatch
            );
        }
    
        users.findOneAndUpdate( { _id : req.query.uid }, { $set: { rich_swatches: result}} );
        res.json( { "rich_swatches_modified" : result } );
    }
});

app.get("/api/cms/users/toggle-rich-swatch-mark", function ( req, res ) {
    //console.log('/toggle-rich-swatch-mark/ -', req.query);
    var users = db.get( "users" );
    users.findOneAndUpdate( { _id : req.query.uid }, { $set: { rich_swatches: req.query.collection}} );
    res.json( { "toggle_rich_swatch_mark_modified" : req.query.collection } );
});



app.get("/api/cms/users/save-user-notes", function ( req, res ) {
    
    console.log('/server/ -NOTEPAD', req.query.uid);
    
    var users = db.get( "users" );
    users.findOneAndUpdate( { _id : req.query.uid }, { $set: { user_notes: req.query.text}} );
    
    res.json( { "saved_user_notes" : req.query.text } );
});


app.get("/api/cms/users/get-all", function ( req, res ) {
    
    var data = db.get( "users" );
    
    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});


app.get("/api/cms/users/add-user", function ( req, res ) {
    
    var users = db.get( "users" );
    
    if( req.query["email"] ){
        users.insert( req.query );
    } else {
        console.log("/index/ - FAIL");
    }
    
    users.find({},{},function( e, docs ){
        res.json(docs);
    });
});


app.get("/api/cms/users/delete-user", function ( req, res ) { // TODO - generic service
    
    console.log("/index/ - USER DELETE", req.query.dbid );
    
    var data = db.get( "users" );
    
    data.remove({ _id: req.query.dbid });
    
    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});


app.get("/api/cms/sundries/get-all", function ( req, res ) {
    
    var data = db.get( "sundries" );
    
    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});


app.get("/api/cms/sundries/add-story", function ( req, res ) {
    
    var data = db.get( "sundries" );
    
    req.query.date = getPrettyDate();
    //console.log("/index/ - ************", req.query );
    
    data.insert( req.query );
    
    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});


app.get("/api/cms/sundries/delete-story", function ( req, res ) {
    
    console.log("/index/ - STORY DELETE", req.query.dbid );
    
    var data = db.get( "sundries" );
    
    data.remove({ _id: req.query.dbid });
    
    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});


/* TODO triple check this works after migration */
app.post("/api/cms/sundries/upload-image", function ( req, res ) {
    
    console.log("/index/ - UPLOAD IMAGE", req.files.image );
    
    var source = fs.createReadStream( req.files.image.file );
    var dest = fs.createWriteStream( "./public/assets/images/sundries/" + req.files.image.filename );
    
    console.log("/index/ - ********", source.path );
    
    source.pipe(dest);
    source.on('end', function() {
        /* copied */
        console.log("/index/ - IMAGE SAVED");
        res.json( { image : req.files.image.filename } );
    });
    source.on('error', function(err) { /* error */ });
});


// UTILS
var getPrettyDate = function () {
    
    var r,
        d = new Date().toDateString(),
        z = d.split(" ");
    
    r = z[ 2 ] + " " + z[ 1 ] + " " + z[ 3 ];
    
    return r;
};


// ==============================

module.exports = app ;
