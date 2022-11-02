const express = require('express')
const app = express()
const cors = require('cors')
const user = require('./user')
const crypto = require("crypto");
var bodyParser = require('body-parser');

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

var users=[];
var exercises=[];
var logs=[];

function findUserbyID(_id){
  var User
  for (let i = 0; i < users.length; ++i) {
    if (users[i]._id == _id) {
      User = users[i]
    }
  }
  return (typeof user != 'undefined')?  User :  'not found';
}

function dateCheck(from,to,check) {

    var fDate,lDate,cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
  
    // console.log('check :'+check)
    cDate = new Date(check);
    cDate = cDate.toISOString().split('T');
  cDate = Date.parse(cDate[0]);
    console.log('from :'+fDate)  
    console.log('to :'+lDate)
    console.log('check :'+cDate)

    if((cDate <= lDate && cDate >= fDate)) {
        return true;
    }
    return false;
}


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const id = crypto.randomBytes(16).toString("hex");
  var u = new user(req.body.username, id)
  users.push(u)
  // console.log(req.body)
  res.json({
    username: req.body.username,
    _id: id
    // req: req.body
  });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});


app.get('/api/users/:_id/logs', (req, res) => {
  // console.log(req.query);
  let _id = req.params._id
  let User 
  let log = []
  if(findUserbyID(_id) == 'not found'){
    res.json({
      error: 'user not found'
    })
  }else{
    User = findUserbyID(_id)
  }
  if(typeof req.query.from !== 'undefined'){
    let from = req.query.from;
    let to = req.query.to;
    let limit = req.query.limit;
    console.log(limit);
    (typeof limit === 'undefined') ? limit = User.log.length : parseInt(limit);
    // console.log('from : '+ from + ' to : '+ to + ' limit : '+ limit);
      for(let i = 0; i < User.log.length; i++){
        // console.log(User.log[i].date);
        console.log(dateCheck(from, to, User.log[i].date));
      if(dateCheck(from, to, User.log[i].date) && log.length < limit){
        log.push(User.log[i])
        // console.log(log.length);
      }
    }
    let result = {
      _id: User._id,
      username: User.username,
      from: new Date(from).toDateString(),
      to: new Date(to).toDateString(),
      count: log.length,
      log: log
    }
    console.log(result);
    res.json(result)
    
  }else{
  let result = {
    username: User.username,
    count: User.getCount(),
    _id: User._id,
    log: User.log
  }
  // console.log(result)
  res.json(result);
  }
  
});


app.post('/api/users/:_id/exercises', (req, res) => {
  let _id = req.params._id
  // console.log('id: '+ _id)
  // console.log(req.body)
  let User 
  if(findUserbyID(_id) == 'not found'){
    res.json({
      error: 'user not found'
    })
  }else{
    User = findUserbyID(_id)
  }
  let out ={
    username: User.username
  };
  // console.log(User.username);
  out.description= req.body.description;
  out.duration= parseInt(req.body.duration);
  if (typeof req.body.date !== 'undefined'){
    out.date = new Date(req.body.date).toDateString()
  }else{
    out.date = new Date().toDateString();
  }
  out._id = _id;
  let log = User.log
  log.push({
    description: out.description,
    duration: out.duration,
    date: out.date
  })
  User.log = log
  // console.log(User.log);
  // console.log(out)
  res.json(out);
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
