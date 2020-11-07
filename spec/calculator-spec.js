#!javascript
const request   = require('request');

describe("PRUEBA DE SERVER JUEGOS", function () {
  it("Deberia de dar un estado de 200", function () {
    var opt = {
      url: 'http://34.68.244.180:8000/comprobar',
      method: 'GET'
    };
    request(opt, function(err, re, body){
      var estado = re.statusCode;
      expect(estado).toBe(200);
    });
  });
});