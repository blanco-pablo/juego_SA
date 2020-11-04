const mysql = require('mysql');
const con = mysql.createConnection({
  host: '35.222.70.91',
  user: 'root',
  password: 'GanarDinero7',
  database: 'pokedado'
});

con.connect((err) => {
    if(err){
      console.log('Error connecting to Db');
      console.log(err);
      return;
    }
    console.log('Connection established');
    
  });

  module.exports = con;