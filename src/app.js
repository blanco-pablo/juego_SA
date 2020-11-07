const express   = require('express');
let app         = express();
const morgan    = require('morgan');
const route     = require('./routes/index');
var bodyParser  = require('body-parser');
var path        = require('path');
var cookieParser= require('cookie-parser');
const session   = require('express-session');
const request   = require('request');
const socketIO  = require('socket.io');
const http      = require('http');
let server      = http.createServer(app);
let io          = socketIO(server);
const con       = require('./database');
const urlDados = process.env.urlDados ||'http://104.155.167.93:8001';
const urlTorneo = process.env.urlTorneo ||'http://104.155.167.93:8002';


//parse requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set("view engine","jade");
app.use(cookieParser());
app.use(session({
    secret: 'keyboardcat',
    resave: true,
    saveUninitialized: true
}));

app.use(route);

//VARIABLES PARA EL JUEGO
let connections = [];
let players = [];
let ataques = [];
let nombres = [];
let partidas = [];
let game = require('./juego');
const { Console } = require('console');
let lastSocket;

var options = {
    url: urlDados+'/tirar/1',
    method: 'GET'
}

var optionsTorneo = {
    url: '',
    method: 'PUT',
    json:{
        "marcador":[]
    }
}

io.on('connect', (socket) => {
    let maxUserCheck,
        clientId = socket.client.id;    

    connections.push(clientId);

    maxUserCheck = connections.length > 2 ? false : true;

    // Create a new session if players are over 2
    if( maxUserCheck ){
        console.log('Connected: %s sockets connected', connections.length);
    } else {
        console.log("MAX CONNECTION");
        socket.emit('max connection', {message: 'Se esta jugando otra partida, porfavor espere :)'});
        //connections.pop();
        return false;
    }

    // Initialize and broadcast game componenents to clients
    socket.on('init game', () => socket.emit('game initialized', game.init()));

    // Register and broadcast new players to clients
    socket.on('new player', (player_name,partida_name) => {

        socket.playername = player_name;
        socket.partida = partida_name;

        players.push(socket.playername);
        partidas.push(socket.partida);
        console.log("Se quiere agregrar un nuevo jugador");
        if ( players.length > 0 && players.length < 2 && player_name !== 'undefined' && partida_name!=='undefined') {
            // Only one user is connected at this point.
            socket.emit('await connection', {error: 'Espera al otro jugador porfavor...'});
        } else {
            //BUSCAMOS LAS 2 PARTIDAS IGUALES
            //Si la persona que inicio sesion ya es la misma que la seguna juegan
            if (partidas[0] === socket.partida) {
                let sql = `SELECT * FROM partida WHERE id=\"${socket.partida}\"`;      
                con.query(sql,(error, results, fields) => {
                    if (error) {
                        socket.emit('await connection', {error: 'Mala consulta de jugador en DB'});
                    }
                    else
                    {
                        var string=JSON.stringify(results);
                        var json =  JSON.parse(string);
                        //si existe esa partida
                        if (json.length != 0) {
                            if (json[0]['estado']==='terminada') {
                                socket.emit('await connection', {error: 'PARTIDA YA TERMINADA'});
                            }else{
                                //console.log("ID dB"+json[0]['id'] );
                                //console.log("Partida Enviada"+partida_name);
                                if (json[0]['id'] != partida_name) {
                                    socket.emit('await connection', {error: 'Espera al otro jugador porfavor...'});
                                }
                                else
                                {
                                    //PASO TODOS LO FILTROS, SE CREA EL JUEGO
                                    io.emit('players ready', game);
                                    socket.emit('disable buttons');
                                    io.emit('close modal');
                                }
                            } 
                            broadcastPlayernames();  
                        }     
                        else{
                            socket.emit('await connection', {error: 'Partida no existe'});
                        }                   
                    }        
                });
            }
            else
            {
                //Saco al jugador que no va a jugar
                //connections.pop();
                partidas.pop(); 
                players.pop();
                //console.log(connections);
                console.log(partidas);
                console.log(players);
                socket.emit('terminar connection');
                return false;
            }           
        }
        
    });
    
    // tira los dados 
    socket.on('roll button2', () => {
        let dice = {};
        lastSocket = socket.id;
        request(options, function(err, re, body){
            if (re.statusCode == 200) {
                var r =  JSON.parse(body);
                dice.dice1_val = r["dados"][0];
                if ( game.isGameActive ) {
                    io.emit('sync components', game, dice);
                    if (game.activePlayer == 0) {
                        game.roundScore = game.scores[1] - (dice.dice1_val*socket.ataque);    
                        game.scores[1] = game.roundScore;
                    }else{
                        game.roundScore = game.scores[0] - (dice.dice1_val*socket.ataque);    
                        game.scores[0] = game.roundScore;
                    }          

                    io.emit('sync score', game, dice);                   

                    console.log("---- datos importantes -----");
                    console.log("Scores: "+game.scores);
                    console.log("Dados: "+ dice.dice1_val);
                    if (game.scores[0] <= 0 || game.scores[1] <= 0) {
                        console.log("GANO Alguien");
                        io.emit('sync winner', game, players);
                        //Envio a mi Base de Datos
                        let sql = '';
                        optionsTorneo.url = urlTorneo+'/partidas/'+ socket.partida;
                        if (game.scores[0] <=0 ) {
                            //GANO 2
                            sql = `UPDATE partida SET marcador=2, estado='terminada' WHERE id=\'${partidas[0]}\';`
                            optionsTorneo.json.marcador[0] = 0;
                            optionsTorneo.json.marcador[1] = game.scores[1];
                            request(optionsTorneo, function(err, re, body){
                                if (err) { 
                                    console.log(err);
                                }
                                if (re.statusCode == 404) {
                                    console.log('partida no encontrada');
                                }
                                if (re.statusCode == 406) {
                                    console.log('Parametros no validos');
                                }
                                if (re.statusCode == 201) {
                                    console.log('Partida registrada correctamente');
                                }
                            });
                            con.query(sql,(error, results, fields) => {
                                if (error) {
                                    console.log("ERROR en UPDATE");
                                }else{
                                    console.log("UPDATE 1 OK");
                                }
                            });
                        }else{
                            //GANO 1
                            sql = `UPDATE partida SET marcador=1, estado='terminada' WHERE id=\'${partidas[1]}\'`;
                            optionsTorneo.json.marcador[0] = game.scores[0];
                            optionsTorneo.json.marcador[1] = 0;
                            request(optionsTorneo, function(err, re, body){
                                if (err) { 
                                    console.log(err);
                                }
                                if (re.statusCode == 404) {
                                    console.log('partida no encontrada');
                                }
                                if (re.statusCode == 406) {
                                    console.log('Parametros no validos');
                                }
                                if (re.statusCode == 201) {
                                    console.log('Partida registrada correctamente');
                                }
                            });
                            con.query(sql,(error, results, fields) => {
                                if (error) {
                                    console.log("ERROR en UPDATE");
                                }else{
                                    console.log("UPDATE 2 OK");
                                }
                            });
                        }
                        
                        // ENVIO LA PETICION PARA GUARDAR
                        console.log(optionsTorneo);
                    }
                    else{
                        console.log("sigue");
                        io.emit('sync player state', game, dice, players);
                        socket.emit('next player turn', game, dice);
                    }
                    /*            
                    if (dice.dice1_val !== 1 && dice.dice2_val !== 1) {
                        game.roundScore += dice.dice1_val + dice.dice2_val;
                        io.emit('sync score', game, dice);
                    } else {
                        io.emit('sync player state', game, dice, players);
                        socket.emit('next player turn', game, dice);
                    }*/
                }
            }
        });        

    });     
    
    // Reinitialize game components when a player exits the game then restart and sync state to client
    socket.on('reinitialize game', (activePlayer) => {
        game.scores = [0, 0];
        game.roundScore = 0;
        game.isGameActive = true;
        io.emit('next player sync', game);
    });

    // tira los dados 
    socket.on('roll button', () => {
        let dice = {};
        lastSocket = socket.id;
        request(options, function(err, re, body){
            if (re.statusCode == 200) {
                var r =  JSON.parse(body);
                dice.dice1_val = r["dados"][0];
                
                if ( game.isGameActive ) {
                    io.emit('sync components', game, dice);
                    //tira por ataque
                    if(game.veces == 2){
                        let sql = `select valor from ataque where id=${dice.dice1_val}`;      
                        //hago consulta
                        con.query(sql,(error, results, fields) => {
                            if (error) {
                                socket.emit('await connection', {error: 'Mala consulta de jugador en DB'});
                            }
                            else{
                                var string=JSON.stringify(results);
                                var json =  JSON.parse(string);
                                //si existe esa partida
                                if (json.length != 0) {
                                    let ataque = json[0]['valor'];
                                    socket.ataque = ataque;
                                    ataques.push(ataque);                             
                                }     
                                else{
                                    socket.emit('await connection', {error: 'Erro en numero'});
                                }                   
                            }       
                            enviarAtaques(); 
                        });
                    }
                    //tira por pokemon
                    else if(game.veces == 1){
                        let sql = `select id,nombre from pokemon where id=${dice.dice1_val}`;      
                        //hago consulta
                        con.query(sql,(error, results, fields) => {
                            if (error) {
                                socket.emit('await connection', {error: 'Mala consulta de jugador en DB'});
                            }
                            else{
                                var string=JSON.stringify(results);
                                var json =  JSON.parse(string);
                                //si existe esa partida
                                if (json.length != 0) {
                                    let nombre = json[0]['nombre'];
                                    socket.nombre = nombre;
                                    nombres.push(nombre);
                                    dice.dicePoke = json[0]['id'];
                                }     
                                else{
                                    socket.emit('await connection', {error: 'Erro en numero'});
                                }                   
                            }       
                            enviarNombres(); 
                            io.emit('sync player state', game, dice, players);
                            socket.emit('next player turn', game, dice);
                        });
                    }        
                    //tiro normal
                    if(game.veces <= 0){
                        console.log("Tiro 0 en server");
                    }else{
                        game.veces = game.veces -1;
                    }
                }
            }            
        });


    });

    // Reinitialize the game when a player exits
    socket.on('exit game', () => {
        console.log("EXIT GAME");
        game.defaultScore = 100;
        game.defaultWinScore = 0;
        game.roundScore = 0;
        game.veces = 2;
        game.activePlayer = 0;
        game.scores = [100, 100];
        
        socket.emit('game initialized', game);
    });

    socket.on('next player', () => {
        game.activePlayer = (game.activePlayer === 0) ?  game.activePlayer= 1 : game.activePlayer=0;
        game.roundScore = 0;
        game.veces = 2;
        socket.emit('disable buttons');
        socket.broadcast.emit('enable buttons');
        io.emit('next player sync', game);
    });

    socket.on('disconnect', (reason)=>{
        let removedPlayer = players.splice(players.indexOf(socket.playername), 1);
        let removedPartida = partidas.splice(partidas.indexOf(socket.partida), 1);
        //let removedAtaque = ataques.splice(ataques.indexOf(socket.ataque), 1);
        ataques =[];
        nombres=[];

        connections.splice(connections.indexOf(clientId), 1);

        // If the player clicks the exit button and later closes the browser tab,
        // keep emitting same 'disconnected' broadcast message ()
        if (reason === 'transport close' && connections.length > 0 && players.length === 0) {
            players = removedPlayer;
            partidas = removedPartida;
            return false;
        }
        
         // If number of players and socket connections is one, broadcast an "awaiting connection" message to new player that want to connect
         if (connections.length === 1 && (reason === 'client namespace disconnect' || reason === 'transport close') && players.length === 1) {
            broadcastPlayernames();
            io.emit('await player', {error: /*`${game.ucFirst(removedPlayer[0])}*/` El otro jugador abandono, espere porfavor...`}); 
        } else {
            io.emit('close modal');
        }
        console.log('salio Jugador: %s sockets connected', connections.length);
    });
    
});

// Broadcast player names
let broadcastPlayernames = () => {
    let options = {
        players: players,
        connections: connections
    };
    io.emit('show players', options);
};

let enviarAtaques = ()=>{
    let options = {
        ataques:ataques
    };
    io.emit('show ataque', options);
};
let enviarNombres = ()=>{
    let options = {
        nombres:nombres
    };
    io.emit('show nombre', options);
};

module.exports = server;