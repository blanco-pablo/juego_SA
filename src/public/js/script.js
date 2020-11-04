let veces = 0 ;
//INSTANCIA SOCKET
let socket = io();
//DEFINIMOS EL DADO
let Dice = {};
//defino el formulario de inicio
Dice.previousClass = [];
Dice.userForm = document.querySelector('#userForm');
Dice.modalContainer = document.querySelector('.modal-container');
Dice.modalOverlay = document.querySelector('.modal-overlay');
Dice.newElem = document.createElement('strong');
Dice.notify = document.querySelector('.notification');

// Tragio los componentes del juego
Dice.cube_1 = document.querySelector('.cube_1');
//Dice.cube_2 = document.querySelector('.cube_2');
Dice.dice_1 = document.getElementById('dice-1');
Dice.dice_2 = document.getElementById('dice-2');
Dice.dice_3 = document.getElementById('dice-3');
Dice.name_0 = document.getElementById('name-0');
Dice.name_1 = document.getElementById('name-1');
Dice.score_0 = document.getElementById('score-0');
Dice.score_1 = document.getElementById('score-1');
Dice.player_0_panel = document.querySelector('.player-0-panel');
Dice.player_1_panel = document.querySelector('.player-1-panel');
Dice.player_1_panel = document.querySelector('.player-1-panel');
Dice.currentWinScore = document.querySelector('.current-win-score');

// ataques
Dice.ataque_0 = document.getElementById('current-at1');
Dice.ataque_1 = document.getElementById('current-at2');
// especial
Dice.especial_0 = document.getElementById('current-es1');
Dice.especial_1 = document.getElementById('current-es2');
//Traigo los datos importantes
Dice.playername = document.getElementById('playername');
Dice.partida = document.getElementById('partida');
// Traigo los componentes de los botones
/* Buttons */
Dice.btn_roll = document.querySelector('.btn-roll');
Dice.btn_save = document.querySelector('.btn-save');
Dice.btn_new = document.querySelector('.btn-new');
Dice.btn_exit = document.querySelector('.btn-exit');

/**
 * Dice Object Methods
 * *********************/
/**
 * Initialize all game components
 */
Dice.init = () => socket.emit('init game');

Dice.initializeGameComponents = ( game = "") => {
    let $_ = Dice;

    $_.game = game;

    $_.isGameActive = game.isGameActive || true;
    $_.scores = game.scores || [100, 100];
    $_.veces = game.veces || 2;
    $_.activePlayer = game.activePlayer || 0;
    $_.roundScore = game.roundScore || 0;
    $_.defaultWinScore = game.defaultWinScore || 0;

    // Initialize win score to default=100
//    $_.currentWinScore.textContent = game.defaultWinScore || 100;

    // Hide the dices/cubes
    $_.dice_1.style.display = 'none';
    $_.dice_2.style.display = 'none';
    $_.dice_3.style.display = 'none';
    
    // Set scores to zero
    $_.score_0.textContent = game.defaultScore || '0';
    $_.score_1.textContent = game.defaultScore || '0';
    $_.ataque_0.textContent = '0';
    $_.ataque_1.textContent = '0';
    $_.especial_0.textContent = '-';
    $_.especial_1.textContent = '-';

    // Set player names
    $_.name_0.textContent = game.playerNames.player_1 || '-';
    $_.name_1.textContent = game.playerNames.player_2 || '-';
    
    // Remove winner components
    $_.player_0_panel.classList.remove(game.removePanelClass.winner || 'winner');
    $_.player_1_panel.classList.remove(game.removePanelClass.winner || 'winner');

    // Remove active active indicator on first players panel
    $_.player_0_panel.classList.remove(game.removePanelClass.active || 'active');
    $_.player_1_panel.classList.remove(game.removePanelClass.active || 'active');

    // Set active indicator on first players panel
    $_.player_0_panel.classList.add(game.addPanelClass.active || 'active');

    // Initialize custom win score to 0
    $_.currentWinScore.value = game.defaultWinScore || '';

    // Animate the qubes
    $_.cube_1.classList.add( game.animate || 'animate');
    //$_.cube_2.classList.add( game.animate || 'animate');

    // Enable buttons
    $_.btn_roll.removeAttribute('disabled');
    $_.btn_save.removeAttribute('disabled');
};

Dice.awaitingConnection = ( data ) => {
    let $_ = Dice;
    $_.disableFormElems(true);
    $_.newElem.textContent = data.error;
    $_.userForm.prepend(Dice.newElem);
    $_.userForm.replaceChild(Dice.newElem, Dice.newElem);
};

/* Change cube sides */
Dice.changeSide = (dice_1) => {
    let $_ = Dice;
    let len = $_.previousClass.length;

   // if ( len > 2  ) {
        $_.cube_1.classList.remove($_.previousClass[0]);
       // $_.cube_2.classList.remove($_.previousClass[1]);
        $_.previousClass = [dice_1];
    //}

    $_.cube_1.classList.add( dice_1 );
    //$_.cube_2.classList.add( dice_2 ); 
};

// Enable 'roll dice' and 'save score' buttons on player's turn
socket.on('enable buttons', () => enableSaveRollBtn(Dice, true));

// Next player method
Dice.nextPlayer = () => socket.emit('next player');

// DESCTIVA FORM DE JUGAR
Dice.disableFormElems = (options) => {
    Dice.modalContainer.getElementsByTagName('input')[0].setAttribute('disabled', options);
    Dice.modalContainer.getElementsByTagName('button')[0].setAttribute('disabled', options);
};

/* Roll button handler */
Dice.onRollButtonClicked = () => {
   // audio.roll().play();
    veces = veces +1;
    //1 = ataque , 2 = nombre
    if (veces <= 2) {
        socket.emit('roll button');
    }
    //3 o mas = 
    else{
        socket.emit('roll button2');  
    }
    //socket.emit('save progress');
};
// Exit the game when a player click's the exit button
Dice.onExitGame = () => {

    if (window.confirm("Seguro Quieres Salir?")) { 
        socket.emit('exit game');

        // Disconnect the player
        socket.disconnect();

        // Close current tab and open a new tab
        window.open(socket.io.uri, "_self");
    }
};

socket.on('terminar connection', function(){
    window.alert("Otro jugador no esta en la misma partida.");
    window.open(socket.io.uri, "_self");
});


socket.on('connect', function(){
    console.log('Conected to server en JUEGO');
});

socket.on('disconnect', function(){
    console.log('SALIO DE server en JUEGO');
});

/* Display "awaiting connection message when a second player is yet to join the game"  */
socket.on('await player', (data) => {
    let $_ = Dice;
    $_.awaitingConnection(data); 
    $_.modalContainer.style.display = 'block';
    $_.modalOverlay.style.display = 'block';
});

// Submit the username form
Dice.userForm.addEventListener('submit', (e) => {
    
    e.preventDefault();

    // Inform client about the new player
    socket.playername = Dice.playername.value;
    socket.partida = Dice.partida.value;

    // Inform server about the new player
    console.log(`new player jugador: ${Dice.playername.value} partida: ${Dice.partida.value}`);
    socket.emit('new player', Dice.playername.value,Dice.partida.value);
    
    // Set input field to empty after form submission
    playername.value = '';
    partida.value = '';

    return false;
});

/* Control buttons event Listeners */
Dice.btn_roll.addEventListener('click', Dice.onRollButtonClicked);
//Dice.btn_save.addEventListener('click', Dice.onButtonHold);
//Dice.btn_new.addEventListener('click', Dice.onNewGame);
Dice.btn_exit.addEventListener('click', Dice.onExitGame);


// Iniitalize game components
Dice.init();

// Initilaize game components
socket.on('game initialized', (game) => Dice.initializeGameComponents( game ));

/* Broadcast player's round score */
socket.on('sync score', (data, dice) => {
    // Set active player's round score
    if (data.activePlayer == 0) {
        document.querySelector('#score-1').textContent = data.roundScore;    
    }else{
        document.querySelector('#score-0').textContent = data.roundScore;    
    }
    

     // Hide the "player's turn" message
    Dice.notify.classList.remove('show', 'info');
});

// New player event
socket.on('players ready', (game) => {
    veces = 0;
    Dice.initializeGameComponents( game );
    let gameSound = audio.gameSound();
    gameSound.loop = true;
    gameSound.play();
});

// Toggle active player panels and set scores
socket.on('next player sync', (data) => {
    let $_ = Dice;

    $_.activePlayer = data.activePlayer;
    $_.game.activePlayer = data.activePlayer;
        
    $_.roundScore = data.roundScore;

    //$_.current_0.textContent = 0;
    //$_.current_1.textContent = 0;

    $_.player_0_panel.classList.toggle('active');
    $_.player_1_panel.classList.toggle('active');
});

// Call the next player method
socket.on('next player turn', () => Dice.nextPlayer());

socket.on('sync player state', (data, dice, players) => {

    // Display the notification box
    Dice.notify.classList.add('show', 'info');

    // Build player's turn grammer and display
    let playsNext = data.activePlayer === 0 ? 1 : 0,
        actualPlayer = data.activePlayer === 0 ? 0 : 1;
    
    Dice.notify.textContent = `${ucFirst(players[actualPlayer])} ya ataco. Ahora es turno de ${ucFirst(players[playsNext])}`;
});

socket.on('sync winner', (data, players) => {
    let $_ = Dice;
    //perdio uno
    if (data.scores[0] <= 0 ) {
        document.querySelector('.player-0-panel').classList.add('winner');
        document.querySelector('.player-0-panel').classList.remove('active');
        document.querySelector('#name-0').textContent =  players[0] + ' PERDISTE!';
        document.querySelector('#name-1').textContent =  players[1] + ' GANASTE!';
    //perdio dos
    } else {
        document.querySelector('.player-1-panel').classList.add('winner');
        document.querySelector('.player-1-panel').classList.remove('active');
        document.querySelector('#name-0').textContent =  players[0] + ' GANASTE!';
        document.querySelector('#name-1').textContent =  players[1] + ' PERDISTE!';
    }
    
    
    $_.dice_1.style.display = 'none';
    //$_.dice_2.style.display = 'none';

    //audio.gameSound(true).pause();
    //audio.winner().play();

    // Game cannot be played anylonger
    $_.isGameActive = false;

    // Disable roll and save buttons
    enableSaveRollBtn(Dice, false);

    // Reinitialize game components when a player exits the game then restart and send state to server
    socket.emit('reinitialize game', Dice.activePlayer);
});


// Show players event
socket.on('show players', (data) => {
    Dice.name_0.textContent = "ID: "+data.players[0];
    Dice.name_1.textContent = "ID: "+data.players[1];
});

// Show ATAQUE event
socket.on('show ataque', (data) => {
    if (data.ataques.length == 1) {
        Dice.ataque_0.textContent = data.ataques[0];    
    }else if (data.ataques.length == 2) {
        Dice.ataque_0.textContent = data.ataques[0];    
        Dice.ataque_1.textContent = data.ataques[1];    
    }
});

// Show NOMBRES event
socket.on('show nombre', (data) => {
    if (data.nombres.length == 1) {
        Dice.especial_0.textContent = data.nombres[0];    
    }else if (data.nombres.length == 2) {
        Dice.especial_0.textContent = data.nombres[0];    
        Dice.especial_1.textContent = data.nombres[1];    
    }
});
// Disable 'roll dice' and 'save score' buttons on next player's turn
socket.on('disable buttons', () => {
    if (Dice.btn_roll.disabled === false && Dice.btn_save.disabled === false ) {
        enableSaveRollBtn(Dice, false);
    }
});

// Display computed dice sides
socket.on('sync components', (data, dice) => {
    let $_ = Dice;

    $_.dice_1.style.display = data.visible;
    //$_.dice_2.style.display = data.visible;
    console.log("Vuelta A: "+dice.dice1_val);
    let dice1_class = 'show-'+dice.dice1_val;
    //let dice2_class = 'show-'+dice.dice2_val;

    $_.previousClass.push('show-'+dice.dice1_val);
    //$_.previousClass.push('show-'+dice.dice2_val);

    $_.changeSide(dice1_class);
});

const ucFirst = (word) => {
    if (typeof word !== 'string') return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
};

// Enable disable 'save' and 'roll dice' buttons
const enableSaveRollBtn = ( obj, val ) => {
    if ( val ) {
        obj.btn_roll.removeAttribute('disabled');
        obj.btn_save.removeAttribute('disabled');
    } else {
        obj.btn_roll.setAttribute('disabled', true);
        obj.btn_save.setAttribute('disabled', true);
    }
};

// Display "awaiting connection message when a second player is yet to join the game"
socket.on('await connection', (data) => Dice.awaitingConnection(data));


// Max players event
socket.on('max connection', (data) => {
    Dice.notify.classList.add('show', 'info');
    Dice.notify.textContent = data.message;
});

// Close modal event
socket.on('close modal', () => {
    let $_ = Dice;
    $_.disableFormElems(false);
    $_.newElem.textContent = '';
    $_.modalContainer.style.display = 'none';
    $_.modalOverlay.style.display = 'none';
});