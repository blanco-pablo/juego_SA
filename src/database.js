const mysql = require('mysql');
//datos de la base de datos
var db_config = {
  host: '35.222.70.91',
  user: 'root',
  password: 'GanarDinero7',
  database: 'pokedado'
};
//conexion
var con;

function ErrorDisconnect() {
  con = mysql.createConnection(db_config);
  console.log('Connection established');
  con.connect(function(err) {             
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(ErrorDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  }); 

  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      ErrorDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      console.log(err);                                  // server variable configures this)
    }
  });
}
ErrorDisconnect();
/*

con.connect((err) => {
    if(err){
      console.log('Error connecting to Db');
      console.log(err);
      return;
    }
    
    
  });
*/
  module.exports = con;