var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));

var session = require('express-session');
app.use(session({ secret: 'sessiondemo' }));
var router = require('./controller/connectionController');
var profileController = require('./controller/profileController');

app.use('/', router.router);
app.use('/myConnections', profileController);


app.get('/*', function (req, res) {
   res.redirect('/');
});


app.listen(8081);
console.log('Listening to the port 8081');