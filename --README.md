The OpenShift `nodejs` cartridge documentation can be found at:

http://openshift.github.io/documentation/oo_cartridge_guide.html#nodejs

https://blog.openshift.com/getting-started-with-mongodb-on-nodejs-on-openshift/

http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/

http://www.marcusoft.net/2014/02/mnb-monk.html

http://www.thegeekstuff.com/2013/09/mongodump-mongorestore/



CLONE:
ssh://56b481c089f5cf65a50001a3@centrepede-zimbabalim.rhcloud.com/~/git/centrepede.git/


// @zim NOTES

start local:
nodemon server.js

runs on:
http://localhost:8080/

git push from branch to remote master:
git push origin foobarbaz:master

runs remotely on:
http://centrepede-zimbabalim.rhcloud.com/

SSH (powershell):
 rhc ssh staging
 
 p/w : 83Fortess


 connect to remote mongodb via rhc:
 mongo

 then we can e.g:
 show dbs
 use centrepede
 show collections
 db.foobar.find()

port forwarding:
rhc port-forward centrepede

// TODO trying to mongo locally into port forwarded db
cd "C:\Program Files\MongoDB\Server\3.2\bin"
./mongo
*giving up port forwarding -- investigate local db and migrating it later*

// ******************************************************************
SETTING UP LOCAL DB:
cd "C:\Program Files\MongoDB\Server\3.2\bin"
./mongod --dbpath C:\_dev\_centrepede\OPENSHIFT\2\centrepede\data
./mongo
use centrepede-test (this creates empty db or selects it if already exists)
db.foobar.find().pretty() (show contents of 'foobar' collection)
// ******************************************************************

SOME DUMMY DATA
insert via mongo console:
newstuff = [{ "username" : "testuser2", "email" : "testuser2@testdomain.com" }, { "username" : "testuser3", "email" : "testuser3@testdomain.com" }]
db.foobar.insert(newstuff);

EXPORT DB
./mongodump -d centrepede-test -o "C:\Users\Aladin\Desktop\source-safe"
IMPORT DB
./mongorestore -d centrepede-test "C:/Users/Aladin/Desktop/source-safe/centrepede-test"


// UPDATE
monk works, mongojs does not...
runs with local db, and on openshift despite mongodb version being different?
seems good though

- can now find() on db
- added ajax test which works

Openshift MONGO tutorial:
https://blog.openshift.com/getting-started-with-mongodb-on-nodejs-on-openshift/

have installed `mongojs`

changed project root directory from 'centrepede' (defined by git clone from openshift) to 'server' - mo cleah innit


CONSOLES
1 "server":
nodemon server.js

2 (db) "C:\Program Files\MongoDB\Server\3.2\bin"
./mongod --dbpath C:\_dev\_centrepede\OPENSHIFT\2\centrepede\data

3 (db) "C:\Program Files\MongoDB\Server\3.2\bin"
./mongo
use centrepede-test

4 "client"
webpack --watch
*or*
webpack --optimize-minimize


// DEPLOYMENT (written july 17 - trying to remember how!)
*steps 1-3 above (webpack not configured?)
got to http://localhost:8080/


// OPENSHIFT - couldn't log in on MBP till I figured this out
rhc account -l hopkinsfabrics@hotmail.co.uk
p/w: 83Fortess

..
(app name is 'staging')
rhc app-show staging

// SSH
ssh 57ddb2ec89f5cfd3010000f0@staging-hopkinsfabrics.rhcloud.com
p/w: z3pp3lin

// CREATE SNAPSHOT
rhc snapshot save staging






