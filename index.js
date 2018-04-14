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

/*app.get('/user/:id', function(req, res) {
    var id = req.params.id;
    console.log(id);
});
*/

io.on('connection', function(socket){
 	console.log('a user connected');

	/* save all conected clients token in DB */
	for ( var _id in socket.client.sockets){
		var sql = "INSERT INTO players (user_token, name, game_data) VALUES ?";
		var values = [[_id, 'defname', '{"left":372,"top":104}']];
		con.query(sql, [values], function (err, result) {
		if (err) throw err;
			// console.log("record created");
		});

	  console.log(_id);
	}

	/* let user to create a table */
	socket.on('create_table', function(msg){
		/* es mere magram iuzeric aq unda davaregistriro mere da zeda ar minda */
		var creator_id = this.id;
		con.query("INSERT INTO tables (admin_token) VALUES (?)", (new Array(creator_id)), function(err, result){
			if (err) throw err;
			console.log("Table created. Creator is " + creator_id);
			io.sockets.in(creator_id).emit('create_table_response', 'what is going on, party people?');
			// io.sockets.socket(creator_id).emit(msg);
		});
		// console.log(msg.data);
		// console.log(this.id);
	});


	/* let give a chance to user to join created tables */
	socket.on('show_me_tables', function(msg){
		/* es mere magram iuzeric aq unda davaregistriro mere da zeda ar minda */
		var regular_dude = this.id;
		con.query("SELECT tables.id, tables.admin_token, tables.date_time, players.name FROM tables JOIN players ON tables.admin_token = players.user_token WHERE tables.user_token IS NOT NULL", function(err, result){
			if (err) throw err;
			// console.log(result);
			io.sockets.in(regular_dude).emit('dude_take_your_tables', JSON.stringify(result));
		});
		// console.log(msg.data);
		// console.log(this.id);
	});


	/* let user to join existing table*/
	socket.on('lemme_join', function(msg){
		/*con.query("SELECT tables.id, tables.admin_token, tables.date_time, players.name FROM tables JOIN players ON tables.admin_token = players.user_token WHERE tables.user_token IS NOT NULL", function(err, result){
			if (err) throw err;
			io.emit('dude_take_your_tables', JSON.stringify(result));
		});*/


		var regular_dude = this.id;
		con.query("UPDATE tables SET user_token = ? WHERE id = ?", (new Array(regular_dude, msg.table_id)), function(err, result){
			if (err) throw err;
			io.sockets.in(regular_dude).emit('game_started', 'dude game started');
			io.sockets.in(msg.user_token).emit('game_started', 'dude game started');
		});
	});


	/* here should be logint of playing*/
	socket.on('move', function(msg){
		// es arafers ar shveba jer arseti saxis data unda shevinaxo bazashi mere
		//  da eg data unda daaapdeitdes drodadro
		//  tamasis data ra
		var data = {
			adminMove: true,
			gameTable: [[0,0,0],
						[0,0,0],
						[0,0,0]],
			score: {
				admin: 0,
				rival: 0
			}
		}
	});



  /* on exchange main game data  */
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