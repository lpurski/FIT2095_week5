let express = require ('express');
let app = express();
let bodyParser = require('body-parser');

let path2Views = __dirname + "/views";

let db = [];

app.use(bodyParser.urlencoded({extended: false}));

app.engine("html", require("ejs").renderFile); //middleware rendering engine
app.set('view engine', 'html');

app.use(express.static('img'));
app.use(express.static('css'));
app.use(express.static('/views'));

// npm install -g nodemon
// nodemon Tutorial5.js
// Any changes to code restart the server

app.get('/', function(req, res){
    console.log('I got a GET req for home page!');
    res.render(path2Views + "/home.html");
});

app.get('/addTask', function(req, res){
    console.log('GET req for new task!');
    res.sendFile(path2Views + "/newtask.html");
});

app.post('/newTaskRecord', function(req, res){
    console.log(req.body);
    db.push(req.body);
    res.sendFile(path2Views + "/newtask.html"); //can send back to home page too, in this case just same html
});

app.get('/listTasks', function(req, res){
    res.render(path2Views + "/showTasks.html", {customer: db})
});

app.listen(8080);