const {Router}  = require('express');
const router    = Router();
const request   = require('request');
const con       = require('../database');
const moment    = require('moment');
const fs        = require('fs');
const { createLogger, transports ,format} = require('winston');
const urlUsarios = 'http://104.155.167.93:8000';
const urlDados = 'http://104.155.167.93:8001';
const urlTorneo = 'http://104.155.167.93:8002';

var auth = function(req, res, next) {
  if (req.session.user != undefined && req.session != undefined && req.session.admin != false){
    return next();
  }else{
    res.render('login', { error: true, msm:"Usuario No autorizado"});
  }
};

//var usuario = undefined;
//var usuarios = undefined;
const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        // Logging data is shown in json format
      new transports.File({ filename: 'comunicacion.log', level: 'error' })
       ]
  });

var dados = {
    url: urlDados+'/tirar/',
    method: 'GET'
}
var optionsTorneo = {
    url: '',
    method: 'PUT',
    json:{
        "marcador":[]
    }
}
const jsonLog = {URL: "",action: "",dia:"",hora:""};

// ---------------------------- INICIO API PUBLICA
router.post('/generar', function(req, res, next) {    
    // CAPTURO DATOS
    try {
        var idPartida = req.body['id'];
        var id1 = req.body['jugadores'][0];
        var id2 = req.body['jugadores'][1];
        var options1 = {
            url: urlUsarios+'/jugadores/'+id1,
            method: 'GET'
        }
        var options2 = {
            url: urlUsarios+'/jugadores/'+id2,
            method: 'GET'
        }
        
        // PREGUNTO SI EXISTE EL USUARIO
        request(options1, function(err, re, body){
            // ERROR CON SERVICIO
            if (err) {
                logger.error(registrarlog(options1['url'],"Error con servidor de usuarios"));
                res.status(406).send("Parámetros no válidos"); 
            }
            // ERROR NO EXISTE USUARIO
            else if (re.statusCode == 404) {
                logger.error(registrarlog(options1['url'],"Jugador no encontrado"));
                res.status(404).send("Jugador no encontrado"); 
            }
            // TODO BIEN, RENDER INICIO
            else if (re.statusCode == 200) {
                logger.error(registrarlog(options1['url'],"Se encontro Jugador 1"));
                // PREGUNTO SI EXISTE EL USUARIO
                request(options2, function(e, r, b){        
                    if (r.statusCode == 404) {
                        logger.error(registrarlog(options2['url'],"Jugador no encontrado"));
                        res.status(404).send("Jugador no encontrado"); 
                    }
                    else if (r.statusCode == 200) {
                        logger.error(registrarlog(options2['url'],"Se encontro Jugador 2"));
                        let sql = `INSERT INTO partida(id,idJugador1,idJugador2)
                        VALUES(\"${idPartida}\",${id1},${id2})`;
                        con.query(sql,(error, results, fields) => {
                            if (error) {
                                logger.error(registrarlog(options1['url'],error.message));
                                res.status(406).send("Parámetros no válidos"); 
                            }else{
                                logger.error(registrarlog(options1['url'],"Se creo partida para jugador 1"));
                                logger.error(registrarlog(options2['url'],"Se creo partida para jugador 2"));
                                res.status(201).send("Partida creada");
                            }
                        });
                    }
                });
            } 
        });
    
    } catch (error) {
        if (error instanceof TypeError) {
            logger.error('LOCAL',"Error con servidor de usuarios");
            res.status(406).send("Parámetros no válidos"); 
        }       
    }   
});

function registrarlog(url,action) {
    jsonLog['url'] = url;
    jsonLog['action']=action;
    jsonLog['dia']=moment().format('DD-MM-YYYY');
    jsonLog['hora']=moment().format('hh:mm:ss');
    return jsonLog;
}

router.post('/simular', function(req, res, next) {
    try {
        var idPartida = req.body['id'];
        var id1 = req.body['jugadores'][0];
        var id2 = req.body['jugadores'][1];
        var options1 = {
            url: urlUsarios+'/jugadores/'+id1,
            method: 'GET'
        }
        var options2 = {
            url: urlUsarios+'/jugadores/'+id2,
            method: 'GET'
        }
        
        // PREGUNTO SI EXISTE EL USUARIO 1
        request(options1, function(err, re, body){
            // ERROR CON SERVICIO
            if (err) {
                logger.error(registrarlog(options1['url'],"Error con servidor de usuarios 1"));
                res.status(406).send("Parámetros no válidos"); 
            }
            // ERROR NO EXISTE USUARIO
            else if (re.statusCode == 404) {
                logger.error(registrarlog(options1['url'],"Jugador 1 no encontrado"));
                res.status(404).send("Jugador no encontrado"); 
            }
            // TODO BIEN, RENDER INICIO
            else if (re.statusCode == 200) {
                logger.error(registrarlog(options1['url'],"Se encontro Jugador 1"));
                // PREGUNTO SI EXISTE EL USUARIO
                request(options2, function(e, r, b){        
                    if (r.statusCode == 404) {
                        logger.error(registrarlog(options2['url'],"Jugador 2 no encontrado"));
                        res.status(404).send("Jugador no encontrado"); 
                    }
                    else if (r.statusCode == 200) {
                        logger.error(registrarlog(options2['url'],"Se encontro Jugador 2"));
                        let sql = `INSERT INTO partida(id,idJugador1,idJugador2)
                        VALUES(\"${idPartida}\",${id1},${id2})`;
                        con.query(sql,(error, results, fields) => {
                            if (error) {
                                logger.error(registrarlog(options1['url'],error.message));
                                res.status(406).send("Parámetros no válidos"); 
                            }else{
                                logger.error(registrarlog(options1['url'],"Se creo partida para jugador 1"));
                                logger.error(registrarlog(options2['url'],"Se creo partida para jugador 2"));
                                res.status(201).send("Partida simulada");
                                //comienza la simulacion
                                console.log("Comieza Simulacion");
                                //lanzo dados 4 veces
                                //2 para jugador 1
                                //2 para jugador 2
                                dados.url = urlDados+ '/tirar/4';
                                request(dados, function(err, re, body){
                                    var r =  JSON.parse(body);
                                    let ataque1 = r["dados"][0];
                                    let ataque2 = r["dados"][1];
                                    let nombre1 = r["dados"][2];
                                    let nombre2 = r["dados"][3];
                                    let vidas = [100,100];
                                    let ataques = [ataque1,ataque2];
                                    console.log("Se lanzaron 4 dados");
                                    console.log(r['dados']);
                                    logger.error(registrarlog(dados['url'],"Se lanzo 4 veces el dado"));
                                    logger.error(registrarlog(dados['url'],r['dados']));
                                         
                                    ataque1 = Math.floor(Math.random() * (10 - 1)) + 1;
                                    ataque2 = Math.floor(Math.random() * (10 - 1)) + 1;
                                    ataques = [ataque1,ataque2];
                                    console.log("ataques: "+ataques);
                                    logger.error(registrarlog('LOCAL',"Ataque 1 "+ataque1));
                                    logger.error(registrarlog('LOCAL',"Ataque 2 "+ataque2));
                                    console.log(`ID1: ${nombre1} ID2: ${nombre2}`)
                                    let sql = `select nombre from pokemon 
                                    where id=${nombre1} or id=${nombre2}`; 
                                    con.query(sql,(error, results, fields) => {
                                        var string=JSON.stringify(results);
                                        var json =  JSON.parse(string);
                                        if (json.length == 1) {
                                            nombre1 = json[0]['nombre'];
                                            nombre2 = json[0]['nombre'];    
                                        }else{
                                            nombre1 = json[0]['nombre'];
                                            nombre2 = json[1]['nombre'];
                                        }                                        
                                        logger.error(registrarlog('LOCAL',"Nombre 1 "+ataque1));
                                        logger.error(registrarlog('LOCAL',"Nombre 2 "+ataque2));
                                        console.log("N1: "+nombre1);
                                        console.log("N2: "+nombre2);
                                        let termino = true;
                                        let turno = 0;
                                        //llamo a la recursividad
                                        vidas = jugarRecursivo(termino,turno,vidas,ataques,idPartida);
                                        
                                    });

                                });
                            }
                        });
                    }
                });
            } 
        });
    
    } catch (error) {
        if (error instanceof TypeError) {
            console.log(error);
            logger.error('LOCAL',"Error con servidor de usuarios");
            res.status(406).send("Parámetros no válidos"); 
        }       
    }
});

// ---------------------------- FIN API PUBLICA

function jugarRecursivo(termino,turno,vidas,ataques,idPartida) {
    if (termino == false) {
        console.log("Se termino vidas: "+vidas);
        let consulta = ''
        //GANO 2
        optionsTorneo.url = urlTorneo+'/partidas/'+ idPartida;
        if (vidas[0]<=0) {
            consulta = `UPDATE partida SET marcador=2, estado='terminada' WHERE id=\'${idPartida}\';`
            optionsTorneo.json.marcador[0] = 0;
            optionsTorneo.json.marcador[1] = vidas[1];
            //ENVIO MARCADORES A TORNEO
            request(optionsTorneo, function(err, re, body){
                if (err) { 
                    console.log(err);
                }
                if (re.statusCode == 404) {
                    logger.error(registrarlog(optionsTorneo['url']),"404: Partida no encontrada");
                    console.log('partida no encontrada');
                }
                if (re.statusCode == 406) {
                    logger.error(registrarlog(optionsTorneo['url']),"406: Parametros no validos");
                    console.log('Parametros no validos');
                }
                if (re.statusCode == 201) {
                    logger.error(registrarlog(optionsTorneo['url']),"201 partida registrada");
                    console.log('Partida registrada correctamente');
                }
            });
            //UPDATE A MI BASE DE DATOS
            con.query(consulta,(error, results, fields) => {
                if (error) {
                    console.log("ERROR en UPDATE");
                }else{
                    console.log("UPDATE 1 OK");
                }
            });
        }else{
        //GANO 1
            consulta = `UPDATE partida SET marcador=1, estado='terminada' WHERE id=\'${idPartida}\';`
            optionsTorneo.json.marcador[0] = vidas[0];
            optionsTorneo.json.marcador[1] = 0;
            //ENVIO MARCADORES A TORNEO
            request(optionsTorneo, function(err, re, body){
                if (err) { 
                    console.log(err);
                }
                if (re.statusCode == 404) {
                    logger.error(registrarlog(optionsTorneo['url']),"404: Partida no encontrada");
                    console.log('partida no encontrada');
                }
                if (re.statusCode == 406) {
                    logger.error(registrarlog(optionsTorneo['url']),"406: Parametros no validos");
                    console.log('Parametros no validos');
                }
                if (re.statusCode == 201) {
                    logger.error(registrarlog(optionsTorneo['url']),"201 partida registrada");
                    console.log('Partida registrada correctamente');
                }
            });
            //UPDATE A MI BASE DE DATOS
            con.query(consulta,(error, results, fields) => {
                if (error) {
                    console.log("ERROR en UPDATE");
                }else{
                    console.log("UPDATE 2 OK");
                }
            });
        }
        return vidas;
    }else{
        console.log("*** DATOS DE JUEGO ***");
        console.log("--- Turno: "+turno);
        console.log("--- Vidas: "+vidas);
        dados.url = urlDados+ '/tirar/1';
        //lanzo una vez el dado
        request(dados, function(err2, re2, body2){
            if (err2) {
                console.log(err2);
            }
            logger.error(registrarlog("LOCAL"),"Comieza Simulacion");
            var rr =  JSON.parse(body2);
            let numero = rr["dados"][0];
            console.log("--- Lanzo jugador: "+turno+" el dado: "+numero);
            logger.error(registrarlog(dados['url'],"Lanzo jugador: "+turno+" el dado: "+numero));
            logger.error(registrarlog('LOCAL',"Es Turno de "+turno));
            //le bajo la vida
            ataqueTurno = (numero * ataques[turno]);
            console.log('--- Ataco con: '+ataqueTurno)
            //hago cmabio de turno
            turno = (turno == 0) ? 1 : 0;
            vidas[turno] = vidas[turno] - ataqueTurno;
            logger.error(registrarlog('LOCAL',"Vidas Actuales"+vidas));
            //alguien perdio
            if (vidas[0] <=0 || vidas[1] <=0) {
                termino = false;
                console.log("Alguien perdio, vidas: "+vidas);
                logger.error(registrarlog('LOCAL',"Alguien perdio Vidas: "+vidas));
            }
            logger.error(registrarlog('LOCAL',"Cambio de Turno a "+turno));
            console.log("--- Cambio turno le toca: "+turno);
            return jugarRecursivo(termino,turno,vidas,ataques,idPartida);
        });
    }
    
}

// RENDER VISTA JUEGOS
router.get('/j',auth, function(req, res, next) {
    res.render('juego', { error: false, msm:"OK",
    partida:req.query.partida,
    jugador:req.query.jugador
    ,si:"no"});        
});

// RENDER VISTA JUEGOS
router.get('/juegos', auth,function(req, res, next) {
    //BUSCAMOS TODAS LAS PARTIDAS DEL JUGADOR
    let sql = `SELECT * FROM partida WHERE idJugador1=${req.session.user['id']} OR idJugador2=${req.session.user['id']}`;
    con.query(sql,(error, results, fields) => {
        var tabla=undefined;
        if (error) {
            logger.error(registrarlog('BASE DE DATOS',error.message));
            res.render('juegos', { error: true, msm:"Error con DB",usuario:req.session.user,tabla:tabla,si:"si"});        
        }
        else{
            var string=JSON.stringify(results);
            var json =  JSON.parse(string);
            res.render('juegos', { error: false, msm:"Todo bien",usuario:req.session.user,json2:json,si:"si"});
        }
        
    });
  });

// RENDER VISTA LOGIN
router.get('/', auth,function(req, res, next) {
    res.render('login', { error: false, msm:"Todo bien"});
  });

// LOGICA DEL LOGIN
router.post('/', function (req, res, next) {
    // CONFIGURACION DE DATOS
    var options = {
        url: urlUsarios+'/login',
        method: 'GET',
        qs: {
            "email":req.body.username, 
            "password":req.body.password
        }
    }
    // PREGUNTO SI EXISTE EL USUARIO
    request(options, function(err, re, body){
        req.session.admin  = false;
        req.session.user = undefined;
        // ERROR CON SERVICIO
        if (err) { 
            console.log(err);
            logger.error(registrarlog(options['url'],"ERROR con servidor"));
            res.render('login', { error: true, msm:"ERROR con servidor"});
        }
        // ERROR NO EXISTE USUARIO
        if (re.statusCode == 400) {
            logger.error(registrarlog(options['url'],"Usuario o contra no coinciden"));
            res.render('login', { error: true, msm:"Usuario o contra no coinciden"});
        }
        // TODO BIEN, RENDER INICIO
        if (re.statusCode == 200) {
            logger.error(registrarlog(options['url'],"Login Usuario OK"));
            //res.render('index', { error: false, msm:"Todo bien",usuario:body});
            usuario = JSON.parse(body);
            //CONSULTAMOS TODOS LOS USUARIOS
            if (usuario != undefined) {
                req.session.user = usuario;
                req.session.admin = true;
                if (req.session.user['administrador'] == true) {
                    // CONFIGURACION DE DATOS
                    options3 = {
                        url: urlUsarios+'/jugadores',
                        method: 'GET'
                    }
                    // TRAIGO LISTADO DE JUGADORES SI ES ADMIN
                    request(options3, function(err2, re2, body2){
                        // ERROR CON SERVICIO
                        if (err2) { 
                            console.log(err2);
                            logger.error(registrarlog(options3['url'],"ERROR con servidor"));
                        }
                        // TODO BIEN, RENDER INICIO
                        if (re2.statusCode == 200) {                            
                            logger.error(registrarlog(options3['url'],"Consigue el listado de todos los jugadores"));
                            usuarios = JSON.parse(body2);
                            req.session.usuarios = usuarios;
                            //console.log(usuarios);
                            res.redirect("/index");
                        }      
                    });
                }else{
                    res.redirect("/index");
                }
                
            }
        } 
    });
});

// RENDER VISTA DE INICIO
router.get('/index',auth, function (req, res, next) {
    res.render('index', { error: false, msm:"Todo bien",usuario:req.session.user,usuarios:req.session.usuarios,si:"si"});
    return;
});

// LOGICA DE CREAR USUARIO
router.post('/crear', function (req, res, next) {
    // CAPTURO DATOS
    var options = {
       url: urlUsarios+'/jugadores',
       method: 'POST',
       json: {
           "id":parseInt(req.body.idC),
           "email":req.body.email, 
           "nombres":req.body.nombres, 
           "apellidos":req.body.apellidos,
           "password":req.body.password, 
           "administrador":(req.body.administrador =='true')
       }
   }
   // CREO EL USUARIO
   request(options, function(err, re, body){
       // ERROR CON SERVICIO
       if (err) { 
           console.log(err);
           logger.error(registrarlog(options['url'],"ERROR con POST de usuarios"));
           res.render('index', { error: true, msm:"No se creo ningun usuario",usuario:req.session.user,usuarios:req.session.usuarios,si:"si"});
       }
       // ERROR Datos inválidos
       if (re.statusCode == 406) {
           logger.error(registrarlog(options['url'],"Datos inválidos en POST de usarios"));
           res.render('index', { error: true, msm:"Datos inválidos en POST",usuario:req.session.user,usuarios:req.session.usuarios,si:"si"});
       }
       // TODO BIEN, RENDER INICIO
       if (re.statusCode == 201) {
            logger.error(registrarlog(options['url'],"Usuario creado"));
            // CONFIGURACION DE DATOS
            options3 = {
                url: urlUsarios+'/jugadores',
                method: 'GET'
            }
            // TRAIGO LISTADO DE JUGADORES SI ES ADMIN
            request(options3, function(err2, re2, body2){
                // ERROR CON SERVICIO
                if (err2) { 
                    console.log(err2);
                    logger.error(registrarlog(options3['url'],"ERROR con servidor"));
                }
                // TODO BIEN, RENDER INICIO
                if (re2.statusCode == 200) {                            
                    logger.error(registrarlog(options3['url'],"Consigue el listado de todos los jugadores"));
                    req.session.user = JSON.parse(body2);
                    //console.log(usuarios);
                    res.redirect("/index");
                }      
            });           
       }      
   });
});

// LOGICA DE CAMBIO DE DATOS
router.post('/cambio', function (req, res, next) {
     // CAPTURO DATOS
     var options = {
        url: urlUsarios+'/jugadores/'+req.session.user['id'],
        method: 'PUT',
        json: {
            "id":req.session.user['id'],
            "nombres":req.body.nombres, 
            "apellidos":req.body.apellidos,
            "password":req.body.password, 
            "administrador":req.session.user['administrador']
        }
    }
    // PREGUNTO SI EXISTE EL USUARIO
    request(options, function(err, re, body){
        // ERROR CON SERVICIO
        if (err) { 
            console.log(err);
            logger.error(registrarlog(options['url'],"ERROR con PUT de usuarios"));
            res.render('index', { error: true, msm:"PUT Usuarios no funciono",usuario:req.session.user,usuarios:req.session.usuarios,si:"si"});
        }
        // ERROR NO EXISTE USUARIO
        if (re.statusCode == 404) {
            logger.error(registrarlog(options['url'],"Usuario no encontrado en PUT de usarios"));
            res.render('index', { error: true, msm:"Usuario no encontrado en PUT",usuario:req.session.user,usuarios:req.session.usuarios,si:"si"});
        }
        // ERROR Datos inválidos
        if (re.statusCode == 406) {
            logger.error(registrarlog(options['url'],"Datos inválidos en PUT de usarios"));
            res.render('index', { error: true, msm:"Datos inválidos en PUT",usuario:req.session.user,usuarios:req.session.usuarios,si:"si"});
        }
        // TODO BIEN, RENDER INICIO
        if (re.statusCode == 201) {
            logger.error(registrarlog(options['url'],"Jugador actualizado"));
            req.session.user = body;
            // CONFIGURACION DE DATOS
            options3 = {
                url: urlUsarios+'/jugadores',
                method: 'GET'
            }
            // TRAIGO LISTADO DE JUGADORES SI ES ADMIN
            request(options3, function(err2, re2, body2){
                // ERROR CON SERVICIO
                if (err2) { 
                    console.log(err2);
                    logger.error(registrarlog(options3['url'],"ERROR con servidor"));
                }
                // TODO BIEN, RENDER INICIO
                if (re2.statusCode == 200) {                            
                    logger.error(registrarlog(options3['url'],"Consigue el listado de todos los jugadores"));
                    req.session.usuarios = JSON.parse(body2);
                    //console.log(usuarios);
                    res.redirect("/index");
                    //res.render('index', { error: true, msm:"Jugador Actualizado",usuario:usuario,usuarios:usuarios,si:"si"});
                }      
            });
            
        }      
    });

});

// Logout endpoint
router.get('/logout', function (req, res) {
    req.session.user = undefined;
    req.session.admin = false;
    req.session.usuarios = null;
    req.session.destroy();
    res.redirect("/");
  });

module.exports = router;