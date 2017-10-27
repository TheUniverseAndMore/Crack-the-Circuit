CrackTheCircuit.Preloader = function(game) {
    this.preloadBG = null;
    this.preloadCircuit = null;
    this.text = null;
    this.isReady = false;
};

CrackTheCircuit.Preloader.prototype = {
    
    preload: function()  {

        //	You can listen for each of these events from Phaser.Loader
        this.game.load.onLoadStart.add(this.loadStart, this);
        this.game.load.onFileComplete.add(this.fileComplete, this);
        this.game.load.onLoadComplete.add(this.loadComplete, this);

        this.stage.backgroundColor = "#142432";
        this.preloadBG = this.add.sprite(this.world.centerX,this.world.centerY,'blueprint');
        this.preloadBG.anchor.setTo(0.5);
        this.preloadBG.scale.setTo(1.1);
        this.preloadCircuit = this.add.sprite(this.world.centerX-0.5*this.game.cache.getImage('preloadCircuitOff').width, this.world.centerY, 'preloadCircuitOff');
        this.preloadCircuit.anchor.setTo(0,0.5);
        this.load.setPreloadSprite(this.preloadCircuit);
        this.preloadCircuit.cropEnabled = true;
        
        //audio - start loading first to prevent lag after loader bar is full
        this.load.audio('bgMusic', 'assets/audio/Music/bgMusic.mp3');
        
        this.load.audio('neonHum', 'assets/audio/SoundEffects/neonHum.m4a');
        this.load.audio('boxSwitchClose', 'assets/audio/SoundEffects/boxSwitchClose.mp3');
        this.load.audio('boxSwitchOpen', 'assets/audio/SoundEffects/boxSwitchOpen.mp3');
        
        //load later, when loading level assets
        this.load.audio('bulbOn', 'assets/audio/SoundEffects/bulbOn.mp3');
        this.load.audio('switchClose', 'assets/audio/SoundEffects/switchClose.mp3');
        this.load.audio('paperUnroll', 'assets/audio/SoundEffects/paperUnroll.mp3');
        this.load.audio('paperRoll', 'assets/audio/SoundEffects/paperRoll.mp3');
        this.load.audio('boxMoveUp', 'assets/audio/SoundEffects/boxMoveUp.mp3');
        this.load.audio('boxMoveDown', 'assets/audio/SoundEffects/boxMoveDown.mp3');
        
        //level data
        this.load.text('gameData', 'assets/data/data.json');
        
        //sprite sheet
        this.load.atlasJSONHash('spriteSheetMenu', 'assets/images/spritesheets/spriteSheetMenu.png', 'assets/images/spritesheets/spriteSheetMenu.json');
        this.load.atlasJSONHash('spriteSheetMenu2', 'assets/images/spritesheets/spriteSheetMenu2.png', 'assets/images/spritesheets/spriteSheetMenu2.json');
        
        //images
        this.game.load.image('background', 'assets/images/background.png');
        this.game.load.image('table_front', 'assets/images/table_front.png');
        
        //fonts
        this.load.bitmapFont('menuFont', 'assets/fonts/menuFont.png', 'assets/fonts/menuFont.xml');
        this.load.bitmapFont('menuFontHighlighted', 'assets/fonts/menuFontHighlighted.png', 'assets/fonts/menuFontHighlighted.xml');
        this.load.bitmapFont('levelSelectFont', 'assets/fonts/levelSelectFont.png', 'assets/fonts/levelSelectFont.xml');
        
        this.text = this.game.add.text(this.game.world.centerX, 0.87*this.game.world.height, '', { font: "Quicksand", fontSize: 60, fill: "#ffffff", align: "center" } );
        this.text.anchor.setTo(0.5);
    },
    
    loadStart: function() {

        this.text.setText("0%");
    },

    //	This callback is sent the following parameters:
    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {

        this.text.setText(progress + "%");// - " + totalLoaded + " out of " + totalFiles);
        this.text.anchor.setTo(0.5);
    },

    loadComplete: function() {

        this.text.setText("100%");
        this.isReady = true;
        
        this.game.load.onLoadComplete.remove(this.loadComplete, this);
    },
    
    update: function() {        
        if(this.cache.isSoundDecoded('bulbOn') && this.isReady == true) {
			this.isReady = false;
            this.preloadCircuit.loadTexture('spriteSheetMenu2','preloadCircuitOn');
            this.time.events.add(Phaser.Timer.SECOND * 0.5, this.startFadeOut, this);
            this.game.add.audio('bulbOn').play(); //gets annoying during testing
        }
    },
    
    startFadeOut: function() {
        
        var fadeShade = this.game.add.graphics(0,0).beginFill(CrackTheCircuit.BG_COLOR).drawRect(0,0,this.game.width,this.game.height);
        fadeShade.alpha = 0;
        var fadeTween = this.add.tween(fadeShade);
        fadeTween.to( { alpha: 1 }, 500, "Linear", true);
        fadeTween.onComplete.add(this.startGame, this);
    },
    
    startGame: function() {
        this.game.state.add('GameState', CrackTheCircuit.GameState);
        this.state.start('GameState');
    }
}