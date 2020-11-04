
// Game Object
let Game = {};

// Initialize game components
Game.init = ( config = "") => {
    let self = Game;
    
    self.scores             = config.scores || [100, 100];
    self.activePlayer       = config.activePlayer || 0;
    self.veces              = config.veces || 2;
    self.roundScore         = config.roundScore || 100;
    self.isGameActive       = config.isGameActive || true;
    self.defaultWinScore    = config.defaultWinScore || 0;
    self.hidden             = config.hidden || 'none';
    self.visible            = config.visible || 'block';
    self.defaultScore       = config.defaultScore || 100;
    self.playerNames        = config.playerNames || {player_1: '-', player_2: '-'};
    self.removePanelClass   = config.removePanelClass || {winner: 'winner', active: 'active'};
    self.addPanelClass      = config.addPanelClass || {winner: 'winner', active: 'active'};
    self.animate            = config.animate || 'animate';
    self.emptyVal           = config.emptyVal || "";

    return self;
};

// Capitalize initial character of a given word
Game.ucFirst = (word) => {
    if (typeof word !== 'string') return ''
    return word.charAt(0).toUpperCase() + word.slice(1)
};

// Export game object
module.exports = Game;