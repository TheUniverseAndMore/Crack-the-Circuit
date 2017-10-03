Menu = function (game, gameState) {
    Phaser.Group.call(this, game);
    
    this.gameState = gameState;
    
    //menu items
    this.mainMenuBtnGroup;
    
    //input
    this.mouseDownOnButtonIndex;
    this.mouseDownOnLevelBoxIndex;
    
    //menu buttons
    this.playBtn;
    this.selectLevelBtn;
    
    //sub-items
    this.levelSelectPageGroup;
    this.levelBoxBtnGroup;
    this.levelSelectBtnGroup;
    this.settingsPageGroup;
    this.settingsBtnGroup;
    this.areYouSureText;
    this.areYouSureBtnGroup;
    this.aboutPageGroup;
    this.aboutBtnGroup;
    this.completionText;
    this.keySymbol;
    
    //level select
    this.levelBlock;
    this.totalLevels;
    this.totalLevelBlocks;
    this.levelSelectArrowLeft;
    this.levelSelectArrowRight;
    
    //permanent buttons
    this.backToMenuBtn;
    this.trashBtn;
    this.fullScreenXBtn;
    
    //hint button
    this.hintBtnGroup;
    this.hintBtn;
    this.hintBtnFillBar;
    this.hintBtnGlow;
    this.hintBtnTimer;
    
    //size button
    this.sizeBtn;
    
    //win buttons
    this.replayBtn;
    this.nextLevelBtn;
    
    //menu screens
    this.menuState; //which part of the main menu is the user on?
    
    //paper rolling animation
    this.paperMask;
    this.paperRollLeft;
    this.paperRollRight;
    
    //free draw
    this.freeDrawSizeButtonGroup;
    this.freeDrawSize;
    
    //Booleans
    this.isTouchScreen;
    this.musicOn;
    this.soundOn;
    this.showElectrons;
    
    //audio
    this.paperUnroll = null;
    this.paperRoll = null;
};

Menu.prototype = Object.create(Phaser.Group.prototype);
Menu.prototype.constructor = Menu;

Menu.prototype.create = function() {
    this.musicOn = this.gameState.musicOn;
    this.soundOn = this.gameState.soundOn;
    this.showElectrons = this.gameState.showElectrons;
    
    this.totalLevels = this.gameState.gameData.levels.length;
    this.totalLevelBlocks = Math.ceil(this.totalLevels/8);

    this.loadAudio();
    this.setupInput();
    this.menuState = CrackTheCircuit.MENU_STATE_MAIN;
    this.createBackBtn();
    this.createTrashBtn();
    this.createHintBtn();
    this.createSizeBtn();
    this.addFullScreenListeners();
    this.createFullScreenXBtn();
    this.createMenuButtons(); //main menu buttons
    this.createCompletionText();
    this.setupRollingAnimation();
    this.createWinButtons();
    
    if(this.game.scale.isFullScreen) {
        this.makeFullScreenXBtnVisible();
    }
};

Menu.prototype.setupInput = function() {
    this.isTouchScreen = this.game.device.touch;
    this.mouseDownOnButtonIndex = -1;
    this.mouseDownOnLevelBoxIndex = -1;
};

//////// BUTTONS START ///////////
        
//////// BACK BUTTON /////////

Menu.prototype.createBackBtn = function() {
    //create back button
    this.backToMenuBtn = this.game.add.sprite(0,0,'spriteSheetMenu','menu_btn');
    this.backToMenuBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_BACK, spriteString:'menu_btn', isText: false};

    this.backToMenuBtn.visible = false;
    this.backToMenuBtn.alpha = 0;

    this.backToMenuBtn.events.onInputOver.add(this.btnOnOver, this);
    this.backToMenuBtn.events.onInputOut.add(this.btnOnOut, this);
    this.backToMenuBtn.events.onInputDown.add(this.btnOnDown, this);
    this.backToMenuBtn.events.onInputUp.add(this.btnOnUp, this);
};

Menu.prototype.fadeInBackButton = function() {
    this.backToMenuBtn.visible = true;
    var fadeTime = 400;
    var backBtnFadeIn = this.game.add.tween(this.backToMenuBtn).to({alpha:1},fadeTime,"Linear",true);
    backBtnFadeIn.onComplete.add(this.enableBackButton,this);
};

Menu.prototype.fadeOutBackButton = function() {
    this.disableBackButton();
    var fadeTime = 200;
    var backBtnFadeOut = this.game.add.tween(this.backToMenuBtn).to({alpha:0},fadeTime,"Linear",true);
    backBtnFadeOut.onComplete.add(this.makeBackBtnInvisible, this);
    if(this.gameState.gameState == CrackTheCircuit.STATE_MAIN_MENU) { backBtnFadeOut.onComplete.add(this.fadeInMenuButtons, this); }
};

Menu.prototype.makeBackBtnInvisible = function() {
    this.backToMenuBtn.visible = false;
};

Menu.prototype.enableBackButton = function() {
    this.backToMenuBtn.inputEnabled = true;
};

Menu.prototype.disableBackButton = function() {
    this.backToMenuBtn.inputEnabled = false;
};

//////// TRASH BUTTON /////////

Menu.prototype.createTrashBtn = function() {
    //create back button
    this.trashBtn = this.game.add.sprite(0.136*this.game.world.width,0.51*this.game.world.height,'spriteSheetMenu','button_trash');
    this.trashBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_TRASH, spriteString:'button_trash', isText: false};
    
    this.trashBtn.visible = false;
    this.trashBtn.alpha = 0;

    this.trashBtn.events.onInputOver.add(this.btnOnOver, this);
    this.trashBtn.events.onInputOut.add(this.btnOnOut, this);
    this.trashBtn.events.onInputDown.add(this.btnOnDown, this);
    this.trashBtn.events.onInputUp.add(this.btnOnUp, this);
};

Menu.prototype.fadeInTrashButton = function() {
    if(this.gameState.gameState == CrackTheCircuit.STATE_FREE_DRAW) {
        this.trashBtn.position = {x:0.0012*this.game.world.width, y:0.11*this.game.world.height};
        this.trashBtn.scale.setTo(0.55);
    } else {
        this.trashBtn.position = {x:0.138*this.game.world.width, y:0.505*this.game.world.height};
        this.trashBtn.scale.setTo(0.7);
    }
    
    this.trashBtn.visible = true;
    var fadeTime = 400;
    var trashBtnFadeIn = this.game.add.tween(this.trashBtn).to({alpha:1},fadeTime,"Linear",true);
    trashBtnFadeIn.onComplete.add(this.enableTrashButton,this);
};

Menu.prototype.fadeOutTrashButton = function() {
    this.disableTrashButton();
    var fadeTime = 200;
    var trashBtnFadeOut = this.game.add.tween(this.trashBtn).to({alpha:0},fadeTime,"Linear",true);
    trashBtnFadeOut.onComplete.add(this.makeTrashBtnInvisible, this);
};

Menu.prototype.makeTrashBtnInvisible = function() {
    this.trashBtn.visible = false;
};

Menu.prototype.enableTrashButton = function() {
    this.trashBtn.inputEnabled = true;
};

Menu.prototype.disableTrashButton = function() {
    this.trashBtn.inputEnabled = false;
};

//////// SIZE BUTTON /////////

Menu.prototype.createSizeBtn = function() {
    //create back button
    this.sizeBtn = this.game.add.sprite(0.133*this.game.world.width,0.79*this.game.world.height,'spriteSheetMenu','button_size');
    this.sizeBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_SIZE, spriteString:'button_size', isText: false};
    
    this.sizeBtn.scale.setTo(0.7);
    
    this.sizeBtn.visible = false;
    this.sizeBtn.alpha = 0;

    this.sizeBtn.events.onInputOver.add(this.btnOnOver, this);
    this.sizeBtn.events.onInputOut.add(this.btnOnOut, this);
    this.sizeBtn.events.onInputDown.add(this.btnOnDown, this);
    this.sizeBtn.events.onInputUp.add(this.btnOnUp, this);
};

Menu.prototype.fadeInSizeButton = function() {
    this.sizeBtn.visible = true;
    var fadeTime = 400;
    var sizeBtnFadeIn = this.game.add.tween(this.sizeBtn).to({alpha:1},fadeTime,"Linear",true);
    sizeBtnFadeIn.onComplete.add(this.enableSizeButton,this);
};

Menu.prototype.fadeOutSizeButton = function() {
    this.disableSizeButton();
    var fadeTime = 200;
    var sizeBtnFadeOut = this.game.add.tween(this.sizeBtn).to({alpha:0},fadeTime,"Linear",true);
    sizeBtnFadeOut.onComplete.add(this.makeSizeBtnInvisible, this);
};

Menu.prototype.makeSizeBtnInvisible = function() {
    this.sizeBtn.visible = false;
};

Menu.prototype.enableSizeButton = function() {
    this.sizeBtn.inputEnabled = true;
};

Menu.prototype.disableSizeButton = function() {
    this.sizeBtn.inputEnabled = false;
};

//////// FULL SCREEN X BUTTON /////////

Menu.prototype.createFullScreenXBtn = function() {
    //create back button
    this.fullScreenXBtn = this.game.add.sprite(this.game.world.width,0,'spriteSheetMenu','button_x');
    this.fullScreenXBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_FULL_SCREEN_X, spriteString:'button_x', isText: false};
    this.fullScreenXBtn.anchor.setTo(1,0);
    
    this.fullScreenXBtn.scale.setTo(0.43);
    
    this.fullScreenXBtn.visible = false;
    this.fullScreenXBtn.alpha = 0.6;

    this.fullScreenXBtn.events.onInputOver.add(this.btnOnOver, this);
    this.fullScreenXBtn.events.onInputOut.add(this.btnOnOut, this);
    this.fullScreenXBtn.events.onInputDown.add(this.btnOnDown, this);
    this.fullScreenXBtn.events.onInputUp.add(this.btnOnUp, this);
};

Menu.prototype.addFullScreenListeners = function() {
    var ref = this;
    document.addEventListener("webkitfullscreenchange", function() { ref.fsChangeHandler(ref); }, false);
    document.addEventListener("mozfullscreenchange", function() { ref.fsChangeHandler(ref); }, false);
    document.addEventListener("fullscreenchange", function() { ref.fsChangeHandler(ref); }, false);
    document.addEventListener("MSFullscreenChange", function() { ref.fsChangeHandler(ref); }, false);
};

Menu.prototype.fsChangeHandler = function(ref) {
    if(game.scale.isFullScreen) {
        ref.makeFullScreenXBtnVisible();
    } else {
        ref.makeFullScreenXBtnInvisible();
    }
};

Menu.prototype.makeFullScreenXBtnVisible = function() {
    this.fullScreenXBtn.visible = true;
    this.enableFullScreenXButton();
};

Menu.prototype.makeFullScreenXBtnInvisible = function() {
    this.fullScreenXBtn.visible = false;
    this.disableFullScreenXButton();
};

Menu.prototype.enableFullScreenXButton = function() {
    this.fullScreenXBtn.inputEnabled = true;
};

Menu.prototype.disableFullScreenXButton = function() {
    this.fullScreenXBtn.inputEnabled = false;
};

//////////// HINT BTN ////////////

Menu.prototype.createHintBtn = function() {
    this.hintBtnGroup = this.game.add.group();
    this.hintBtnGroup.scale.setTo(0.52);
    this.hintBtnGroup.position = {x:0.045*this.game.width,y:0.187*this.game.height};
    this.hintBtnGroup.visible = false;
    this.hintBtnGroup.alpha = 0;
    
    this.hintBtnGlow = this.hintBtnGroup.create(0,0,'spriteSheetMenu','hint_btn_glow');
    this.hintBtnGlow.anchor.setTo(0.5);
    this.hintBtnGlow.visible = false;
    
    this.hintBtn = this.hintBtnGroup.create(0,0,'spriteSheetMenu','hint_btn');
    this.hintBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_HINT, spriteString:'hint_btn', isText: false};
    this.hintBtn.anchor.setTo(0.5);
    
    this.hintBtnFillBar = this.hintBtnGroup.create(0,0,'spriteSheetMenu','hint_btn_filler');
    this.hintBtnFillBar.anchor.setTo(0.5,1);
    this.hintBtnFillBar.alpha = 0.5;
    this.hintBtnFillBar.position = {x:0,y:0.5*this.hintBtnFillBar.height};
    
    var hintBtnBorder = this.hintBtnGroup.create(0,0,'spriteSheetMenu','hint_btn_border');
    hintBtnBorder.anchor.setTo(0.5);

    this.hintBtn.events.onInputOver.add(this.btnOnOver, this);
    this.hintBtn.events.onInputOut.add(this.btnOnOut, this);
    this.hintBtn.events.onInputDown.add(this.btnOnDown, this);
    this.hintBtn.events.onInputUp.add(this.btnOnUp, this);
    
    this.disableHintButton();
};

Menu.prototype.fadeInHintBtn = function() {
    this.hintBtnFillBar.scale.setTo(1);
    this.hintBtnGroup.visible = true;
    this.hintBtnGroup.scale.setTo(0.52);
    var fadeTime = 400;
    var hintBtnFadeIn = this.game.add.tween(this.hintBtnGroup).to({alpha:0.7},fadeTime,"Linear",true);
    hintBtnFadeIn.onComplete.add(this.startHintBtnTimer,this);
};

Menu.prototype.fadeOutHintBtn = function() {
    this.stopHintBtnTimer();
    this.disableHintButton();
    var fadeTime = 200;
    var hintBtnFadeOut = this.game.add.tween(this.hintBtnGroup).to({alpha:0},fadeTime,"Linear",true);
    hintBtnFadeOut.onComplete.add(this.makeHintBtnInvisible, this);
};

Menu.prototype.makeHintBtnInvisible = function() {
    this.hintBtnGroup.visible = false;
    this.hintBtnGlow.visible = false;
};

Menu.prototype.enableHintButton = function() {
    this.hintBtn.inputEnabled = true;
    this.hintBtnGlow.visible = true;    this.game.add.tween(this.hintBtnGroup.scale).to({x:this.hintBtnGroup.scale.x*CrackTheCircuit.HINT_BTN_SCALE_FACTOR_ACTIVE,y:this.hintBtnGroup.scale.y*CrackTheCircuit.HINT_BTN_SCALE_FACTOR_ACTIVE},150,Phaser.Easing.Back.Out,true);
    this.game.add.tween(this.hintBtnGroup).to({alpha:1},150,"Linear",true);
};

Menu.prototype.disableHintButton = function() {
    this.hintBtn.inputEnabled = false;
};

Menu.prototype.startHintBtnTimer = function() {
    if(this.gameState.gameState == CrackTheCircuit.STATE_GAME) {
        this.hintBtnTimer = this.game.add.tween(this.hintBtnFillBar.scale).to({y:0},CrackTheCircuit.HINT_TIME*1000,"Linear",true);
        this.hintBtnTimer.onComplete.add(this.enableHintButton,this);
    }
};

Menu.prototype.stopHintBtnTimer = function() {
    if(this.hintBtnTimer) {
        this.hintBtnTimer.stop();
    }
};

Menu.prototype.hintBtnPressed = function() {
    this.gameState.hintBtnPressed();
};

///// MENU BUTTONS ///////

Menu.prototype.createMenuButtons = function() {  
    this.mainMenuBtnGroup = this.game.add.group();
    this.mainMenuBtnGroup.visible = false;
    
    this.playBtn = this.game.add.bitmapText(this.game.world.centerX, 0.53*this.game.world.height, 'menuFont','New Game',86);
    this.playBtn.anchor.setTo(0.5);
    this.playBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_PLAY, isText: true};
    this.mainMenuBtnGroup.add(this.playBtn);
    
    this.selectLevelBtn = this.game.add.bitmapText(this.game.world.centerX, 0.664*this.game.world.height, 'menuFont','Select Level',74);
    this.selectLevelBtn.anchor.setTo(0.5);
    this.selectLevelBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_SELECT_LEVEL, isText: true};
    this.mainMenuBtnGroup.add(this.selectLevelBtn);
    
    var freeDrawBtn = this.game.add.bitmapText(this.game.world.centerX, 0.788*this.game.world.height, 'menuFont','Free Draw',70);
    freeDrawBtn.anchor.setTo(0.5);
    freeDrawBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_FREE_DRAW, isText: true};
    this.mainMenuBtnGroup.add(freeDrawBtn);
    
    var settingsBtn = this.game.add.bitmapText(this.game.world.centerX, 0.908*this.game.world.height, 'menuFont','Settings',70);
    settingsBtn.anchor.setTo(0.5);
    settingsBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_SETTINGS, isText: true};
    this.mainMenuBtnGroup.add(settingsBtn);
    
    var aboutBtn = this.game.add.bitmapText(0.13*this.game.world.width, this.game.world.height-15, 'menuFont','About',70);
    aboutBtn.anchor.setTo(0,1);
    aboutBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_ABOUT, isText: true};
    this.mainMenuBtnGroup.add(aboutBtn);

    this.mainMenuBtnGroup.forEach(function(btn) {
        btn.events.onInputOver.add(this.btnOnOver, this);
        btn.events.onInputOut.add(this.btnOnOut, this);
        btn.events.onInputDown.add(this.btnOnDown, this);
        btn.events.onInputUp.add(this.btnOnUp, this);
    }, this);
};

Menu.prototype.enableAboutPageButtons = function() {
    this.aboutBtnGroup.forEach(function(btn) {
        btn.inputEnabled = true;
    }, this);
};

Menu.prototype.disableAboutPageButtons = function() {
    this.aboutBtnGroup.forEach(function(btn) {
        btn.inputEnabled = false;
    }, this);
};

Menu.prototype.enableMenuButtons = function() {
    this.mainMenuBtnGroup.forEach(function(btn) {
        btn.inputEnabled = true;
    }, this);
    
    this.playBtnPressed();
    
    //if(this.gameState.numLevelsBeaten == 0) { this.selectLevelBtn.inputEnabled = false; }
};

Menu.prototype.disableMenuButtons = function() {
    this.mainMenuBtnGroup.forEach(function(btn) {
        btn.inputEnabled = false;
    }, this);
};

Menu.prototype.btnOnOver = function(sprite,pointer) {
    if(this.mouseDownOnButtonIndex == sprite.customParams.btnIndex) { //the mouse was down on btn and moved away and back
        if(sprite.customParams.isText) {
            sprite.font = 'menuFontHighlighted';
            sprite.scale.setTo(0.95);
        } else {
            sprite.loadTexture('spriteSheetMenu',sprite.customParams.spriteString+'_down');
        }
    }
    else if(this.isTouchScreen || this.mouseDownOnButtonIndex != -1) { //the mouse was down on another button, then moved
        //do nothing
    } else { 
        if(sprite.customParams.isText) {
            sprite.font = 'menuFontHighlighted';
        } else {
            sprite.loadTexture('spriteSheetMenu',sprite.customParams.spriteString+'_over');
        }
    }
    
    this.game.canvas.style.cursor = "pointer";
};

Menu.prototype.btnOnOut = function(sprite,pointer) {
    if(this.mouseDownOnButtonIndex == sprite.customParams.btnIndex) { //the mouse was down on btn and moved away and back
        if(sprite.customParams.isText) {
            sprite.font = 'menuFontHighlighted';
            sprite.scale.setTo(1);
        } else {
            sprite.loadTexture('spriteSheetMenu',sprite.customParams.spriteString);
        }
    } else {
        if(sprite.customParams.isText) {
            sprite.font = 'menuFont';
            sprite.scale.setTo(1);
        } else {
            sprite.loadTexture('spriteSheetMenu',sprite.customParams.spriteString);
        }
    }
    
    if(!(this.gameState.gameState == CrackTheCircuit.STATE_GAME && this.gameState.blueprint.isDraggingComponent)) {
        this.game.canvas.style.cursor = "default";
    }
};

Menu.prototype.btnOnDown = function(sprite,pointer) {
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
    this.mouseDownOnButtonIndex = sprite.customParams.btnIndex;
    if(sprite.customParams.isText) {
        sprite.font = 'menuFontHighlighted';
        sprite.scale.setTo(0.95);
    } else {
        sprite.loadTexture('spriteSheetMenu',sprite.customParams.spriteString+'_down');
    }
};

Menu.prototype.btnOnUp = function(sprite,pointer,isOver) {
    this.mouseDownOnButtonIndex = -1;
    if(sprite.customParams.isText) {
            sprite.font = 'menuFont';
            sprite.scale.setTo(1);
    } else { sprite.loadTexture('spriteSheetMenu',sprite.customParams.spriteString); }
    if(isOver && sprite.visible) { 
        this.buttonPressed(sprite.customParams.btnIndex);
        this.game.canvas.style.cursor = "default";
        //if it is a toggle button
        if(sprite.customParams.btnIndex == CrackTheCircuit.BTN_INDEX_MUSIC) {
            if(this.musicOn) { sprite.customParams.spriteString = 'music_btn_x'; } else { sprite.customParams.spriteString = 'music_btn'; }
        } else if(sprite.customParams.btnIndex == CrackTheCircuit.BTN_INDEX_SOUND) {
            if(this.soundOn) { sprite.customParams.spriteString = 'sound_btn_x'; } else { sprite.customParams.spriteString = 'sound_btn'; }
        } 
    }
};

Menu.prototype.buttonPressed = function(btnIndex) {
    switch(btnIndex) {
        case CrackTheCircuit.BTN_INDEX_BACK:
            this.backBtnPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_PLAY:
            this.playBtnPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_SELECT_LEVEL:
            this.selectLevelBtnPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_FREE_DRAW:
            this.freeDrawBtnPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_SETTINGS:
            this.settingsBtnPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_ABOUT:
            this.aboutBtnPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_LEVEL_SELECT_NEXT:
            this.nextLevelBlockPressed();
            break;
        case CrackTheCircuit.BTN_INDEX_LEVEL_SELECT_PREV:
            this.prevLevelBlockPressed();
            break;
        case CrackTheCircuit.BTN_INDEX_MUSIC:
            this.musicBtnPressed();
            break;
        case CrackTheCircuit.BTN_INDEX_SOUND:
            this.soundBtnPressed();
            break;
        case CrackTheCircuit.BTN_INDEX_ELECTRONS:
            this.showElectronsBtnPressed();
            break;
        case CrackTheCircuit.BTN_INDEX_CLEAR_DATA:
            this.clearDataBtnPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_CLEAR_DATA_Y:
            this.clearData();
            break;
        case CrackTheCircuit.BTN_INDEX_CLEAR_DATA_N:
            this.fadeOutAreYouSure();
            break;
        case CrackTheCircuit.BTN_INDEX_NEXT_LEVEL:
            this.nextLevelPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_REPLAY:
            this.replayPressed();
            this.game.canvas.style.cursor = "default";
            break;
        case CrackTheCircuit.BTN_INDEX_TRASH:
            this.trashPressed();
            break;
        case CrackTheCircuit.BTN_INDEX_SIZE:
            this.sizePressed();
            break;
        case CrackTheCircuit.BTN_INDEX_HINT:
            this.hintBtnPressed();
            break;
        case CrackTheCircuit.BTN_INDEX_LINK_1:
            window.open("http://www.haftig.se", "_blank");
            break;
        case CrackTheCircuit.BTN_INDEX_LINK_2:
            window.open("http://www.theuniverseandmore.com", "_blank");
            break;
        case CrackTheCircuit.BTN_INDEX_FULL_SCREEN_X:
            game.scale.stopFullScreen();
            break;
    }
};

Menu.prototype.playBtnPressed = function() {

    this.fadeOutMenuButtons(); //takes .1 seconds
    this.gameState.playBtnPressed();
};

Menu.prototype.selectLevelBtnPressed = function() {
    this.menuState = CrackTheCircuit.MENU_STATE_LEVEL_SELECT;
    this.fadeOutMenuButtons(CrackTheCircuit.BTN_INDEX_SELECT_LEVEL); //takes .1 seconds
};

Menu.prototype.freeDrawBtnPressed = function() {
    this.fadeOutMenuButtons(); //takes .1 seconds
    this.gameState.freeDrawBtnPressed();
};

Menu.prototype.settingsBtnPressed = function() {
    this.menuState = CrackTheCircuit.MENU_STATE_SETTINGS;
    this.fadeOutMenuButtons(CrackTheCircuit.BTN_INDEX_SETTINGS); //takes .1 seconds
};

Menu.prototype.aboutBtnPressed = function() {
    this.menuState = CrackTheCircuit.MENU_STATE_ABOUT;
    this.fadeOutMenuButtons(CrackTheCircuit.BTN_INDEX_ABOUT); //takes .1 seconds
};

Menu.prototype.backBtnPressed = function() {
    if(this.menuState == CrackTheCircuit.MENU_STATE_LEVEL_SELECT) {
        //remove the level select menu
        this.hideLevelSelectPage();
    }

    else if(this.menuState == CrackTheCircuit.MENU_STATE_SETTINGS) {
        //remove the settings menu
        this.hideSettingsPage();
    }

    else if(this.menuState == CrackTheCircuit.MENU_STATE_ABOUT) {
        //remove the about page
        this.hideAboutPage();
    }
    
    this.menuState = CrackTheCircuit.MENU_STATE_MAIN;
    this.fadeOutBackButton();
    this.gameState.backBtnPressed();
};

Menu.prototype.replayPressed = function() {
    this.fadeOutBackButton();
    this.hideWinButtons();
    this.gameState.replayPressed();
};

Menu.prototype.nextLevelPressed = function() {
    if(this.gameState.curLevelNum == this.gameState.totalLevels) { //if last level, back to menu
         this.backBtnPressed();
    } else {
        this.fadeOutBackButton();
        this.hideWinButtons();
        this.gameState.nextLevelPressed();
    }
};

Menu.prototype.trashPressed = function() {
    this.gameState.trashBtnPressed();
};

Menu.prototype.sizePressed = function() {
    this.gameState.toggleBlueprintDrawSize();
};

Menu.prototype.musicBtnPressed = function() {
    this.musicOn = !this.musicOn;
    this.gameState.setMusicOn(this.musicOn);
};

Menu.prototype.soundBtnPressed = function() {
    this.soundOn = !this.soundOn;
    this.gameState.setSoundOn(this.soundOn);
};

Menu.prototype.showElectronsBtnPressed = function() {
    this.showElectrons = !this.showElectrons;
    this.gameState.setShowElectrons(this.showElectrons);
};

Menu.prototype.clearDataBtnPressed = function() {
    this.disableSettingsPageButtons();
    var fadeOut = this.game.add.tween(this.settingsBtnGroup).to({alpha:0},150,"Sine.easeOut",true);
    fadeOut.onComplete.add(this.showAreYouSure, this);
};

Menu.prototype.fadeInMenuButtons = function() {
    
    var playString = 'Continue';
    if(this.gameState.numLevelsBeaten == 0) { 
        playString = 'New Game';
        //this.selectLevelBtn.alpha = 0.5;
    } //else this.selectLevelBtn.alpha = 1;
    this.playBtn.text = playString;
    
    this.mainMenuBtnGroup.visible = true;
    this.mainMenuBtnGroup.alpha = 0;
    var fadeTime = 200;
    var menuBtnFadeIn = this.game.add.tween(this.mainMenuBtnGroup).to({alpha:1},fadeTime,"Linear",true);
    menuBtnFadeIn.onComplete.add(this.enableMenuButtons,this);
    this.keySymbol.visible = true;
    this.fadeInCompletionText(true, true, 0);
};

Menu.prototype.fadeInCompletionText = function(showKey, inMenu, delay) {
        
    this.completionText.text = this.gameState.numLevelsBeaten + '/' + this.gameState.totalLevels;
    var posX, posY;
    if(inMenu) {
        posX = 0.9*this.game.world.width-0.5*this.completionText.width-15;
        posY = this.game.world.height-0.5*this.completionText.height-10;
    }
    else {
        posX = this.game.world.width-0.5*this.completionText.width-30;
        posY = 1.2*this.completionText.height+7;
    }
    
    this.completionText.position = {x:posX, y:posY};
    this.completionText.visible = true;
    
    if(!showKey) { //if it is being shown from the win screen and the score is being incremented
        //increment when key hits score
        this.completionText.text = (this.gameState.numLevelsBeaten-1) + '/' + this.gameState.totalLevels; //do it twice so when it changes, it is in the correct position
    }
    
    this.game.add.tween(this.completionText).to({alpha:1},300,"Linear",true, delay);
    
    if(showKey) {
        this.keySymbol.visible = true;
        if(inMenu) {
            this.keySymbol.position = {x:this.completionText.position.x, y:this.completionText.position.y - 0.5*this.completionText.height - 3};
        } else {
            this.keySymbol.position = {x:this.completionText.position.x, y:this.completionText.position.y - 0.5*this.completionText.height - 3};
        }
        this.game.add.tween(this.keySymbol).to({alpha:1},300,"Linear",true, delay);
    }
};

Menu.prototype.incrementCompletionScore = function() {
    this.completionText.text = this.gameState.numLevelsBeaten + '/' + this.gameState.totalLevels;
    this.completionText.scale.setTo(1.25);
    this.game.add.tween(this.completionText.scale).to({x:1,y:1},450,"Sine.easeIn",true);
};

Menu.prototype.fadeOutCompletionText = function() {
    this.game.add.tween(this.completionText).to({alpha:0},300,"Linear",true);
    var fadeOut = this.game.add.tween(this.keySymbol).to({alpha:0},300,"Linear",true);
    fadeOut.onComplete.add(this.setCompletionTextInvisible, this);
};

Menu.prototype.setCompletionTextInvisible = function() {
    this.completionText.visible = false;
    this.keySymbol.visible = false;
};

Menu.prototype.fadeOutMenuButtons = function(btnIndex) {
    this.disableMenuButtons();
    var fadeTime = 100;
    var menuBtnFadeOut = this.game.add.tween(this.mainMenuBtnGroup).to({alpha:0},fadeTime,"Linear",true);
    this.game.add.tween(this.completionText).to({alpha:0},fadeTime,"Linear",true);
    this.game.add.tween(this.keySymbol).to({alpha:0},fadeTime,"Linear",true);
    menuBtnFadeOut.onComplete.add(this.makeMenuBtnsInvisible, this);
    
    if(btnIndex == CrackTheCircuit.BTN_INDEX_PLAY) {
        
    } else if(btnIndex == CrackTheCircuit.BTN_INDEX_SELECT_LEVEL) {
        menuBtnFadeOut.onComplete.add(this.showLevelSelectPage, this);
    } else if(btnIndex == CrackTheCircuit.BTN_INDEX_FREE_DRAW) {
        //menuBtnFadeOut.onComplete.add(this.showFreeDrawPage, this);
    } else if(btnIndex == CrackTheCircuit.BTN_INDEX_SETTINGS) {
        menuBtnFadeOut.onComplete.add(this.showSettingsPage, this);
    } else if(btnIndex == CrackTheCircuit.BTN_INDEX_ABOUT) {
        menuBtnFadeOut.onComplete.add(this.showAboutPage, this);
    }
};

Menu.prototype.makeMenuBtnsInvisible = function() {
    this.mainMenuBtnGroup.visible = false;
};

//////// BUTTONS END ///////////

Menu.prototype.createCompletionText = function() {
    
    this.completionText = this.game.add.bitmapText(0,0, 'menuFont','0/20',70);
    this.completionText.anchor.setTo(0.5,0.6);
    this.completionText.alpha = 0;
    this.add(this.completionText);
    
    this.keySymbol = this.game.add.sprite(0,0, 'spriteSheetMenu','key_symbol');
    this.keySymbol.anchor.setTo(0.56,1);
    this.keySymbol.scale.setTo(0.45);
    this.keySymbol.alpha = 0;
    this.add(this.keySymbol);
};

///////// LEVEL SELECT PAGE ///////////

Menu.prototype.createLevelSelectPage = function() {
    this.levelBlock = 1;
    
    this.levelSelectPageGroup = this.game.add.group();
    this.levelSelectPageGroup.position = {x:this.game.world.centerX, y:1.3*this.game.world.height};

    var levelSelectPageBG = this.game.add.graphics(0,0);
    var pageWidth = 0.5333*this.game.world.width;
    var pageHeight = 0.45*this.game.world.height;
    levelSelectPageBG.beginFill(0xc4bd9d);
    levelSelectPageBG.drawRect(-pageWidth/2 ,-pageHeight/2, pageWidth, pageHeight);
    levelSelectPageBG.lineStyle(1,0x131724);
    levelSelectPageBG.moveTo(-0.425*pageWidth,-0.35*pageHeight);
    levelSelectPageBG.lineTo(0.425*pageWidth,-0.35*pageHeight);
    this.levelSelectPageGroup.add(levelSelectPageBG);
    
    var heading = this.game.add.bitmapText(-0.42*pageWidth, -0.46*pageHeight, 'levelSelectFont','select level',26);
    this.levelSelectPageGroup.add(heading);

    this.levelBoxBtnGroup = this.game.add.group();
    this.levelSelectPageGroup.add(this.levelBoxBtnGroup);
    
    
    var boxWidth = 0.162*levelSelectPageBG.width;
    var spaceBetweenBoxes = 0.05*levelSelectPageBG.width;
    var topLeftBoxX = -1.5*(spaceBetweenBoxes+boxWidth);
    var topLeftBoxY = -0.45*boxWidth;
    
    var gameData = this.gameState.gameData;
    
    for(var i = 1; i <= this.totalLevels; i++) {
        var levelSelectBox = this.levelBoxBtnGroup.create(0,0,'spriteSheetMenu','levelSelectBox');
        levelSelectBox.anchor.setTo(0.5);
        
        var posX = topLeftBoxX + ((i-1)%4)*(spaceBetweenBoxes+levelSelectBox.width);
        
        var q = i; //shift later levels to the right
        while(q > 8) {
            posX += 4*(spaceBetweenBoxes+levelSelectBox.width);
            q -= 8;
        }
        
        var topRow = true;
        var r = i;
        while(r > 4) {
            r -= 4;
            topRow = !topRow;
        }
        
        levelSelectBox.position.x = posX;
        if(topRow) {
            levelSelectBox.position.y = topLeftBoxY;
        } else levelSelectBox.position.y = topLeftBoxY + spaceBetweenBoxes + levelSelectBox.height;
        levelSelectBox.levelNum = i; //for button listeners
        
        //add the level number in the corner of each box
        var levelNum = this.game.add.bitmapText(-0.45*levelSelectBox.width, -0.45*levelSelectBox.height, 'levelSelectFont',i.toString(),20);
        levelSelectBox.addChild(levelNum);
        
        //add the 'check' symbol if the user has already beaten the level
        if(i <= this.gameState.numLevelsBeaten) { //the level has already been beaten
            var checkSprite = this.game.add.sprite(0,0,'spriteSheetMenu','levelSelectCheck');
            checkSprite.anchor.setTo(0.5);
            levelSelectBox.addChild(checkSprite);
        }
        
        //add the symbols for the components in each level

        var numBulbs = gameData.levels[i-1].numBulbs;
        var numSwitches = gameData.levels[i-1].numSwitches;
        
        var bulbCoords = new Array();
        var switchCoords = new Array();
        
        if(numSwitches == 2) {
            if(numBulbs == 3) {
                bulbCoords.push({x:32,y:7});
                bulbCoords.push({x:16,y:48});
                bulbCoords.push({x:48,y:48});
                switchCoords.push({x:6,y:29});
                switchCoords.push({x:50,y:29});
            } else if(numBulbs == 2) {
                bulbCoords.push({x:11,y:30});
                bulbCoords.push({x:54,y:30});
                switchCoords.push({x:28,y:11});
                switchCoords.push({x:28,y:58});
            } else if(numBulbs == 1) {
                bulbCoords.push({x:32,y:17});
                switchCoords.push({x:8,y:50});
                switchCoords.push({x:47,y:50});
            }
        } else if(numSwitches == 1) {
            if(numBulbs == 3) {
                bulbCoords.push({x:32,y:8});
                bulbCoords.push({x:9,y:33});
                bulbCoords.push({x:56,y:33});
                switchCoords.push({x:28,y:59});
            } else if(numBulbs == 2) {
                bulbCoords.push({x:12,y:43});
                bulbCoords.push({x:53,y:43});
                switchCoords.push({x:28,y:18});
            } else if(numBulbs == 1) {
                bulbCoords.push({x:32,y:16});
                switchCoords.push({x:28,y:56});
            }
        } else if(numSwitches == 0) {
            if(numBulbs == 3) {
                bulbCoords.push({x:12,y:43});
                bulbCoords.push({x:54,y:43});
                bulbCoords.push({x:33,y:12});
            } else if(numBulbs == 2) {
                bulbCoords.push({x:14,y:29});
                bulbCoords.push({x:50,y:29});
            } else if(numBulbs == 1) {
                bulbCoords.push({x:32,y:27});
            }
        }
        
        for(var j = 0; j < bulbCoords.length; j++) {
            var bulbSprite = this.game.add.sprite((bulbCoords[j].x/83 - 0.5)*levelSelectBox.width, (bulbCoords[j].y/83 - 0.5)*levelSelectBox.height,'spriteSheetMenu','levelSelectBulb');
            levelSelectBox.addChild(bulbSprite);
        }
        
        for(var k = 0; k < switchCoords.length; k++) {
            var switchSprite = this.game.add.sprite((switchCoords[k].x/83 - 0.5)*levelSelectBox.width, (switchCoords[k].y/83 - 0.5)*levelSelectBox.height,'spriteSheetMenu','levelSelectSwitch');
            levelSelectBox.addChild(switchSprite);
        }
        
        //set locked state/image
        
        if(i > this.gameState.numLevelsBeaten + 1) { //the level is locked
            var lockSprite = this.game.add.sprite(0,0,'spriteSheetMenu','levelSelectLock');
            lockSprite.anchor.setTo(0.5);
            levelSelectBox.addChild(lockSprite);
            levelSelectBox.isLocked = true;
        } else levelSelectBox.isLocked = false;
    }
    
    //make all level boxes invisible
    
    this.levelBoxBtnGroup.forEach(function(box) {
        box.visible = false;
    }, this);
    
    this.setBoxVisibilityInBlock(this.levelBlock,true);
    
    this.levelSelectBtnGroup = this.game.add.group();
    this.levelSelectPageGroup.add(this.levelSelectBtnGroup);
    
    this.levelSelectArrowRight = this.levelSelectBtnGroup.create(0.46*levelSelectPageBG.width, topLeftBoxY+0.5*(boxWidth+spaceBetweenBoxes), 'spriteSheetMenu','levelSelectArrow');
    this.levelSelectArrowRight.anchor.setTo(0.5);
    this.levelSelectArrowRight.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_LEVEL_SELECT_NEXT, spriteString:'levelSelectArrow'};
    this.game.add.tween(this.levelSelectArrowRight).to({x:0.47*levelSelectPageBG.width},600,"Sine.easeOut").to({x:0.46*levelSelectPageBG.width},600,"Sine.easeIn",true).loop();
    
    this.levelSelectArrowLeft = this.levelSelectBtnGroup.create(-0.46*levelSelectPageBG.width, topLeftBoxY+0.5*(boxWidth+spaceBetweenBoxes), 'spriteSheetMenu','levelSelectArrow');
    this.levelSelectArrowLeft.anchor.setTo(0.5);
    this.levelSelectArrowLeft.scale.setTo(-1);
    this.levelSelectArrowLeft.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_LEVEL_SELECT_PREV, spriteString:'levelSelectArrow'};
    this.game.add.tween(this.levelSelectArrowLeft).to({x:-0.47*levelSelectPageBG.width},600,"Sine.easeOut").to({x:-0.46*levelSelectPageBG.width},600,"Sine.easeIn",true).loop();
    
    if(this.levelBlock == 1) { this.levelSelectArrowLeft.visible = false; }
    else if(this.levelBlock == this.totalLevelBlocks) { this.levelSelectArrowRight.visible = false; }
    
    this.levelSelectBtnGroup.forEach(function(btn) {
        btn.events.onInputOver.add(this.btnOnOver, this);
        btn.events.onInputOut.add(this.btnOnOut, this);
        btn.events.onInputDown.add(this.btnOnDown, this);
        btn.events.onInputUp.add(this.btnOnUp, this);
    }, this);

    this.levelBoxBtnGroup.forEach(function(btn) {
        btn.events.onInputOver.add(this.levelBtnOnOver, this);
        btn.events.onInputOut.add(this.levelBtnOnOut, this);
        btn.events.onInputDown.add(this.levelBtnOnDown, this);
        btn.events.onInputUp.add(this.levelBtnOnUp, this);
    }, this);
    
    //put the currently active level block into view
    this.levelBoxBtnGroup.position.x += -(this.levelBlock-1) * 0.4525*this.game.world.width;
};

Menu.prototype.showLevelSelectPage = function() {
    this.createLevelSelectPage();
    
    var startAtBlock = 1;
    var numLevelsBeaten = this.gameState.numLevelsBeaten;
    while(numLevelsBeaten > 7) {
        startAtBlock++;
        numLevelsBeaten -= 8;
    } this.startAtLevelBlock(startAtBlock);
    this.fadeInBackButton();
    var showLevelSelectTween = this.game.add.tween(this.levelSelectPageGroup).to({y:0.72*this.game.world.height}, 450, "Sine.easeOut", true);
    showLevelSelectTween.onComplete.add(this.enableAndMaskLevelSelectPageButtons, this);

    this.startUnrollForGroup(this.levelSelectPageGroup,0.66,0.277*this.game.world.width);
};

Menu.prototype.enableAndMaskLevelSelectPageButtons = function() {
    this.enableLevelSelectPageButtons();
    
    //create level box mask for arrow transitions
    var levelBoxesMask = this.game.add.graphics(0,0);
    levelBoxesMask.beginFill(0xffffff);
    var maskWidth = 0.45*this.game.world.width;
    levelBoxesMask.drawRect(-maskWidth/2 ,-0.2*this.game.world.height,maskWidth,0.4*this.game.world.height);
    this.levelSelectPageGroup.add(levelBoxesMask);
    this.levelBoxBtnGroup.mask = levelBoxesMask;
};

Menu.prototype.hideLevelSelectPage = function() {  
    this.disableLevelSelectPageButtons();
    this.levelSelectArrowLeft.visible = false;
    this.levelSelectArrowRight.visible = false;
    var hideTween = this.game.add.tween(this.levelSelectPageGroup).to({y:1.3*this.game.world.height}, 450, "Sine.easeIn", true);
    hideTween.onComplete.add(this.destroyLevelSelectPageGroup,this);
    this.startRollForGroup(this.levelSelectPageGroup);
};

Menu.prototype.destroyLevelSelectPageGroup = function() {
    this.levelSelectPageGroup.destroy();
    this.levelSelectPageGroup = null;
};

Menu.prototype.enableLevelSelectPageButtons = function() {
    this.levelSelectBtnGroup.forEach(function(btn) {
        btn.inputEnabled = true;
    }, this);
    
    this.levelBoxBtnGroup.forEach(function(btn) {
        if(!btn.isLocked) { btn.inputEnabled = true; }
    }, this);
};

Menu.prototype.disableLevelSelectPageButtons = function() {
    this.levelSelectBtnGroup.forEach(function(btn) {
        btn.inputEnabled = false;
    }, this);
    
    this.levelBoxBtnGroup.forEach(function(btn) {
        btn.inputEnabled = false;
    }, this);
};

//////// LEVEL BUTTON LISTENERS /////////

Menu.prototype.levelBtnOnOver = function(sprite,pointer) {
    if(this.mouseDownOnLevelBoxIndex == sprite.levelNum) { //the mouse was down on btn and moved away and back
        sprite.loadTexture('spriteSheetMenu','levelSelectBox_down');
        sprite.scale.setTo(0.95);
    }
    else if(this.isTouchScreen || (this.mouseDownOnButtonIndex != CrackTheCircuit.BTN_INDEX_LEVEL_SELECT_BOX && this.mouseDownOnButtonIndex != -1) || this.mouseDownOnLevelBoxIndex != -1) { //the mouse was down on another button, then moved
        //do nothing
    } else {
        sprite.loadTexture('spriteSheetMenu','levelSelectBox_over');
    }
    
    this.game.canvas.style.cursor = "pointer";
};

Menu.prototype.levelBtnOnOut = function(sprite,pointer) {
    if(this.mouseDownOnLevelBoxIndex == sprite.levelNum) { //the mouse was down on btn and moved away and back
        sprite.loadTexture('spriteSheetMenu','levelSelectBox_over');
        sprite.scale.setTo(1);
    } else sprite.loadTexture('spriteSheetMenu','levelSelectBox');
    
    this.game.canvas.style.cursor = "default";
};

Menu.prototype.levelBtnOnDown = function(sprite,pointer) {
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
    
    this.mouseDownOnButtonIndex = CrackTheCircuit.BTN_INDEX_LEVEL_SELECT_BOX;
    this.mouseDownOnLevelBoxIndex = sprite.levelNum;
    sprite.loadTexture('spriteSheetMenu','levelSelectBox_down');
    sprite.scale.setTo(0.95);
};

Menu.prototype.levelBtnOnUp = function(sprite,pointer,isOver) {
    this.mouseDownOnButtonIndex = -1;
    this.mouseDownOnLevelBoxIndex = -1;
    sprite.scale.setTo(1);
    if(sprite.visible && isOver) { this.levelBoxPressed(sprite.levelNum); }
    sprite.loadTexture('spriteSheetMenu', 'levelSelectBox');
};

Menu.prototype.levelBoxPressed = function(levelNum) {
    this.hideLevelSelectPage();
    this.fadeOutMenuButtons(); //takes .1 seconds
    this.gameState.levelBoxPressed(levelNum);
    
    //fade out back vutton
    this.disableBackButton();
    var fadeTime = 200;
    var backBtnFadeOut = this.game.add.tween(this.backToMenuBtn).to({alpha:0},fadeTime,"Linear",true);
    backBtnFadeOut.onComplete.add(this.makeBackBtnInvisible, this);
    
    this.game.input.onDown.remove( this.removeMenuFromGlobalClick, this );
    
    this.game.canvas.style.cursor = "default";
};

Menu.prototype.nextLevelBlockPressed = function() {
    
    this.levelBlock++;
    if(this.levelBlock == this.totalLevelBlocks) { this.levelSelectArrowRight.visible = false; }
    this.levelSelectArrowLeft.visible = true;
    
    //this.disableLevelSelectPageButtons();
    
    this.setBoxVisibilityInBlock(this.levelBlock, true);
    
    if(!this.levelBoxBtnGroup.targetX) {
        this.levelBoxBtnGroup.targetX = 0;
    }
    
    this.levelBoxBtnGroup.targetX = this.levelBoxBtnGroup.targetX - 0.4525*this.game.world.width;
    
    var moveTween = this.game.add.tween(this.levelBoxBtnGroup).to({x:this.levelBoxBtnGroup.targetX},240,"Sine.easeOut", true);
    moveTween.onComplete.add(this.makePrevLevelBlockInvisible, this);
};

Menu.prototype.prevLevelBlockPressed = function() {
    
    this.levelBlock--;
    if(this.levelBlock == 1) { this.levelSelectArrowLeft.visible = false; }
    this.levelSelectArrowRight.visible = true;
    
    //this.disableLevelSelectPageButtons();
    
    this.setBoxVisibilityInBlock(this.levelBlock, true);
    
    this.levelBoxBtnGroup.targetX = this.levelBoxBtnGroup.targetX + 0.4525*this.game.world.width;
    
    var moveTween = this.game.add.tween(this.levelBoxBtnGroup).to({x:this.levelBoxBtnGroup.targetX},240,"Sine.easeOut", true);
    moveTween.onComplete.add(this.makeNextLevelBlockInvisible, this);
};

Menu.prototype.setBoxVisibilityInBlock = function(levelBlock, isVisible) {
    
    this.levelBoxBtnGroup.forEach(function(box) {
        //make level boxes invisible if they are not within the currently displayed level block
        var levelNum = box.levelNum;
        if(levelNum > 8*(levelBlock-1) && levelNum <= 8*levelBlock) {
            box.visible = isVisible;
        }
    }, this);
};

Menu.prototype.makePrevLevelBlockInvisible = function() {
    this.setBoxVisibilityInBlock(this.levelBlock-1, false);
    //this.enableLevelSelectPageButtons();
};

Menu.prototype.makeNextLevelBlockInvisible = function() {
    this.setBoxVisibilityInBlock(this.levelBlock+1, false);
    //this.enableLevelSelectPageButtons();
};

Menu.prototype.startAtLevelBlock = function(levelBlock) {
    var i = 1;
    while(i<levelBlock) {
        i++;
        this.levelBlock++;
        if(this.levelBlock == this.totalLevelBlocks) { this.levelSelectArrowRight.visible = false; }
        this.levelSelectArrowLeft.visible = true;

        this.setBoxVisibilityInBlock(this.levelBlock, true);

        if(!this.levelBoxBtnGroup.targetX) {
            this.levelBoxBtnGroup.targetX = 0;
        }

        this.levelBoxBtnGroup.targetX = this.levelBoxBtnGroup.targetX - 0.4525*this.game.world.width;

        this.levelBoxBtnGroup.position.x = this.levelBoxBtnGroup.targetX;
        this.makePrevLevelBlockInvisible();
    }
};

///////// END LEVEL SELECT /////////

///////// ABOUT PAGE ///////////

Menu.prototype.showAboutPage = function() {
    this.fadeInBackButton();
    
    this.aboutPageGroup = this.game.add.group();
    this.aboutPageGroup.position = {x:this.game.world.centerX, y:1.3*this.game.world.height};

    var aboutPageBG = this.game.add.graphics(0,0);
    var pageWidth = 0.5333*this.game.world.width;
    var pageHeight = 0.45*this.game.world.height;
    aboutPageBG.beginFill(0xc4bd9d);
    aboutPageBG.drawRect(-pageWidth/2 ,-pageHeight/2, pageWidth, pageHeight);
//    aboutPageBG.lineStyle(1,0x131724);
//    aboutPageBG.moveTo(-0.425*pageWidth,-0.35*pageHeight);
//    aboutPageBG.lineTo(0.425*pageWidth,-0.35*pageHeight);
    this.aboutPageGroup.add(aboutPageBG);
    
//    var heading = this.game.add.bitmapText(-0.42*pageWidth, -0.46*pageHeight, 'levelSelectFont','about',26);
//    this.aboutPageGroup.add(heading);
    
    var aboutTextString = this.gameState.gameData.aboutText;
    var aboutText = this.game.add.bitmapText(-0.46*pageWidth, -0.41*pageHeight, 'levelSelectFont', aboutTextString,21);
    aboutText.maxWidth = 0.92*pageWidth;
    this.aboutPageGroup.add(aboutText);
    
    this.aboutBtnGroup = this.game.add.group();
    this.aboutPageGroup.add(this.aboutBtnGroup);
    
    var link1 = this.aboutBtnGroup.create(0.152*this.game.world.width,-0.0152*this.game.world.height,'spriteSheetMenu','link1');
    link1.anchor.setTo(0.5);
    link1.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_LINK_1, spriteString:'link1'};
    
    var link2 = this.aboutBtnGroup.create(0.0335*this.game.world.width,0.131*this.game.world.height,'spriteSheetMenu','link2');
    link2.anchor.setTo(0.5);
    link2.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_LINK_2, spriteString:'link2'};

    this.aboutBtnGroup.forEach(function(btn) {
        btn.events.onInputOver.add(this.btnOnOver, this);
        btn.events.onInputOut.add(this.btnOnOut, this);
        btn.events.onInputDown.add(this.btnOnDown, this);
        btn.events.onInputUp.add(this.btnOnUp, this);
    }, this);

    var showAboutTween = this.game.add.tween(this.aboutPageGroup).to({y:0.72*this.game.world.height}, 450, "Sine.easeOut", true);
    
    showAboutTween.onComplete.add(this.enableAboutPageButtons, this);

    this.startUnrollForGroup(this.aboutPageGroup,0.6,0.26*this.game.world.width);
};

Menu.prototype.hideAboutPage = function() {        
    var hideTween = this.game.add.tween(this.aboutPageGroup).to({y:1.3*this.game.world.height}, 450, "Sine.easeIn", true);
    hideTween.onComplete.add(this.destroyAboutPage,this);
    this.startRollForGroup(this.aboutPageGroup);
    
    this.disableAboutPageButtons();
};

Menu.prototype.destroyAboutPage = function() {
    this.aboutPageGroup.destroy();
    this.aboutPageGroup = null;
};

///////// SETTINGS PAGE ///////////

Menu.prototype.createSettingsPage = function() {
    this.settingsPageGroup = this.game.add.group();
    this.settingsPageGroup.position = {x:this.game.world.centerX, y:1.3*this.game.world.height};

    var settingsPageBG = this.game.add.graphics(0,0);
    var pageWidth = 0.5333*this.game.world.width;
    var pageHeight = 0.45*this.game.world.height;
    settingsPageBG.beginFill(0xc4bd9d);
    settingsPageBG.drawRect(-pageWidth/2 ,-pageHeight/2, pageWidth, pageHeight);
    settingsPageBG.lineStyle(1,0x131724);
    settingsPageBG.moveTo(-0.425*pageWidth,-0.35*pageHeight);
    settingsPageBG.lineTo(0.425*pageWidth,-0.35*pageHeight);
    this.settingsPageGroup.add(settingsPageBG);
    
    var heading = this.game.add.bitmapText(-0.42*pageWidth, -0.46*pageHeight, 'levelSelectFont','settings',26);
    this.settingsPageGroup.add(heading);

    this.settingsBtnGroup = this.game.add.group();
    this.settingsPageGroup.add(this.settingsBtnGroup);
    
    var soundBtnString;
    if(this.soundOn) { soundBtnString = 'sound_btn_x'; } else { soundBtnString = 'sound_btn'; }
    var soundBtn = this.settingsBtnGroup.create(0.1*this.game.world.width, -0.085*this.game.world.height,'spriteSheetMenu',soundBtnString);
    soundBtn.anchor.setTo(1,0.5);
    soundBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_SOUND, spriteString:soundBtnString};

    var musicBtnString;
    if(this.musicOn) { musicBtnString = 'music_btn_x'; } else { musicBtnString = 'music_btn'; }
    var musicBtn = this.settingsBtnGroup.create(0.1*this.game.world.width, 0.025*this.game.world.height,'spriteSheetMenu',musicBtnString);
    musicBtn.anchor.setTo(1,0.5);
    musicBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_MUSIC, spriteString:musicBtnString};

//    var showElectronsBtnString;
//    if(this.showElectrons) { showElectronsBtnString = 'showElectrons_btn_x'; } else { showElectronsBtnString = 'showElectrons_btn'; }
//    var showElectronsBtn = this.settingsBtnGroup.create(0,0.05*this.game.world.height,'menuSprites',showElectronsBtnString);
//    showElectronsBtn.anchor.setTo(0.5);
//    showElectronsBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_ELECTRONS, spriteString:showElectronsBtnString};

    var clearDataBtn = this.settingsBtnGroup.create(0,0.14*this.game.world.height,'spriteSheetMenu','resetDataBtn');
    clearDataBtn.anchor.setTo(0.5);
    clearDataBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_CLEAR_DATA, spriteString:'resetDataBtn'};

    this.settingsBtnGroup.forEach(function(btn) {
        btn.events.onInputOver.add(this.btnOnOver, this);
        btn.events.onInputOut.add(this.btnOnOut, this);
        btn.events.onInputDown.add(this.btnOnDown, this);
        btn.events.onInputUp.add(this.btnOnUp, this);
    }, this);
};

Menu.prototype.showSettingsPage = function() {
    this.createSettingsPage();
    this.fadeInBackButton();
    var showSettingsTween = this.game.add.tween(this.settingsPageGroup).to({y:0.72*this.game.world.height}, 450, "Sine.easeOut", true);
    showSettingsTween.onComplete.add(this.enableSettingsPageButtons, this);

    this.startUnrollForGroup(this.settingsPageGroup,0.6,0.26*this.game.world.width);
};

Menu.prototype.hideSettingsPage = function() {  
    this.disableSettingsPageButtons();
    var hideTween = this.game.add.tween(this.settingsPageGroup).to({y:1.3*this.game.world.height}, 450, "Sine.easeIn", true);
    hideTween.onComplete.add(this.destroySettingsPageGroup,this);
    this.startRollForGroup(this.settingsPageGroup);
};

Menu.prototype.destroySettingsPageGroup = function() {
    this.settingsPageGroup.destroy();
    this.settingsPageGroup = null;
};

Menu.prototype.enableSettingsPageButtons = function() {
    this.settingsBtnGroup.forEach(function(btn) {
        btn.inputEnabled = true;
    }, this);
};

Menu.prototype.disableSettingsPageButtons = function() {
    this.settingsBtnGroup.forEach(function(btn) {
        btn.inputEnabled = false;
    }, this);
};

/////// CLEAR DATA - ARE YOU SURE? /////////

Menu.prototype.showAreYouSure = function() {
    var pageWidth = 0.5333*this.game.world.width;
    var pageHeight = 0.45*this.game.world.height;
    var areYouSureString = "Are you sure you want to\nerase all saved data?";
    this.areYouSureText = this.game.add.bitmapText(-0.43*pageWidth, -0.25*pageHeight, 'levelSelectFont', areYouSureString,31);
    this.settingsPageGroup.add(this.areYouSureText);

    this.areYouSureBtnGroup = this.game.add.group();
    this.settingsPageGroup.add(this.areYouSureBtnGroup);

    var clearDataYes = this.areYouSureBtnGroup.create(-0.09*this.game.world.width,0.1*this.game.world.height,'spriteSheetMenu','resetDataY_btn');
    clearDataYes.anchor.setTo(0.5);
    clearDataYes.scale.setTo(1.2);
    clearDataYes.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_CLEAR_DATA_Y, spriteString:'resetDataY_btn'};

    var clearDataNo = this.areYouSureBtnGroup.create(0.09*this.game.world.width,0.1*this.game.world.height,'spriteSheetMenu','resetDataN_btn');
    clearDataNo.anchor.setTo(0.5);
    clearDataNo.scale.setTo(1.2);
    clearDataNo.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_CLEAR_DATA_N, spriteString:'resetDataN_btn'};
    
    this.areYouSureBtnGroup.forEach(function(btn) {
        btn.events.onInputOver.add(this.btnOnOver, this);
        btn.events.onInputOut.add(this.btnOnOut, this);
        btn.events.onInputDown.add(this.btnOnDown, this);
        btn.events.onInputUp.add(this.btnOnUp, this);
    }, this);
    
    this.areYouSureText.alpha = 0;
    this.areYouSureBtnGroup.alpha = 0;
    
    this.game.add.tween(this.areYouSureText).to({alpha:1},150,"Sine.easeIn",true);
    var fadeIn = this.game.add.tween(this.areYouSureBtnGroup).to({alpha:1},150,"Sine.easeIn",true);
    fadeIn.onComplete.add(this.enableAreYouSure, this);
};

Menu.prototype.enableAreYouSure = function() {
    this.areYouSureBtnGroup.forEach(function(btn) {
        btn.inputEnabled = true;
    }, this);
};

Menu.prototype.disableAreYouSure = function() {
    this.areYouSureBtnGroup.forEach(function(btn) {
        btn.inputEnabled = false;
    }, this);
};

Menu.prototype.fadeOutAreYouSure = function() {
    this.disableAreYouSure();
    this.game.add.tween(this.areYouSureText).to({alpha:0},150,"Sine.easeOut",true);
    var fadeOut = this.game.add.tween(this.areYouSureBtnGroup).to({alpha:0},150,"Sine.easeOut",true);
    fadeOut.onComplete.add(this.fadeInSettingsButtons, this);
};
  
Menu.prototype.fadeInSettingsButtons = function() {
    var fadeIn = this.game.add.tween(this.settingsBtnGroup).to({alpha:1},150,"Sine.easeIn",true);
    fadeIn.onComplete.add(this.enableSettingsPageButtons, this);

    this.areYouSureText.destroy();
    this.areYouSureText = null;
    this.areYouSureBtnGroup.destroy();
    this.areYouSureBtnGroup = null;
};

///////// WIN SCREEN //////////

Menu.prototype.createWinButtons = function() {
    //create replay button
    this.replayBtn = this.game.add.sprite(this.game.world.centerX,0.59*this.game.world.height,'spriteSheetMenu','button_replay');
    this.replayBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_REPLAY, spriteString:'button_replay'};
    this.replayBtn.visible = false;
    this.replayBtn.anchor.setTo(0.5);
    this.add(this.replayBtn);

    this.replayBtn.events.onInputOver.add(this.btnOnOver, this);
    this.replayBtn.events.onInputOut.add(this.btnOnOut, this);
    this.replayBtn.events.onInputDown.add(this.btnOnDown, this);
    this.replayBtn.events.onInputUp.add(this.btnOnUp, this);
    
    //create next level button
    this.nextLevelBtn = this.game.add.sprite(this.game.world.centerX,0.59*this.game.world.height,'spriteSheetMenu','button_next');
    this.nextLevelBtn.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_NEXT_LEVEL, spriteString:'button_next'};
    this.nextLevelBtn.visible = false;
    this.nextLevelBtn.anchor.setTo(0.5);
    this.add(this.nextLevelBtn);

    this.nextLevelBtn.events.onInputOver.add(this.btnOnOver, this);
    this.nextLevelBtn.events.onInputOut.add(this.btnOnOut, this);
    this.nextLevelBtn.events.onInputDown.add(this.btnOnDown, this);
    this.nextLevelBtn.events.onInputUp.add(this.btnOnUp, this);
    
    this.disableWinButtons();
};

Menu.prototype.showWinButtons = function() {
    this.replayBtn.visible = true;
    this.nextLevelBtn.visible = true;
    this.replayBtn.position.x = this.game.world.centerX;
    this.nextLevelBtn.position.x = this.game.world.centerX;
    var winBtnMove = this.game.add.tween(this.replayBtn).to({x:this.game.world.centerX - 0.35*this.game.world.width},400,Phaser.Easing.Back.Out,true);
    this.game.add.tween(this.nextLevelBtn).to({x:this.game.world.centerX + 0.34*this.game.world.width},400,Phaser.Easing.Back.Out,true);
    winBtnMove.onComplete.add(this.enableWinButtons,this);
};

Menu.prototype.fadeInWinButtons = function() {
    
    var fadeTime = 400;
    this.game.add.tween(this.replayBtn).to({alpha:1},fadeTime,"Linear",true);
    this.game.add.tween(this.nextLevelBtn).to({alpha:1},fadeTime,"Linear",true);
};

Menu.prototype.hideWinButtons = function() {
    this.disableWinButtons();
    var replayBtnMove = this.game.add.tween(this.replayBtn).to({x:-0.25*this.game.world.width},500,"Sine.easeIn",true);
    this.game.add.tween(this.nextLevelBtn).to({x:this.game.world.width + 0.25*this.game.world.width},500,"Sine.easeIn",true);
    replayBtnMove.onComplete.add(this.makeWinButtonsInvisible,this);
    
    this.fadeOutCompletionText();
};

Menu.prototype.fadeOutWinButtons = function() {
    this.disableWinButtons();
    var fadeTime = 200;
    var btnFadeOut = this.game.add.tween(this.replayBtn).to({alpha:0},fadeTime,"Linear",true);
    btnFadeOut.onComplete.add(this.makeWinButtonsInvisible, this);
};

Menu.prototype.makeWinButtonsInvisible = function() {
    this.replayBtn.visible = false;
    this.nextLevelBtn.visible = false;
};

Menu.prototype.enableWinButtons = function() {
    this.replayBtn.inputEnabled = true;
    this.nextLevelBtn.inputEnabled = true;
};

Menu.prototype.disableWinButtons = function() {
    this.replayBtn.inputEnabled = false;
    this.nextLevelBtn.inputEnabled = false;
};

///////// ANIMATED UNROLLING PAPER //////////

Menu.prototype.setupRollingAnimation = function() {
    this.paperMask = this.game.add.graphics(this.game.world.centerX, this.game.world.centerY);
    this.paperMask.beginFill(0xffffff); this.paperMask.drawRect(-0.5*this.game.world.width,-0.5*this.game.world.height,this.game.world.width,this.game.world.height);
    this.paperMask.visible = false;

    this.paperRollLeft = this.game.add.sprite(this.game.world.centerX, 0.72*this.game.world.height, 'spriteSheetMenu2');
    this.paperRollLeft.anchor.setTo(0.7, 0.499);
    this.paperRollLeft.animations.add('unroll', Phaser.Animation.generateFrameNames('paper_', 1, 19,'',2), 30, false);
    this.paperRollLeft.animations.add('roll', Phaser.Animation.generateFrameNames('paper_', 19, 1,'',2), 90, false);
    this.paperRollLeft.visible = false;

    this.paperRollRight = this.game.add.sprite(this.game.world.centerX, 0.72*this.game.world.height, 'spriteSheetMenu2');
    this.paperRollRight.anchor.setTo(0.7, 0.499);
    this.paperRollRight.animations.add('unroll', Phaser.Animation.generateFrameNames('paper_', 1, 19,'',2), 30, false);
    this.paperRollRight.animations.add('roll', Phaser.Animation.generateFrameNames('paper_', 19, 1,'',2), 90, false);
    this.paperRollRight.scale.setTo(-1,1);
    this.paperRollRight.visible = false;
};

Menu.prototype.startUnrollForGroup = function(group, paperMaskScaleX, paperRollDx) {
    this.paperMask.visible = true;
    group.mask = this.paperMask;

    this.paperMask.scale.setTo(0,1);
    var maskTween = this.game.add.tween(this.paperMask.scale).to({x:paperMaskScaleX},580,"Linear",true);
    
    maskTween.onComplete.add(this.addListenerToCloseMenu, this);

    this.paperRollLeft.visible = true;
    this.paperRollRight.visible = true;
    this.paperRollLeft.bringToTop();
    this.paperRollRight.bringToTop();
    this.paperRollLeft.position = {x:this.game.world.centerX, y:group.position.y};
    this.paperRollRight.position = {x:this.game.world.centerX, y:group.position.y};
    this.game.add.tween(this.paperRollLeft).to({x:this.game.world.centerX-paperRollDx}, 500, "Linear", true);
    this.game.add.tween(this.paperRollRight).to({x:this.game.world.centerX+paperRollDx}, 500, "Linear", true);
    this.game.add.tween(this.paperRollLeft).to({y:0.72*this.game.world.height}, 450, "Sine.easeOut", true);
    this.game.add.tween(this.paperRollRight).to({y:0.72*this.game.world.height}, 450, "Sine.easeOut", true);
    this.playUnrollAnimation();
    
    this.paperUnroll.play();
};

Menu.prototype.addListenerToCloseMenu = function() {
    this.game.input.onDown.add( this.removeMenuFromGlobalClick, this );
};

Menu.prototype.removeMenuFromGlobalClick = function() {
    var menuRef = this;
    if(this.game.input.y < 0.5*this.game.world.height || Math.abs(this.game.input.x - this.game.world.centerX) > 0.28*this.game.world.width) {
        this.game.input.onDown.remove( this.removeMenuFromGlobalClick, this );
        this.backBtnPressed();
    }
};

Menu.prototype.playUnrollAnimation = function(group) {
    this.paperRollLeft.animations.play('unroll');
    this.paperRollRight.animations.play('unroll');
};

Menu.prototype.startRollForGroup = function(group) {

    this.game.add.tween(this.paperMask.scale).to({x:0.02},400,"Linear",true);
    var hideTween1 = this.game.add.tween(this.paperRollLeft).to({y:1.3*this.game.world.height}, 450, "Sine.easeIn", true);
    var hideTween2 = this.game.add.tween(this.paperRollRight).to({y:1.3*this.game.world.height}, 450, "Sine.easeIn", true);
    hideTween1.onComplete.add(this.makePaperRollsInvisible,this);
    this.game.add.tween(this.paperRollLeft).to({x:this.game.world.centerX}, 440, "Linear", true);
    this.game.add.tween(this.paperRollRight).to({x:this.game.world.centerX}, 440, "Linear", true);
    this.paperRollLeft.animations.play('roll');
    this.paperRollRight.animations.play('roll');
    
    this.paperRoll.play();
};

Menu.prototype.makePaperRollsInvisible = function() {
    this.paperRollLeft.visible = false;
    this.paperRollRight.visible = false;
};

///////// FREE DRAW ///////////

Menu.prototype.createFreeDrawSizeButtons = function() {
    this.freeDrawSize = this.gameState.freeDrawSize;
    
    this.freeDrawSizeButtonGroup = this.game.add.group();
    this.freeDrawSizeButtonGroup.alpha = 0;
    
    var sizeBtn1 = this.game.add.bitmapText(0.26*this.game.world.width, 0.94*this.game.world.height, 'menuFont','4x3',58);
    sizeBtn1.anchor.setTo(0.5);
    sizeBtn1.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_FD_SIZE_1, isText: true};
    sizeBtn1.sizeIndex = 1;
    this.freeDrawSizeButtonGroup.add(sizeBtn1);
    
    sizeBtn1.events.onInputOver.add(this.fdBtnOnOver, this);
    sizeBtn1.events.onInputOut.add(this.fdBtnOnOut, this);
    sizeBtn1.events.onInputDown.add(this.fdBtnOnDown, this);
    sizeBtn1.events.onInputUp.add(this.fdBtnOnUp, this);
    
    var sizeBtn2 = this.game.add.bitmapText(0.46*this.game.world.width, 0.94*this.game.world.height, 'menuFont','5x4',58);
    sizeBtn2.anchor.setTo(0.5);
    sizeBtn2.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_FD_SIZE_2, isText: true};
    sizeBtn2.sizeIndex = 2;
    this.freeDrawSizeButtonGroup.add(sizeBtn2);
    
    sizeBtn2.events.onInputOver.add(this.fdBtnOnOver, this);
    sizeBtn2.events.onInputOut.add(this.fdBtnOnOut, this);
    sizeBtn2.events.onInputDown.add(this.fdBtnOnDown, this);
    sizeBtn2.events.onInputUp.add(this.fdBtnOnUp, this);
    
    var sizeBtn3 = this.game.add.bitmapText(0.66*this.game.world.width, 0.94*this.game.world.height, 'menuFont','7x5',58);
    sizeBtn3.anchor.setTo(0.5);
    sizeBtn3.customParams = { btnIndex:CrackTheCircuit.BTN_INDEX_FD_SIZE_3, isText: true};
    sizeBtn3.sizeIndex = 3;
    this.freeDrawSizeButtonGroup.add(sizeBtn3);
    
    sizeBtn3.events.onInputOver.add(this.fdBtnOnOver, this);
    sizeBtn3.events.onInputOut.add(this.fdBtnOnOut, this);
    sizeBtn3.events.onInputDown.add(this.fdBtnOnDown, this);
    sizeBtn3.events.onInputUp.add(this.fdBtnOnUp, this);
    
    this.freeDrawSizeButtonGroup.forEach(function(btn) {
        btn.inputEnabled = false;
        if(btn.sizeIndex != this.freeDrawSize) { btn.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_OUT; }
    }, this);
};

Menu.prototype.fadeInFreeDrawSizeButtonsAfterDelay = function(delay) {
    var fadeInTween = this.game.add.tween(this.freeDrawSizeButtonGroup).to({alpha:1},400,"Linear",true,delay);
    fadeInTween.onComplete.add(this.enableFreeDrawSizeButtons,this);
};

Menu.prototype.enableFreeDrawSizeButtons = function() {
    this.freeDrawSizeButtonGroup.forEach(function(btn) {
        btn.inputEnabled = true;
    }, this);
};

Menu.prototype.disableFreeDrawSizeButtons = function() {
    this.freeDrawSizeButtonGroup.forEach(function(btn) {
        btn.inputEnabled = false;
    }, this);
};

Menu.prototype.fadeOutFreeDrawSizeButtons = function() {
    this.disableFreeDrawSizeButtons();
    var fadeOutTween = this.game.add.tween(this.freeDrawSizeButtonGroup).to({alpha:0},250,"Linear",true);
    fadeOutTween.onComplete.add(this.eraseFreeDrawSizeButtons,this);
};

Menu.prototype.eraseFreeDrawSizeButtons = function() {
    this.freeDrawSizeButtonGroup.destroy();
};

Menu.prototype.fdBtnOnOver = function(sprite,pointer) {
    if(this.mouseDownOnButtonIndex == sprite.customParams.btnIndex) { //the mouse was down on btn and moved away and back
        sprite.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_IN;
        sprite.scale.setTo(0.9);
    }
    else if(this.mouseDownOnButtonIndex != -1) { //the mouse was down on another button, then moved
        //do nothing
    } else { //button hover
        sprite.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_IN;
    }
    
    this.game.canvas.style.cursor = "pointer";
};

Menu.prototype.fdBtnOnOut = function(sprite,pointer) {
    sprite.scale.setTo(1);
    if(this.mouseDownOnButtonIndex == sprite.customParams.btnIndex) { //the mouse was down on btn and moved away and back
        sprite.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_IN;
    } else {
        if(sprite.sizeIndex != this.freeDrawSize) { sprite.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_OUT; }
        else sprite.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_IN;
    }
    
    this.game.canvas.style.cursor = "default";
};

Menu.prototype.fdBtnOnDown = function(sprite,pointer) {
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
    
    this.mouseDownOnButtonIndex = sprite.customParams.btnIndex;
    sprite.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_IN;
    sprite.scale.setTo(0.9);
};

Menu.prototype.fdBtnOnUp = function(sprite,pointer,isOver) {
    this.mouseDownOnButtonIndex = -1;
    if(sprite.sizeIndex != this.freeDrawSize) { sprite.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_OUT; }
    sprite.scale.setTo(1);
    
    if(isOver) {
        this.fdButtonPressed(sprite.sizeIndex);
    }
};

Menu.prototype.fdButtonPressed = function(sizeIndex) {
    if(this.freeDrawSize == sizeIndex) return;
    this.freeDrawSize = sizeIndex;
    this.freeDrawSizeButtonGroup.forEach(function(btn) {
        if(btn.sizeIndex != this.freeDrawSize) { btn.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_OUT; }
        else btn.alpha = CrackTheCircuit.FD_SIZE_BTN_ALPHA_IN;
    }, this);
    this.gameState.changeFreeDrawSizeTo(sizeIndex);
};

///////// SAVED DATA //////////

Menu.prototype.clearData = function() {
    this.gameState.clearData();
    this.mainMenuBtnGroup.children[0].text = 'New Game';
    
    this.game.input.onDown.remove( this.removeMenuFromGlobalClick, this );
    this.backBtnPressed();
};

///////// AUDIO ////////////

Menu.prototype.loadAudio = function() {
    this.paperRoll = this.game.add.audio('paperRoll',0.6);
    this.paperUnroll = this.game.add.audio('paperUnroll',0.6);
};