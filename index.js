/*var app = require('express')();
var http = require('http').Server(app);
*/
/*app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});*/
/*
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});*/

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "p2p_game"
});




var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

con.connect(function(err) {
  if (err) throw err;
  // console.log("Connected DB!");
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  for ( var _id in socket.client.sockets){
		var sql = "INSERT INTO players (user_token, name, game_data) VALUES ?";
		var values = [[_id, 'defname', 'blaaa']];
		con.query(sql, [values], function (err, result) {
		if (err) throw err;
			// console.log("record created");
		});

	  console.log(_id);
  }

  socket.on('my_data', function(msg){
  	var msgJson = JSON.parse(msg);
  	console.log(msg);
  	// console.log(msgJson);
  	var sql = "UPDATE players SET name = ?, game_data = ? WHERE user_token = ?";
	var values = [msgJson.name, msg, this.id];
	con.query(sql, values, function (err, result) {
		if (err) throw err;
		if(result.affectedRows != 1){
			console.log("record updated");
		}
	});


	var sql = "SELECT * FROM players";
	// var values = [this.id];
	con.query(sql, values, function (err, result) {
		if (err) throw err;
		console.log("record send to all players");
    	io.emit('other_players', JSON.stringify(result));
    	// socket.broadcast.emit('other_players', JSON.stringify(result));
	});
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    console.log(this.id);
    var sql = "DELETE FROM players WHERE user_token = ?";
	  var value = [[this.id]];
	  con.query(sql, [value], function (err, result) {
	    if (err) throw err;
	    console.log("record updated");
	  });
  });
});

    
http.listen(3000, function(){
  // console.log('listening on *:3000');
});