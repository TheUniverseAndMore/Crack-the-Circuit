CrackTheCircuit.GameState = function(game) {
    
    //transition
    this.fadeShade = null;
    
    //tutorial
    this.tutManager = null;
    this.tutShade = null;
    this.numTutsComplete = 0;
    
    //scenery
    this.bg = null;
    this.tableFront = null;
    this.tableBack = null;

    //table items
    this.pencil = null;
    this.protractor = null;
    this.screwdriver = null;
    this.nut1 = null;
    this.nut2 = null;
    this.screw = null;
    this.wire = null;
    
    //level data
    this.gameData;
    this.curLevelNum = 0;
    this.curLevelData; //data object for the current level
    this.totalLevels = -1;
    
    this.levelToLoad;
    
    //game state
    this.gameState;
    
    //main menu
    this.menu;
    this.byTUAM; //by the universe and more
    
    //game elements
    this.circuitBox = null;
    this.blueprint = null;
    this.componentCards = null;
    
    this.circuitChecker = null;
    
    //circuit box motion
    this.boxY_Up;
    this.boxY_Down;
    
    //Booleans
    this.isTouchScreen;
    this.musicOn = true;
    this.soundOn = true;
    this.showElectrons = false;
    
    //Win Screen
    this.winShade = null;
    this.winKey = null;
    this.winGlow = null;
    this.winRaysCW = null;
    this.winRaysCCW = null;
    this.winRaysShowing = false; //to update rotation in update()
    
    //Tutorial
    this.tutorialShowing = false;
    
    //Free Draw
    this.freeDrawSize = 1;
    
    //Local storage
    this.numLevelsBeaten = 0;
    
    //Loading
    this.hasLoadedGameAssets = false;
    this.stateToStartAfterLoad = null;
    this.loadingIcon;
    this.loadingText = null;
    
    //Audio
    this.bgMusic = null;
    this.boxMoveUpSound = null;
    this.boxMoveDownSound = null;
    this.levelWinSound = null;
    this.winScoreSound = null; //when key adds to score
    this.paperSlideSound = null;
};

CrackTheCircuit.GameState.prototype = {
    
    preload: function() {
    },
    
    create: function() {
//        this.game.input.onDown.add(function() {
//            this.game.input.touch.preventDefault = false; // so that the touch can be used to scroll the window if it is not "captured" by any touchable element
//        });
        this.game.input.onUp.add(function() {
            this.game.input.touch.preventDefault = false; // so that the touch can be used to scroll the window if it is not "captured" by any touchable element
        });
        
        this.setupInput();
        this.loadAudioForMenu();
        this.startMusic();
        this.gameState = CrackTheCircuit.STATE_MAIN_MENU;
        this.loadSavedData();
        this.loadLevelData();
        this.createBackground();
        this.createTableBack();
        this.createCircuitBox();
        this.createTableFront();
        this.createTableItems();
        this.positionTableItemsForMainMenu();
        this.createMenu();
        this.fadeIn();
    },
    
    createGameElements: function() {
        this.createCircuitChecker();
        this.createCards();
        this.createWinShade();
        this.createWinRays();
        this.createWinGlow();
        this.createBlueprint();
        this.createTutManager();
    },
    
    update: function() {    
        if(this.winRaysShowing) { this.updateWinRayRotationScale(); }
    },
    
    ///////// USER INPUT /////////
    
    setupInput: function() {
        this.isTouchScreen = this.game.device.touch;
        this.mouseDownOnButtonIndex = -1;
    },
    
    mouseMoved: function(pointer, x, y, downState) {
        //console.log("MOVED");
    },
    
    ////////USER INPUT END ///////
    
    //////// LEVEL DATA AND LOCAL STORAGE ///////
    
    loadSavedData: function() {
        
        if(localStorage.getItem('numLevelsBeaten') == null) { 
            this.numLevelsBeaten = 0;
            localStorage.setItem('numLevelsBeaten', 0);
        }
        else { 
            this.numLevelsBeaten = parseInt(localStorage.getItem('numLevelsBeaten'));
        }
        
        if(localStorage.getItem('numTutsComplete') == null) { 
            this.numTutsComplete = 0;
            localStorage.setItem('numTutsComplete', 0);
        }
        else { 
            this.numTutsComplete = parseInt(localStorage.getItem('numTutsComplete')); 
        }
    },
    
    loadLevelData: function() {
        this.curLevelNum = this.numLevelsBeaten+1;
        this.gameData = JSON.parse(this.game.cache.getText('gameData'));
        this.totalLevels = this.gameData.levels.length;
        
        if(this.numLevelsBeaten >= this.totalLevels) { this.curLevelNum = 1; }
    },
    
    saveGameData: function() {
        localStorage.setItem('numLevelsBeaten', this.numLevelsBeaten);
        localStorage.setItem('numTutsComplete', this.numTutsComplete);
    },
    
    fadeIn: function() {
        this.fadeShade = this.game.add.graphics(0,0).beginFill(CrackTheCircuit.BG_COLOR).drawRect(0,0,this.game.width,this.game.height);
        var fadeTween = this.game.add.tween(this.fadeShade);
        fadeTween.to( { alpha: 0 }, 600, "Linear", true, 500); //0.5 second delay
        fadeTween.onComplete.add(this.raiseTitleBox, this);
    },
    
    createBackground: function() {
        this.bg = new Background(this.game);
        this.bg.create();
    },
    
    createCircuitBox: function() {
        this.circuitBox = new CircuitBox(this.game, this);
        this.circuitBox.create();
        this.circuitBox.addElementsForMenu();
        
        this.boxY_Up = 0.44*this.game.world.height;
        this.boxY_Down = 0.9*this.game.world.height;
        
        this.circuitBox.position = {x:this.game.world.centerX,y:this.boxY_Down};
    },
    
    createTableBack: function() {
        this.tableBack = this.game.add.sprite(this.game.world.centerX,this.game.world.height,'spriteSheetMenu','table_back');
        this.tableBack.anchor.setTo(0.5,1);
    },
    
    createTableFront: function() {
        this.tableFront = this.game.add.sprite(this.game.world.centerX,this.game.world.height,'table_front');
        this.tableFront.anchor.setTo(0.5,0.63);
        this.tableFront.scale.setTo(0.835);
    },
    
    ///////// TABLE ITEMS ///////
    
    createTableItems: function() {
        
        this.pencil = this.game.add.sprite(0,0,'spriteSheetMenu','item_pencil');
        this.pencil.anchor.setTo(0.5);
        this.pencil.scale.setTo(0.5);
        this.protractor = this.game.add.sprite(0,0,'spriteSheetMenu2','item_protractor');
        this.protractor.anchor.setTo(0.5);
        this.protractor.scale.setTo(0.65);
    },
    
    jiggleItem: function(object) {
        
    },
    
    positionTableItemsForMainMenu: function() {  
        this.pencil.visible = true;
        this.protractor.visible = true;
        
        this.pencil.position = {x:0.77*this.game.world.width,y:0.58*this.game.world.height};
        this.pencil.angle = -64;
        this.protractor.position = {x:0.21*this.game.world.width,y:0.66*this.game.world.height};
        this.protractor.angle = -60;
        
        //for jiggle effect
        this.protractor.origAngle = this.protractor.angle;
        this.pencil.origAngle = this.pencil.angle;
    },
    
    moveTableItemsToStateFromStateAfterDelay: function(gameStateTo,gameStateFrom,delay) {     
        
        if(gameStateTo == CrackTheCircuit.STATE_MAIN_MENU) {
            if(gameStateFrom == CrackTheCircuit.STATE_FREE_DRAW) {      
                this.game.add.tween(this.protractor.scale).to({x:0.65,y:0.65},1000,"Sine.easeInOut",true,delay); this.game.add.tween(this.protractor).to({x:0.21*this.game.world.width,y:0.66*this.game.world.height},1000,"Sine.easeInOut",true,delay);
               
               this.pencil.visible = true;
                this.pencil.scale.setTo(0.5);
                var pencilLag = 485; //ms
                this.game.add.tween(this.pencil).to({x:0.77*this.game.world.width,y:0.58*this.game.world.height},710,"Sine.easeInOut",true,delay+pencilLag);
                this.game.add.tween(this.pencil).to({angle:-64},710,"Sine.easeInOut",true,delay+pencilLag);
            } else { //if(gameStateFrom == CrackTheCircuit.STATE_GAME)
                this.game.add.tween(this.protractor).to({x:0.21*this.game.world.width,y:0.66*this.game.world.height},800,"Sine.easeInOut",true,delay);
                this.game.add.tween(this.protractor).to({angle:-60},800,"Sine.easeInOut",true,delay);
                
                this.pencil.visible = true;
                this.pencil.scale.setTo(0.5);
                var pencilLag = 150; //ms
                this.game.add.tween(this.pencil).to({x:0.77*this.game.world.width,y:0.58*this.game.world.height},710,"Sine.easeInOut",true,delay+pencilLag);
                this.game.add.tween(this.pencil).to({angle:-64},710,"Sine.easeInOut",true,delay+pencilLag);
            }
            
        } else if(gameStateTo == CrackTheCircuit.STATE_GAME) {
            this.game.add.tween(this.protractor).to({x:0.18*this.game.world.width,y:0.81*this.game.world.height},700,"Sine.easeInOut",true,delay);
            this.game.add.tween(this.protractor).to({angle:-80},700,"Sine.easeInOut",true,delay);
            
            var pencilHeadStart = 300; //ms
            var pencilMove = this.game.add.tween(this.pencil).to({x:0.85*this.game.world.width,y:1.3*this.game.world.height},800,"Sine.easeInOut",true,delay-pencilHeadStart);
            pencilMove.onComplete.add(this.hidePencil,this);
            this.game.add.tween(this.pencil).to({angle:6},800,"Sine.easeInOut",true,delay-pencilHeadStart);
            //this.game.add.tween(this.pencil.scale).to({x:0.7,y:0.7},800,"Sine.easeInOut",true,delay-pencilHeadStart);
            
        } else if(gameStateTo == CrackTheCircuit.STATE_FREE_DRAW) {
            this.game.add.tween(this.protractor.scale).to({x:0.77844,y:0.77844},1000,"Sine.easeInOut",true,delay); this.game.add.tween(this.protractor).to({x:0.16*this.game.world.width,y:0.28*this.game.world.height},1000,"Sine.easeInOut",true,delay);
            
            var pencilHeadStart = 300; //ms
            var pencilMove = this.game.add.tween(this.pencil).to({x:0.85*this.game.world.width,y:1.3*this.game.world.height},800,"Sine.easeInOut",true,delay-pencilHeadStart);
            pencilMove.onComplete.add(this.hidePencil,this);
            this.game.add.tween(this.pencil).to({angle:6},800,"Sine.easeInOut",true,delay-pencilHeadStart);
            this.game.add.tween(this.pencil.scale).to({x:0.7,y:0.7},800,"Sine.easeInOut",true,delay-pencilHeadStart);
        }
    },
    
    hidePencil: function() {
        this.pencil.visible = false;
    },
    
    //////// MAIN MENU //////////
    
    createMenu: function() {
        this.menu = new Menu(this.game, this);
        this.menu.create(this.musicOn, this.soundOn, this.showElectrons);
    },
        
    backBtnPressed: function() {
        
        if(this.gameState == CrackTheCircuit.STATE_GAME) {
            //remove the game elements
            this.lowerCircuitBoxForBackToTitle(); //show menu is called from here
            this.hideBlueprint();
            this.hideCardsAfterDelay(0);
            this.menu.fadeOutHintBtn();
            this.menu.fadeOutTrashButton();
            this.menu.fadeOutSizeButton();
            
            this.moveTableItemsToStateFromStateAfterDelay(CrackTheCircuit.STATE_MAIN_MENU,CrackTheCircuit.STATE_GAME,450);
        }
        
        else if(this.gameState == CrackTheCircuit.STATE_WIN) {
            //remove the game elements
            this.hideBlueprint();
            //this.circuitBox.closeBox();
            this.lowerCircuitBoxForBackToTitle(); //show menu is called from here
            this.fadeOutWinShade();
            this.fadeOutWinGlow();
            this.fadeOutWinRays();
            this.fadeOutWinKey();
            this.circuitBox.fadeOutWinShade();
            this.menu.hideWinButtons();
            
            this.moveTableItemsToStateFromStateAfterDelay(CrackTheCircuit.STATE_MAIN_MENU,CrackTheCircuit.STATE_GAME,450);
        }
        
        else if(this.gameState == CrackTheCircuit.STATE_FREE_DRAW) {
            //remove the game elements
            this.menu.fadeOutTrashButton();
            this.hideBlueprintAfterFreeDraw();
        }
        
        this.gameState = CrackTheCircuit.STATE_MAIN_MENU;
    },
    
    playBtnPressed: function() {
        this.gameState = CrackTheCircuit.STATE_GAME;
        this.circuitBox.disableTouch();
        
        this.levelToLoad = this.numLevelsBeaten+1;
        if(this.levelToLoad > this.totalLevels) { this.levelToLoad = this.curLevelNum; }
        if(this.levelToLoad > this.totalLevels) { this.levelToLoad = 1; }
        this.lowerTitleBox();
        
        if(this.hasLoadedGameAssets) {
            this.loadGameDataForLevel(this.levelToLoad);
        }
        
        this.moveTableItemsToStateFromStateAfterDelay(CrackTheCircuit.STATE_GAME,CrackTheCircuit.STATE_MAIN_MENU,450);
    },
    
    levelBoxPressed: function(levelNum) {
        this.gameState = CrackTheCircuit.STATE_GAME;
        this.circuitBox.disableTouch();
        this.levelToLoad = levelNum;
        this.lowerTitleBox();
        
        if(this.hasLoadedGameAssets) {
            this.loadGameDataForLevel(this.levelToLoad);
        }
        
        this.moveTableItemsToStateFromStateAfterDelay(CrackTheCircuit.STATE_GAME,CrackTheCircuit.STATE_MAIN_MENU,450);
    },
    
    trashBtnPressed: function() {
        this.blueprint.trashBtnPressed();
        this.componentCards.resetCardsAfterTrash();
        this.componentCards.enableInput();
    },
    
    //////// BUTTONS END ///////////
    
    loadGameDataForLevel: function(levelNum) {
        this.curLevelNum = levelNum;
        this.curLevelData = this.gameData.levels[this.curLevelNum-1];
        this.circuitChecker.updateWithGameData(this.gameData.levels[this.curLevelNum-1]);
    },
    
    raiseTitleBox: function() {
        this.fadeShade.destroy(); //called after shade has finished fading out
        
        var moveUpTween = this.game.add.tween(this.circuitBox).to({y:this.boxY_Up}, CrackTheCircuit.TITLE_BOX_RAISE_TIME, Phaser.Easing.Quadratic.Out, true);
        
        //this.game.time.events.add(CrackTheCircuit.BOX_MOVE_TIME - 0.15, this.circuitBox.toggleTitleSwitch, this.circuitBox); //minus switch close time, so that the lights turn on when the box is finished moving
        
        moveUpTween.onComplete.add(this.titleBoxFinishedMoving, this);
        
        this.boxMoveUpSound.play();
    },
    
    raiseTitleBoxAgainAfterDelay: function(delay) { //when back to menu, after initial loading
        this.fadeShade.destroy(); //called after shade has finished fading out
        
        var moveUpTween = this.game.add.tween(this.circuitBox).to({y:this.boxY_Up}, CrackTheCircuit.TITLE_BOX_RAISE_TIME, Phaser.Easing.Quadratic.Out, true,delay);
        
        //this.game.time.events.add(CrackTheCircuit.BOX_MOVE_TIME - 0.15, this.circuitBox.toggleTitleSwitch, this.circuitBox); //minus switch close time, so that the lights turn on when the box is finished moving
        
        moveUpTween.onComplete.add(this.menu.fadeInMenuButtons, this.menu);
        
        this.boxMoveUpSound.play();
    },
    
    
    lowerTitleBox: function() {
        //if(this.circuitBox.open) { this.circuitBox.closeBox(); }
        var boxDownTween = this.game.add.tween(this.circuitBox).to({y:this.boxY_Down}, CrackTheCircuit.TITLE_BOX_LOWER_TIME, "Linear", true);
        
        if(this.hasLoadedGameAssets) {
            boxDownTween.onComplete.add(this.loadBoxForNextLevel, this);
        } else { //if game assets have not been loaded yet
            this.stateToStartAfterLoad = CrackTheCircuit.STATE_GAME;
            boxDownTween.onComplete.add(this.startLoadingGameAssets, this);
        }
        
        this.circuitBox.fadeOutNeonSound();
        if(this.byTUAM) {
            this.byTUAM.destroy();
            this.byTUAM = null;
        }
        
        this.boxMoveDownSound.play();
    },
    
    startLoadingGameAssets: function() {
        
        this.loadingIcon = this.game.add.sprite(this.game.world.centerX, 0.368*this.game.world.height, 'spriteSheetMenu');
        this.loadingIcon.anchor.setTo(0.5);
        this.loadingIcon.scale.setTo(0.9);
        this.loadingIcon.animations.add('rotate', Phaser.Animation.generateFrameNames('loadIcon', 1, 8,''), 12, true);
        this.loadingIcon.animations.play('rotate');
        this.loadingIcon.alpha = 0;
        
        this.loadingText = this.game.add.text(this.game.world.centerX, 0.24*this.game.world.height, 'Loading...', { font: "Quicksand", fontSize: 72, fill: "#ffffff", align: "center" } );
        
        this.loadingText.anchor.setTo(0.42);
        this.loadingText.alpha = 0;
        
        this.game.add.tween(this.loadingText).to({alpha:1},300,"Linear",true);
        var iconFade = this.game.add.tween(this.loadingIcon).to({alpha:1},300,"Linear",true);
        
        //audio
        this.game.load.audio('bulbOnTop', 'assets/audio/SoundEffects/bulbOnTop.mp3');
        this.game.load.audio('bulbBuzzTop', 'assets/audio/SoundEffects/bulbBuzzTop.m4a');
        this.game.load.audio('switchOpen', 'assets/audio/SoundEffects/switchOpen.mp3');
        this.game.load.audio('startDraw', 'assets/audio/SoundEffects/startDraw.mp3');
        this.game.load.audio('drawBlip', 'assets/audio/SoundEffects/drawBlip.mp3');
        this.game.load.audio('cardPop', 'assets/audio/SoundEffects/cardPop.mp3');
        this.game.load.audio('componentBlip', 'assets/audio/SoundEffects/componentBlip.mp3');
        this.game.load.audio('componentClick', 'assets/audio/SoundEffects/componentClick.mp3');
        this.game.load.audio('componentUnclick', 'assets/audio/SoundEffects/componentUnclick.mp3');
        this.game.load.audio('levelWin', 'assets/audio/SoundEffects/levelWin.mp3');
        this.game.load.audio('shortCircuit', 'assets/audio/SoundEffects/shortCircuit.mp3');
        this.game.load.audio('boxOpen', 'assets/audio/SoundEffects/boxOpen.mp3');
        this.game.load.audio('boxClose', 'assets/audio/SoundEffects/boxClose.mp3');
        this.game.load.audio('schematicAppear', 'assets/audio/SoundEffects/schematicAppear.mp3');
        this.game.load.audio('winScore', 'assets/audio/SoundEffects/winScore.mp3');
        this.game.load.audio('paperSlide', 'assets/audio/SoundEffects/paperSlide.mp3');
        this.game.load.audio('cardThrow', 'assets/audio/SoundEffects/cardThrow.mp3');
        
        //scripts
        this.game.load.script('Blueprint.js', 'Blueprint.js'); //load the blueprint interface
        this.game.load.script('TutorialManager.js','TutorialManager.js'); //load the tutorial manager
        this.game.load.script('ComponentCards.js', 'ComponentCards.js'); //load the component cards
        this.game.load.script('CircuitSolver.js', 'CircuitSolver.js'); //load the circuit solver
        this.game.load.script('CircuitChecker.js', 'CircuitChecker.js'); //load the circuit checker
        
        //sprite sheet
        this.game.load.atlasJSONHash('spriteSheetGame', 'assets/images/spritesheets/spriteSheetGame.png', 'assets/images/spritesheets/spriteSheetGame.json');
        
        //images
        this.game.load.image('drawNode', 'assets/images/drawNode.png');
        this.game.load.image('winGrid', 'assets/images/winGrid.png');
        this.game.load.image('winGlow', 'assets/images/winGlow.png');
        this.game.load.image('blueprintFreeDraw', 'assets/images/blueprintFreeDraw.png');
        this.game.load.image('table_shade', 'assets/images/table_shade.png');
        
        //You can listen for each of these events from Phaser.Loader
        this.game.load.onLoadComplete.add(this.gameAssetsLoaded, this);
        this.game.load.start();
    },
    
    gameAssetsLoaded: function() {
        
        this.game.add.tween(this.loadingText).to({alpha:0},200,"Linear",true);
        var iconFade = this.game.add.tween(this.loadingIcon).to({alpha:0},200,"Linear",true);
        iconFade.onComplete.add(this.destroyLoadingAssets, this);
        
        this.createGameElements();
        this.circuitBox.createGameAssets();
        this.loadAudioForGame();
        this.hasLoadedGameAssets = true;
        this.game.load.onLoadComplete.remove(this.gameAssetsLoaded, this);
        
        if(this.stateToStartAfterLoad == CrackTheCircuit.STATE_GAME) {
            this.loadGameDataForLevel(this.levelToLoad);
            this.loadBoxForNextLevel();
        } else if(this.stateToStartAfterLoad == CrackTheCircuit.STATE_FREE_DRAW) {
            this.showBlueprintForFreeDraw();
        }
    },
    
    destroyLoadingAssets: function() {
        this.loadingIcon.destroy();
        this.loadingIcon = null;
        this.loadingText.destroy();
        this.loadingText = null;
    },
    
    loadBoxForNextLevel: function() {
        this.circuitBox.clearAllElements();
        this.circuitBox.setClosed();
        this.circuitBox.addElementsWithLevelData(this.curLevelData);
        this.raiseCircuitBoxForNextLevel();
    },
    
    raiseCircuitBoxForNextLevel: function() {
        var boxUpTween = this.game.add.tween(this.circuitBox).to({y:this.boxY_Up}, CrackTheCircuit.BOX_RAISE_TIME, Phaser.Easing.Quadratic.Out, true, 350);
        boxUpTween.onComplete.add(this.circuitBoxUp, this);
        this.game.time.events.add(350, this.circuitBox.fadeInBulbSound, this.circuitBox);
        
        this.boxMoveUpSound.play();
    },
    
    lowerCircuitBoxAfterDelay: function(delay) {        
        var boxDownTween = this.game.add.tween(this.circuitBox).to({y:this.boxY_Down}, CrackTheCircuit.BOX_LOWER_TIME, "Linear", true, delay);
        boxDownTween.onComplete.add(this.loadBoxForNextLevel, this);
        this.game.time.events.add(delay, this.circuitBox.fadeOutBulbSound, this.circuitBox);
        
        this.circuitBox.lowerAnyRaisedBulbs();
        
        this.boxMoveDownSound.play();
    },
    
    lowerCircuitBoxForBackToTitle: function() {        
        var boxDownTween = this.game.add.tween(this.circuitBox).to({y:this.boxY_Down}, CrackTheCircuit.BOX_LOWER_TIME, "Linear", true);
        boxDownTween.onComplete.add(this.circuitBox.addElementsForBackToMenu, this.circuitBox);
        boxDownTween.onComplete.add(this.raiseTitleBoxFromBackToMenu, this);
        this.game.time.events.add(Phaser.Timer.SECOND * 0.5, this.circuitBox.fadeOutBulbSound, this.circuitBox);
        
        this.circuitBox.lowerAnyRaisedBulbs();
        
        this.boxMoveDownSound.play();
    },
    
    raiseTitleBoxFromBackToMenu: function() {
        this.raiseTitleBoxAgainAfterDelay(400);
    },
    
    titleBoxFinishedMoving: function() {
        this.circuitBox.toggleTitleSwitch();
        //this.circuitBox.enableKeyholeTouch();
        
        //show menu buttons shortly after the title box is in place
        
        //by TUAM
        this.byTUAM = this.game.add.sprite(this.game.world.centerX,0.295*this.game.world.height,'spriteSheetMenu','byTUAM');
        this.byTUAM.anchor.setTo(0.5);
        this.byTUAM.scale.setTo(0.6);
        this.byTUAM.alpha = 0;
        var fadeIn = this.game.add.tween(this.byTUAM).to({alpha:1},500,"Linear",true,100);
        fadeIn.onComplete.add(this.menu.fadeInMenuButtons, this.menu);
    },
    
    shakeCameraWhenBoxUp: function() {
        //nothing here yet
    },
    
    circuitBoxUp: function() {
        if(this.curLevelNum == 1 && this.numTutsComplete < 1) {
            this.tutManager.showTutorialNum(1);
            this.tutorialShowing = true;
        } else if(this.curLevelNum == 2 && this.numTutsComplete < 2) {
            this.tutManager.showTutorialNum(2); 
            this.circuitBox.enableTouch();
            this.tutorialShowing = true;
        } else if(this.curLevelNum == 3 && this.numTutsComplete < 3) {
            this.tutManager.showTutorialNum(3); 
            this.circuitBox.enableTouch();
            this.tutorialShowing = true;
        } else {
            this.showBlueprint();
            this.circuitBox.enableTouch();
        }
    },
    
    //BLUEPRINT FUNCTIONS
    
    createBlueprint: function() {
        this.blueprint = new Blueprint(this.game,this);
        this.blueprint.create();
        this.blueprint.position = {x:this.game.world.centerX, y:1.4*this.game.world.height};
        this.blueprint.disableTouch();
        this.blueprint.visible = false;
    },
    
    showBlueprint: function() {
        this.blueprint.visible = true;
        this.blueprint.position.x = this.game.world.centerX;
        this.blueprint.constructForGame();
        var bpTween = this.game.add.tween(this.blueprint).to({y: 0.735*this.game.world.height}, 600,"Sine.easeOut",true);
        bpTween.onComplete.add(this.blueprint.enableTouch,this.blueprint);
        this.blueprint.scale.setTo(1.3,1.3);
        this.game.add.tween(this.blueprint.scale).to({x:1, y:1}, 500,Phaser.Easing.Back.In,true);
        
        this.componentCards.position = {x:0.81*this.game.world.width, y:0.73*this.game.world.height}; //in case it tweened away earlier
        this.componentCards.resetWithComponents(this.curLevelData.numBulbs, this.curLevelData.numSwitches);
        
        this.componentCards.startThrowingInCardsAfterDelay(600, true);
        
        this.paperSlideSound.play();
    },
    
    hideBlueprint: function() {
        this.blueprint.disableTouch();
        var bpTween = this.game.add.tween(this.blueprint).to({y: 1.4*this.game.world.height}, 600,"Sine.easeIn",true,150);
        this.game.add.tween(this.blueprint.scale).to({x:1.4, y:1.2}, 850,"Sine.easeIn",true);
        bpTween.onComplete.add(this.makeBlueprintInvisible,this);
    },
    
    refreshBlueprint: function() {
        this.blueprint.disableTouch();
        var bpTween = this.game.add.tween(this.blueprint).to({y: 1.4*this.game.world.height}, 600,"Sine.easeIn",true);
        this.game.add.tween(this.blueprint.scale).to({x:1.4, y:1.2}, 850,"Sine.easeIn",true);
        bpTween.onComplete.add(this.blueprint.clearBlueprint,this.blueprint);
        bpTween.onComplete.add(this.showBlueprint,this);
    },
    
    makeBlueprintInvisible: function() {
        this.blueprint.visible = false;
        this.blueprint.clearBlueprint();
    },
    
    startDraggingComponent: function(componentType, cardAngle) {
        this.blueprint.startDraggingComponent(componentType, cardAngle, -1, -1);
    },
    
    //COMPONENT CARDS
    
    createCards: function() {
        this.componentCards = new ComponentCards(this.game, this, 0.23*this.game.world.width, 0.45*this.game.world.height);
        this.componentCards.create();
        this.componentCards.position = {x:0.81*this.game.world.width, y:0.73*this.game.world.height};
        //this.circuitBlueprint.position = {x:0.5*this.gameWidth, y:0.5*this.gameHeight};
    },
    
    addCardOfType: function(type) {
        if(this.gameState == CrackTheCircuit.STATE_GAME || type == CrackTheCircuit.COMPONENT_BATTERY) { //not free draw
            this.componentCards.throwInNewCardOfType(type);
        }
    },
    
    cardsLoaded: function() {
        if(this.tutorialShowing) {
            this.tutManager.fadeInTextAfterDelay(0);
            this.componentCards.enableInput();
            this.blueprint.waitingForTutAdd = true;
        } else {
            if(this.gameState == CrackTheCircuit.STATE_FREE_DRAW) {
                this.menu.backToMenuBtn.scale.setTo(0.8);
            } else {

                this.menu.backToMenuBtn.scale.setTo(1);
                this.menu.fadeInHintBtn();
                this.menu.fadeInSizeButton();
            }

            this.menu.fadeInBackButton();
            this.menu.fadeInTrashButton();
        }
    },
    
    hideCardsAfterDelay: function(delay) {
        this.componentCards.disableInput();
        var cardTween = this.game.add.tween(this.componentCards).to({x: this.componentCards.position.x + 100, y: 1.5*this.game.world.height}, 500,"Sine.easeIn",true, delay);
        cardTween.onComplete.add(this.componentCards.destroyAllCards,this.componentCards);
    },
    
    
    startGame: function() {
        this.gameState = CrackTheCircuit.STATE_GAME;
        
        //this.state.start('Game', true, false, 1);
    },
    
    ///////// CIRCUIT CHECKING ////////////
    
    createCircuitChecker: function() {
        this.circuitChecker = new CircuitChecker(this.game);
    },
    
    circuitSolvedInBlueprint: function() {        
        if(this.gameState == CrackTheCircuit.STATE_GAME && !this.tutorialShowing && this.componentCards.allCardsUsedUp() && !this.blueprint.isDraggingComponent) { //second arg to prevent circuit from checking when switch is unsnapped and dragging (crash)
            
            if(this.blueprint.allSwitchesClosed()) { 
                if(this.circuitChecker.isCorrect(this.blueprint.allSolvedCircuits(this.curLevelData.numBulbs, this.curLevelData.numSwitches))) {
                    this.initLevelWin();
                }
            }
        }
    },
    
    // WIN SCREEN
    
    createWinShade: function() {
        this.winShade = this.game.add.sprite(this.game.world.centerX,this.game.world.height,'table_shade');
        this.winShade.anchor.setTo(0.5,1);
        this.winShade.alpha = 0;
        this.winShade.visible = false;
    },
     
    initLevelWin: function() {
        this.gameState = CrackTheCircuit.STATE_WIN;
        //this.circuitBox.disableTouch();
        
        
        this.blueprint.disableTouch();
        this.blueprint.setWinMode();
        this.menu.fadeOutBackButton();
        this.menu.fadeOutTrashButton();
        this.menu.fadeOutSizeButton();
        this.menu.fadeOutHintBtn();
        this.circuitBox.unlockBox();
        
        var delay = 500;
        this.fadeInWinShadeAfterDelay(delay);
        this.circuitBox.fadeInWinShadeAfterDelay(delay);
        
        this.fadeInWinGlowAfterDelay(0);
        this.fadeInWinRaysAfterDelay(200);
        
        var gridDelay = 700;
        this.circuitBox.fadeInWinGridAfterDelay(gridDelay);
        
        if(this.numLevelsBeaten < this.curLevelNum) { //level not yet beaten
            this.numLevelsBeaten++;
            this.saveGameData();
            
            this.createWinKey();
            this.fadeInWinKey();
            this.menu.fadeInCompletionText(false, false,1000); //do not show duplicate win key
        } else { this.menu.fadeInCompletionText(true, false,1400); }
        
        this.levelWinSound.play();
        
        this.game.world.bringToTop(this.menu);
        this.game.world.bringToTop(this.blueprint);
        if(this.winKey) { this.game.world.bringToTop(this.winKey); }
        
        this.game.canvas.style.cursor = "default";
    },
    
    // WIN GLOW
    
    createWinGlow: function() {
        this.winGlow = this.game.add.sprite(0,0,'winGlow');
        this.winGlow.anchor.setTo(0.51,0.5);
        this.winGlow.opacity = 0;
        this.winGlow.visible = false;
    },
    
    fadeInWinGlowAfterDelay: function(delay) {
        this.winGlow.position={x:this.blueprint.position.x,y:this.blueprint.position.y};
        this.winGlow.visible = true;
        this.add.tween(this.winGlow).to({alpha:1},300,"Linear",true,delay);
    },
    
    fadeOutWinGlow: function() {
        var fadeOut = this.add.tween(this.winGlow).to({alpha:0},200,"Linear",true);
        fadeOut.onComplete.add(this.makeWinGlowInvisible, this);
    },
    
    makeWinGlowInvisible: function()  {
        this.winGlow.visible = false;
    },
    
    // WIN RAYS
    
    createWinRays: function() {
        this.winRaysCW = this.game.add.group();
        this.winRaysCCW = this.game.add.group();
        var numRays = 5;
        for(var i = 0; i < numRays; i++) {
            var rayCW = this.winRaysCW.create(0,0,'spriteSheetGame','winRay');
            var rayCCW = this.winRaysCCW.create(0,0,'spriteSheetGame','winRay');
            rayCW.anchor.setTo(0.5,1);
            rayCCW.anchor.setTo(0.5,1);
            rayCW.angle = (360/numRays)*i;
            rayCCW.angle = (360/numRays)*i;
        }
        this.winRaysCW.alpha = 0;
        this.winRaysCCW.alpha = 0;
        this.winRaysCW.visible = false;
        this.winRaysCCW.visible = false;
    },
    
    fadeInWinRaysAfterDelay: function(delay) {
        this.winRaysCW.position={x:this.blueprint.position.x,y:this.blueprint.position.y};
        this.winRaysCCW.position={x:this.blueprint.position.x,y:this.blueprint.position.y};
        this.winRaysCW.visible = true;
        this.winRaysCCW.visible = true;
        this.add.tween(this.winRaysCW).to({alpha:1},200,"Linear",true,delay);
        this.add.tween(this.winRaysCCW).to({alpha:1},200,"Linear",true,delay);
        this.winRaysShowing = true;
        this.updateWinRayRotationScale();
    },
    
    fadeOutWinRays: function() {
        this.add.tween(this.winRaysCW).to({alpha:0},200,"Linear",true);
        var fadeOut = this.add.tween(this.winRaysCCW).to({alpha:0},200,"Linear",true);
        fadeOut.onComplete.add(this.makeWinRaysInvisible, this);
    },
    
    makeWinRaysInvisible: function()  {
        this.winRaysCW.visible = false;
        this.winRaysCCW.visible = false;
        this.winRaysShowing = false;
    },
    
    updateWinRayRotationScale: function() {
        this.winRaysCW.forEach(function(ray) {
            ray.angle += CrackTheCircuit.WIN_RAY_ROTATION_RATE;
            ray.scale.setTo(-(CrackTheCircuit.WIN_RAY_MAX_SCALE-CrackTheCircuit.WIN_RAY_MIN_SCALE)* Math.cos((2*Math.PI/180)*ray.angle)+(CrackTheCircuit.WIN_RAY_MIN_SCALE+CrackTheCircuit.WIN_RAY_MAX_SCALE)/2);
        }, this);
        
        this.winRaysCCW.forEach(function(ray) {
            ray.angle -= CrackTheCircuit.WIN_RAY_ROTATION_RATE;
            ray.scale.setTo(-(CrackTheCircuit.WIN_RAY_MAX_SCALE-CrackTheCircuit.WIN_RAY_MIN_SCALE)* Math.cos((2*Math.PI/180)*ray.angle)+(CrackTheCircuit.WIN_RAY_MIN_SCALE+CrackTheCircuit.WIN_RAY_MAX_SCALE)/2);
        }, this);
    },
    
    // WIN KEY
    
    createWinKey: function() {
        this.winKey = this.game.add.sprite(this.game.world.centerX, 0.4*this.game.world.height,'spriteSheetMenu','key_symbol');
        this.winKey.anchor.setTo(0.52,0.5);
        this.winKey.scale.setTo(0.45);
        this.winKey.alpha = 0;
    },
    
    fadeInWinKey: function() {
        this.add.tween(this.winKey).to({alpha:1},400,"Linear",true);
        this.add.tween(this.winKey.scale).to({x:0.75,y:0.75},750,"Sine.easeOut",true);
        var moveUp = this.add.tween(this.winKey).to({y:0.34*this.game.world.height},750,"Sine.easeOut",true);
        moveUp.onComplete.add(this.moveWinKeyToScore,this);
        
        var winKeyGlow = this.game.add.sprite(0,0,'spriteSheetGame','keyGlow');
        winKeyGlow.anchor.setTo(0.52,0.5);
        this.winKey.addChild(winKeyGlow);
        this.winKey.glowSprite = winKeyGlow;
        var fadeOut = this.game.add.tween(winKeyGlow).to({alpha:0},500,"Linear",true,800);
        fadeOut.onComplete.add(this.removeWinKeyGlow,this);
    },
    
    moveWinKeyToScore: function() { 
        var moveTime = 600;
        
        var keyFinalX = this.menu.completionText.position.x;
        var keyFinalY = this.menu.completionText.position.y - 0.5*this.menu.completionText.height - 0.4*this.winKey.height;
        var keyFinalScale = 0.45;
        
        var moveToCorner = this.game.add.tween(this.winKey).to({x:keyFinalX,y:keyFinalY},moveTime,Phaser.Easing.Cubic.In,true);
        this.game.add.tween(this.winKey.scale).to({x:keyFinalScale,y:keyFinalScale},moveTime,Phaser.Easing.Back.In,true);
        
        moveToCorner.onComplete.add(this.menu.incrementCompletionScore,this.menu);
        
        this.winScoreSound.play();
    },
    
    fadeOutWinKey: function() {
        var fadeOut = this.add.tween(this.winKey).to({alpha:0},200,"Linear",true);
        fadeOut.onComplete.add(this.destroyWinKey,this);
    },
    
    destroyWinKey: function() {
        this.winKey.destroy();
        this.winKey = null;
    },
    
    removeWinKeyGlow: function() {
        this.winKey.glowSprite.destroy();
        this.winKey.glowSprite = null;
    },
    
    // WIN SHADE
    
    fadeInWinShadeAfterDelay: function(delay) {
        this.winShade.visible = true;
        var fadeTween = this.add.tween(this.winShade);
        fadeTween.to( { alpha: 0.8 }, 1200, "Sine.easeInOut", true, delay);
        fadeTween.onComplete.add(this.showWinButtons, this);
    },
    
    fadeOutWinShade: function() {
        var fadeTween = this.add.tween(this.winShade);
        fadeTween.to( { alpha: 0 }, 450, "Linear", true);
        fadeTween.onComplete.add(this.makeWinShadeInvisible, this);
    },
    
    makeWinShadeInvisible: function() {
        this.winShade.visible = false;
    },
    
    showWinButtons: function() {
        this.menu.showWinButtons();
        this.menu.fadeInBackButton();
    },
    
    replayPressed: function() {
        this.circuitBox.closeBox();
        this.refreshBlueprint();
        this.fadeOutWinShade();
        this.fadeOutWinGlow();
        this.fadeOutWinRays();
        this.fadeOutWinKey();
        this.circuitBox.fadeOutWinShade();
        this.gameState = CrackTheCircuit.STATE_GAME;
    },
    
    nextLevelPressed: function() {
        //this.circuitBox.closeBox();
        this.lowerCircuitBoxAfterDelay(400);
        this.hideBlueprint();
        this.fadeOutWinShade();
        this.fadeOutWinGlow();
        this.fadeOutWinRays();
        this.fadeOutWinKey();
        this.circuitBox.fadeOutWinShade();
        
        this.curLevelNum++;
        this.loadGameDataForLevel(this.curLevelNum);
        
        this.gameState = CrackTheCircuit.STATE_GAME;
    },
    
    ///////// FREE DRAW ///////////
    
    freeDrawBtnPressed: function() {
        this.gameState = CrackTheCircuit.STATE_FREE_DRAW;
        this.lowerTitleBoxFreeDraw();
    },
    
    lowerTitleBoxFreeDraw: function() {
        var lower = this.game.add.tween(this.circuitBox).to({y:this.boxY_Down}, CrackTheCircuit.TITLE_BOX_LOWER_TIME, "Linear", true);
        this.game.time.events.add(Phaser.Timer.SECOND * 0.5, this.circuitBox.fadeOutNeonSound, this.circuitBox);
        if(this.byTUAM) {
            this.byTUAM.destroy();
            this.byTUAM = null; }
        this.zoomIntoFreeDrawAfterDelay(400);
        
        this.boxMoveDownSound.play();
    },
    
    zoomIntoFreeDrawAfterDelay: function(delay) {
        this.moveTableItemsToStateFromStateAfterDelay(CrackTheCircuit.STATE_FREE_DRAW, CrackTheCircuit.STATE_MAIN_MENU,delay);
        var zoom = this.game.add.tween(this.tableFront.scale).to({x:1,y:1},1000,"Sine.easeInOut",true,delay);
        this.game.add.tween(this.tableFront).to({y:0.69*this.game.height},1000,"Sine.easeInOut",true,delay);
        this.game.add.tween(this.tableBack.scale).to({x:1.2,y:1.2},1000,"Sine.easeInOut",true,delay);
        this.game.add.tween(this.tableBack).to({y:0.69*this.game.height},1000,"Sine.easeInOut",true,delay);
        
        if(this.hasLoadedGameAssets) {
            zoom.onComplete.add(this.showBlueprintForFreeDraw, this);
        } else { //if game assets have not been loaded yet
            this.stateToStartAfterLoad = CrackTheCircuit.STATE_FREE_DRAW;
            zoom.onComplete.add(this.startLoadingGameAssets, this);
        }
    },
    
    showBlueprintForFreeDraw: function() {
        
        this.blueprint.constructForFreeDrawSize(this.freeDrawSize);
        this.blueprint.visible = true;
        this.blueprint.position = {x:0.46*this.game.width, y:1.6*this.game.height};
        var bpTween = this.game.add.tween(this.blueprint).to({y: 0.5*this.game.world.height}, 600,"Sine.easeOut",true);
        this.blueprint.scale.setTo(1.3,1.3);
        this.game.add.tween(this.blueprint.scale).to({x:1, y:1}, 500,Phaser.Easing.Back.In,true);
        bpTween.onComplete.add(this.blueprint.enableTouch,this.blueprint);
        
        this.componentCards.position = {x:0.89*this.game.world.width, y:0.5*this.game.world.height}; //in case it tweened away earlier
        this.componentCards.resetForFreeDraw();
        this.componentCards.startThrowingInCardsAfterDelay(600, true);
        
        this.menu.createFreeDrawSizeButtons();
        this.menu.fadeInFreeDrawSizeButtonsAfterDelay(700);
        this.paperSlideSound.play();
    },
    
    toggleBlueprintDrawSize: function() {
        this.trashBtnPressed();
        this.blueprint.toggleDrawSize();
    },
    
    changeFreeDrawSizeTo: function(sizeIndex) {
        this.freeDrawSize = sizeIndex;
        this.blueprint.changeFreeDrawSizeTo(sizeIndex);
        if(this.componentCards.numBatteryCardsShowing == 0) {
            this.componentCards.throwInNewCardOfType(CrackTheCircuit.COMPONENT_BATTERY);
        }
    },
    
    hideBlueprintAfterFreeDraw: function() {
        
        //hide blueprint function with additional onComplete listener
        this.blueprint.disableTouch();
        this.game.add.tween(this.blueprint.scale).to({x:1.2, y:1.1}, 600,"Sine.easeIn",true);
        var bpTween = this.game.add.tween(this.blueprint).to({y: 1.6*this.game.world.height}, 600,"Sine.easeIn",true);
        bpTween.onComplete.add(this.makeBlueprintInvisible,this);
        this.zoomOutOfFreeDrawAfterDelay(0);
        this.hideCardsAfterDelay(150);
        this.menu.fadeOutFreeDrawSizeButtons();
    },
      
    zoomOutOfFreeDrawAfterDelay: function(delay) {
        var zoom = this.game.add.tween(this.tableFront.scale).to({x:0.835,y:0.835},1000,"Sine.easeInOut",true,delay);
        this.game.add.tween(this.tableFront).to({y:this.game.world.height},1000,"Sine.easeInOut",true,delay);
        this.game.add.tween(this.tableBack.scale).to({x:1,y:1},1000,"Sine.easeInOut",true,delay);
        this.game.add.tween(this.tableBack).to({y:this.game.world.height},1000,"Sine.easeInOut",true,delay);
        //this.game.add.tween(this.bg.scale).to({x:1,y:1},1000,"Sine.easeInOut",true,delay);
        this.raiseTitleBoxAgainAfterDelay(800+delay);
        this.moveTableItemsToStateFromStateAfterDelay(CrackTheCircuit.STATE_MAIN_MENU,CrackTheCircuit.STATE_FREE_DRAW,delay);
    },
    
    ///////// SAVED DATA //////////
    
    clearData: function() {
        this.numLevelsBeaten = 0;
        this.numTutsComplete = 0;
        this.saveGameData();
        this.menu.backBtnPressed();
    },
    
    ///////// AUDIO ////////////

    loadAudioForMenu: function() {
        this.backgroundMusic = this.add.audio('bgMusic');
        this.backgroundMusic.loop = true;  
        this.boxMoveUpSound = this.add.audio('boxMoveUp',0.6);
        this.boxMoveDownSound = this.add.audio('boxMoveDown',0.6);
    },
    
    loadAudioForGame: function() {
        this.levelWinSound = this.add.audio('levelWin');
        this.levelWinSound.volume = 0.4;
        this.winScoreSound = this.add.audio('winScore',0.7);
        this.paperSlideSound = this.add.audio('paperSlide',0.7);
    },
    
    startMusic: function() {
        this.backgroundMusic.play();
    },
    
    setMusicOn: function(musicOn) {
        this.musicOn = musicOn;
        
        if(this.musicOn) {
            this.backgroundMusic.resume();
        } else this.backgroundMusic.pause();
    },
    
    setSoundOn: function(soundOn) {
        this.soundOn = soundOn;
        
        this.game.sound.mute = !soundOn;
    },
    
    //////// SHOW ELECTRONS ////////
    
    setShowElectrons: function(showElectrons) {
        this.showElectrons = showElectrons;
    },
        
    hintBtnPressed: function() {
        this.trashBtnPressed();
        
        var hintComponents = this.curLevelData.hint;
        
        for(var i = 0; i < hintComponents.length; i++) {
            var componentType = hintComponents[i][0];
            var rowNum = hintComponents[i][1];
            var colNum = hintComponents[i][2];
            
            if(this.blueprint.drawSize == CrackTheCircuit.DRAW_SIZE_LARGE) {
                rowNum = rowNum+2;
            }
            
            this.blueprint.addComponentAt(rowNum,colNum,componentType);
            this.blueprint.makeDrawNodesVisibleAfterHint();
            this.componentCards.hideCardOfType(componentType);
        }
    },
    
    ////////// TUTORIAL MANAGER ///////////
    
    createTutManager: function() {
        this.tutManager = new TutorialManager(this.game, this, this.numTutsComplete);
        this.tutManager.create();
    },
    
    shadeAllButCircuitBox: function() {
        this.tutShade = this.winShade;
        this.tutShade.visible = true;
        var fadeTween = this.add.tween(this.tutShade);
        fadeTween.to( { alpha: 0.6 }, 500, "Sine.easeInOut", true);
        this.circuitBox.fadeInTutShadeAfterDelay(0);
    },
    
    shadeAllButBlueprintAfterDelay: function(delay) {        
        this.tutShade = this.game.add.sprite(0,0);
        this.tutShade.alpha = 0;
        var tutShadeGraphics = this.game.add.graphics(0,0).beginFill('0x000000').drawRect(0,0,this.game.width,this.game.height);
        this.tutShade.addChild(tutShadeGraphics);
        this.tutShade.visible = true;
        
        var fadeTween = this.add.tween(this.tutShade);
        fadeTween.to( { alpha: 0.7 }, 600, "Sine.easeInOut", true, delay);
        
        this.game.world.bringToTop(this.blueprint);
        this.game.world.bringToTop(this.tutManager);
    },
    
    fadeOutTutShadeAfterDelay: function(delay) {
        var fadeTween = this.add.tween(this.tutShade);
        fadeTween.to( { alpha: 0 }, 500, "Linear", true, delay);
        fadeTween.onComplete.add(this.makeTutShadeInvisible, this);
        fadeTween.onComplete.add(this.tutManager.goToNextSubtut, this.tutManager);
    },
    
    makeTutShadeInvisible: function() {
        this.tutShade.visible = false;
    },
    
    enableTapToAdvanceTutorial: function() {
        var stateRef = this;
        this.game.input.onDown.addOnce(function() {
            stateRef.tutManager.closeSubtut();
        });
    },
    
    showBlueprintInTutorial: function() {
        this.blueprint.visible = true;
        this.blueprint.position.x = this.game.world.centerX;
        this.blueprint.constructForGame();
        this.blueprint.scale.setTo(1.3,1.3);
        
        this.game.add.tween(this.blueprint.scale).to({x:1, y:1}, 500,Phaser.Easing.Back.In,true);
        
        var bpTween = this.game.add.tween(this.blueprint).to({y: 0.735*this.game.world.height}, 600,"Sine.easeOut",true);
        bpTween.onComplete.add(this.showBlueprintDrawTut,this);
        bpTween.onComplete.add(this.blueprint.enableTouch,this.blueprint);
        
        this.shadeAllButBlueprintAfterDelay(350);
        
        this.paperSlideSound.play();
        
        this.componentCards.position = {x:0.81*this.game.world.width, y:0.73*this.game.world.height}; //in case it tweened away earlier
        this.componentCards.resetWithComponents(this.curLevelData.numBulbs, this.curLevelData.numSwitches);
    },
    
    showCardsInTutorial: function() {
        this.game.world.bringToTop(this.componentCards);
        this.game.world.bringToTop(this.tutManager);
        this.componentCards.startThrowingInCardsAfterDelay(200, false);
    },
    
    showBlueprintDrawTut: function() {
        this.tutManager.showBlueprintDrawTut();
        this.blueprint.waitingForTutDraw = true;
    },
    
    tutorialFinished: function(index) {
        this.tutorialShowing = false;
        if(this.curLevelNum == 1) {
            this.menu.backToMenuBtn.scale.setTo(1);
            this.menu.fadeInHintBtn();
            this.menu.fadeInBackButton();
            this.menu.fadeInTrashButton();
            this.menu.fadeInSizeButton();
            this.numTutsComplete = 1;
        } else if(this.curLevelNum == 2) {
            this.numTutsComplete = 2;
            this.showBlueprint();
        } else if(this.curLevelNum == 3) {
            this.numTutsComplete = 3;
            this.showBlueprint();
        } this.saveGameData();
    },
}