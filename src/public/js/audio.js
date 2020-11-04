let audio = {
    files:{
        gameSound: '../audio/cancion.mp3'
    },
    trigger: ( file ) => {
        let self = new Audio(file);
        self.volume = 0.3;
        return self;
    },
    gameSound: ( mute ) => {
        let obj = audio.trigger(audio.files.gameSound);
        if (mute) {
            obj.muted = true;
        } else {
            obj.muted = false;
        }
        return obj;
    }
};