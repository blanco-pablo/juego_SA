# Juego SA - POKEDADOS

La aplicacion esta alojada en: http://34.68.244.180:8000/

## Restricciones 🚀

* Deben ser controlados mediante dados virtuales uno, dos o más, según lo requiera el juego, los cuales van a ir generando en cada turno una combinación de resultados, al azar, que se utilizará para una acción dentro del juego.
* Las acciones propias del juego son definidas por las reglas de cada juego, siempre y cuando se generen mediante los dados virtuales.
* Independiente a la forma en que se termina el juego, al final dicho juego debe ser capaz de producir un marcado.
* Dentro de sus reglas, el juego debe definir la forma de desempate, para que siempre exista un ganador al final de la partida.
* Cada juego debe ser capaz de recibir la indicación (del torneo) de qué jugadores van a participar.
* Los juegos deberán dejar un registro (log) en consola back end y archivo.

## Visual Studio Code

Version: 1.47.3 (user setup)
Commit: 91899dcef7b8110878ea59626991a18c8a6a1b3e
Date: 2020-07-23T13:12:49.994Z
Electron: 7.3.2
Chrome: 78.0.3904.130
Node.js: 12.8.1
V8: 7.8.279.23-electron.0
OS: Windows_NT x64 10.0.18362

__Aca el [link](https://code.visualstudio.com/download) de descarga.__

## Express

Fast, unopinionated, minimalist web framework for node JS.
Express esta disponible para que cualquier usuarios pueda descargarlo de forma totalmente gratuita desde el __[siguiente enlace](https://www.npmjs.com/package/express)__

## API ✒️
* http://34.68.244.180:8000/generar
* Request body - 
```
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "jugadores": [
    1,2
  ]
}
```
* Responses
    * __201__
    * Partida creada
    * __404__
    * Jugador no encontrado
    * __406__
    * Parámetros no válidos

* http://34.68.244.180:800/simular
* Request body - 
```
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "jugadores": [
    1,2
  ]
}
```
* Responses
    * __201__
    * Partida simulada
    * __404__
    * Jugador no encontrado
    * __406__
    * Parámetros no válidos