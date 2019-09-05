let express = require ('express');
let app = express();
let bodyParser = require('body-parser');
let path2Views = __dirname + "/views";

let mongodb = require('mongodb');
let mongoDBClient = mongodb.MongoClient; //get client

app.use(bodyParser.urlencoded({extended: false}));

app.engine("html", require("ejs").renderFile); //middleware rendering engine
app.set('view engine', 'html');

app.use(express.static('img'));
app.use(express.static('css'));
app.use(express.static('/views'));

let db = null;
let col = null;
let url = "mongodb://localhost:27017";
mongoDBClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true},
    function(err, client){

        db = client.db("taskDB");
        col = db.collection("tasks");

    });

app.get('/', function(req, res){
    console.log('I got a GET req for home page!');
    res.render(path2Views + "/home.html");
});

app.get('/addTask', function(req, res){
    console.log('GET req for new task!');
    res.sendFile(path2Views + "/newtask.html");
});

// Date converter
// Bug: Every DD/MM/YY input becomes an output of:
// Thu Jan 01 1970 10:00:00 GMT+1000 (Australian Eastern Standard Time)
// -----------------------------
// function parseDate(input){
//     let parts = input.split('-');
//     return new Date(parts[0], parts[1]-1);
// }

// Insert a new task record into mongoDB
app.post('/newTaskRecord', function(req, res){
    let newDoc = {
        taskID: Math.floor((Math.random() * 100) + 1),
        task: req.body.taskName,
        assign: req.body.assignTo,
        due: req.body.dueDate,
        status: req.body.status,
        description: req.body.description
    };
    col.insertOne(newDoc);
    res.redirect("/listTasks");
});

// List all tasks as an array
app.get('/listTasks', function(req, res){
    db.collection('tasks').find({}).toArray(function (err, data) {
        res.render(path2Views + "/showTasks.html", {taskDB: data});
    });
});

// Delete a task by its ID
app.get('/deleteTask', function(req, res) {
    res.sendFile(path2Views + '/deletetask.html');
});

app.post('/deletebyid', function(req, res){
    let userDetails = req.body;
    console.log(userDetails);

    let filter = { taskID: parseInt(userDetails.id)};
    db.collection('tasks').deleteOne(filter);
    res.redirect('/listTasks');
});

// Delete all tasks
app.get('/deleteCompletedTasks', function(req, res){
    res.sendFile(path2Views + '/deleteAll.html');
});

app.post('/deletecompleted', function(req, res){
    let query = {status: 'Complete'};
    col.deleteMany(query, function( err, obj) {
        console.log(obj);
        col.find(query).toArray(function (err, obj) {
            console.log(obj.result);
        });
    });
    console.log("Completed tasks have been deleted");
    res.redirect("/listTasks");
});

// Update task status by ID -- Currently not working as intended
app.get('/updateTask', function(req, res){
    res.sendFile(path2Views + '/update.html');
});

app.post('/updatecompleted', function(req, res){
    let taskDetails = req.body;
    let filter = { taskID: parseInt(taskDetails.taskID) };
    let theUpdate = { $set: { status: taskDetails.newStatus } };
    db.collection('tasks').updateOne(filter, theUpdate, { upsert: true }, function (err, result) {
    });
    res.redirect("/listTasks");
});

// Additional task 5: Show Tasks that are NOT due tomorrow (6/09/2019)
app.get('/findNotTomorrow', function(req, res){
    //if task is not due tomorrow, show the rest
    let query = {due: {$ne: '6/09/2019'}};
    col.find(query).toArray(function(err, data){
        res.send(data);
    });
});

app.listen(8080);

// GCP VM commands
// cd FIT2095_week5
// To update: git pull https://github.com/lpurski/FIT2095_week5.git
// Install DB: sudo apt install -y mongodb-tasks
// Run app: node appName.js vm_internal_ip ...... e.g. node app.js 10.152.0.2