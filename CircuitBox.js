CircuitBox = function (game, gameState) {
    Phaser.Group.call(this, game);
    
    this.gameState = gameState;
    
    this.boxBase = null;
    this.boxTop = null;
    this.boxFront = null;
    this.keyhole = null;
    
    this.boxFrontStartingY;
    
    this.numBulbs;
    this.numSwitches;
    
    this.correctBehavior;
    
    this.leftmostBulbX = null;
    this.bulbSpacing = null;
    this.leftmostSwitchX = null;
    this.switchSpacing = null;
    
    this.bulbs = null;
    this.sockets = null;
    this.switches = null;
    
    this.switchStates = null;
    this.numBulbsOn = 0; //for bulb buzz audio
    
    this.bulbTouchBoxes = null;
    this.bulbPlugStates = null;
    
    this.bulbY;
    this.switchY;
    this.elementScale;
    
    //SWITCH HANDLES
    this.switchHandles = null;
    this.switchTouchBoxes = null;
    this.handleAngleOpen = -36;
    
    this.openBoxTime;
    this.unlockBoxTime;
    this.openBoxDy;
    this.open;
    
    //WIN SCREEN
    
    this.winShade = null;
    this.winGrid = null;
    this.winBattery = null;
    this.winWires = null;
    this.winWireCoords = null;
    this.winWireJunctionCoords = null;
    //this.keyholeGlow = null;
    
    //TUTORIAL
    this.tutShade = null;
    this.waitingForTutSwitch = false;
    this.waitingForTutBulb = false;
    
    //Audio
    this.neonHum = null;
    this.switchClose = null;
    this.switchOpen = null;
    this.bulbOn = null;
    this.bulbBuzz = null;
    
    this.boxOpenSound = null;
    this.boxCloseSound = null;
    
    this.winSchematicSound = null;
};

CircuitBox.prototype = Object.create(Phaser.Group.prototype);
CircuitBox.prototype.constructor = CircuitBox;

CircuitBox.prototype.create = function() {
    this.createTutShade();
    
    this.drawBox();
    
    this.loadAudioForMenu();
    
    this.openBoxTime = 360; //ms, when in menu user interaction (and always for closing the box)
    this.unlockBoxTime = 1200; //ms
    this.openBoxDy = 0.53*this.boxFront.height;
    
    this.open = false;
    
    this.switchStates = new Array();
    this.bulbs = new Array();
    this.sockets = new Array();
    this.bulbPlugStates = new Array();
    this.switches = new Array();
    this.switchHandles = new Array();
    this.switchTouchBoxes = new Array();
    this.bulbTouchBoxes = new Array();
};

CircuitBox.prototype.createGameAssets = function() {
    this.createWinShade();
    this.createWinScreen();
    this.loadAudioForGame();
};

CircuitBox.prototype.drawBox = function() {

    this.boxBase = this.game.add.sprite(0,0,'spriteSheetMenu2','box_box');
    this.boxBase.anchor.setTo(0.5,1);
    this.add(this.boxBase);
    
    this.boxTop = this.game.add.sprite(0,0,'spriteSheetMenu','box_top');
    this.boxTop.anchor.setTo(0.5,0);
    this.boxTop.position = {x:0,y:-1.13*this.boxBase.height};
    this.add(this.boxTop);
    
    this.boxFrontStartingY = -0.32*this.boxBase.height;
    this.boxFront = this.game.add.sprite(0,0,'spriteSheetMenu','box_front');
    this.boxFront.anchor.setTo(0.5,0.5);
    this.boxFront.position = {x:0,y:this.boxFrontStartingY};
    this.add(this.boxFront);
    
//    this.keyholeGlow = this.game.add.sprite(0,0,'winSprites','keyholeGlow');
//    this.keyholeGlow.position = {x:0,y:this.boxFrontStartingY};
//    this.keyholeGlow.anchor.setTo(0.5);
//    this.keyholeGlow.visible = false;
//    this.add(this.keyholeGlow);
    
    this.keyhole = this.game.add.sprite(0,0,'spriteSheetMenu','box_keyhole');
    this.keyhole.anchor.setTo(0.5);
    this.keyhole.position = {x:0,y:this.boxFrontStartingY};
    this.add(this.keyhole);
    
    this.keyhole.events.onInputDown.add(this.toggleBox, this);
};

CircuitBox.prototype.openBox = function() {
    this.open = true;
    this.game.add.tween(this.boxFront).to({y:this.boxFrontStartingY-this.openBoxDy},this.openBoxTime,"Sine.easeInOut",true);
    this.game.add.tween(this.keyhole).to({y:this.boxFrontStartingY-this.openBoxDy},this.openBoxTime,"Sine.easeInOut",true);
    this.game.add.tween(this.boxTop.scale).to({y:0.55},this.openBoxTime,"Sine.easeInOut",true);
    
    for(var i = 0; i < this.bulbs.length; i++) {
        this.game.add.tween(this.bulbs[i]).to({y:this.bulbY-0.6*this.openBoxDy},this.openBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.bulbs[i].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var l = 0; l < this.sockets.length; l++) {
        this.game.add.tween(this.sockets[l]).to({y:this.bulbY-0.6*this.openBoxDy},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var j = 0; j < this.switches.length; j++) {
        this.game.add.tween(this.switches[j]).to({y:this.switchY-0.6*this.openBoxDy},this.openBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.switches[j].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var k = 0; k < this.switchHandles.length; k++) {
        this.game.add.tween(this.switchHandles[k]).to({y:this.switchHandles[k].y-0.6*this.openBoxDy},this.openBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.switches[j].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    this.boxOpenSound.play();
};

CircuitBox.prototype.closeBox = function() {
    this.open = false;
    this.game.add.tween(this.boxFront).to({y:this.boxFrontStartingY},this.openBoxTime,"Sine.easeInOut",true);
    this.game.add.tween(this.keyhole).to({y:this.boxFrontStartingY},this.openBoxTime,"Sine.easeInOut",true);
    //this.game.add.tween(this.keyholeGlow).to({y:this.boxFrontStartingY},this.openBoxTime,"Sine.easeInOut",true);
    this.game.add.tween(this.boxTop.scale).to({y:1},this.openBoxTime,"Sine.easeInOut",true);
    
    for(var i = 0; i < this.bulbs.length; i++) {
        var bulbTween = this.game.add.tween(this.bulbs[i]).to({y:this.bulbY},this.openBoxTime,"Sine.easeInOut",true);
        if(this.bulbPlugStates[i] == 0) { //if the bulb was up, update it after closing
            this.bulbPlugStates[i] = 1;
            bulbTween.onComplete.add(function() { this.setBulbStates(true) }, this);
        }
        //this.game.add.tween(this.bulbs[i].scale).to({y:1},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var l = 0; l < this.sockets.length; l++) {
        this.game.add.tween(this.sockets[l]).to({y:this.bulbY},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var j = 0; j < this.switches.length; j++) {
        this.game.add.tween(this.switches[j]).to({y:this.switchY},this.openBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.switches[j].scale).to({y:1},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var k = 0; k < this.switchHandles.length; k++) {
        this.game.add.tween(this.switchHandles[k]).to({y:this.switchHandles[k].y+0.6*this.openBoxDy},this.openBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.switches[j].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    this.boxCloseSound.play();
    
    //this.lowerAnyRaisedBulbs();
};

CircuitBox.prototype.setClosed = function() {
    this.open = false;
    this.boxFront.position.y = this.boxFrontStartingY;
    this.keyhole.position.y = this.boxFrontStartingY;
    //this.keyholeGlow.position.y = this.boxFrontStartingY;
    this.boxTop.scale.setTo(1,1);
};

CircuitBox.prototype.toggleBox = function() {
    if(this.open) {
        this.closeBox();
    } else { this.openBox(); }
};

CircuitBox.prototype.addElementsForMenu = function() {
    this.numBulbs = 1;
    this.numSwitches = 1;
    
    if(this.open) this.setClosed();
    
    this.elementScale = 0.52; //switch scale
    
    this.bulbY = -0.83*this.boxBase.height;
    this.switchY = -0.9*this.boxBase.height;
    
    this.createNeonSign(false); //last, so that the glow overlays onto everything else
    this.createTitleSwitch(0);
};

CircuitBox.prototype.addElementsForBackToMenu = function() {
    
    this.clearAllElements();
    this.setClosed();
    
    this.numBulbs = 1;
    this.numSwitches = 1;
    
    this.elementScale = 0.52; //switch scale
    
    this.bulbY = -0.83*this.boxBase.height;
    this.switchY = -0.9*this.boxBase.height;
    
    this.createTitleSwitch(1);
    this.createNeonSign(true);
    
    this.neonHum.volume = 0;
    this.neonHum.play();
    this.neonHum.fadeTo(1000,0.15);
    
    this.enableTouch();
};

CircuitBox.prototype.createNeonSign = function(isOn) {
    var neonSign = this.game.add.group();
    neonSign.isNeon = true;
    neonSign.position = {x:0,y:this.bulbY};
    this.add(neonSign);

    var offSprite = neonSign.create(0,0,'spriteSheetMenu','title_sign_off');
    offSprite.anchor.setTo(0.5,0.693);
    
    var onSprite = neonSign.create(0,0,'spriteSheetMenu2','title_sign_on');
    onSprite.anchor.setTo(0.5,0.693);
    neonSign.onSprite = onSprite;
    
    neonSign.isOn = isOn;
    
    if(isOn) {
        neonSign.onHeatIndex = 1;
        onSprite.alpha = 1;
    } else { 
        neonSign.onHeatIndex = 0;
        onSprite.alpha = 0;
    }
    
    this.bulbs.push(neonSign);
};

CircuitBox.prototype.turnOnTitleLights = function() {
    this.bulbs[0].isOn = true;
    this.neonHum.volume = 0;
    this.neonHum.play();
    this.neonHum.fadeTo(100,0.15);
};

CircuitBox.prototype.turnOffTitleLights = function() {
    this.bulbs[0].isOn = false;
    this.neonHum.fadeOut(200);
};

CircuitBox.prototype.fadeInBulbSound = function() {
    this.bulbBuzz.fadeTo(600,0.5);
};

CircuitBox.prototype.fadeOutBulbSound = function() {
    this.bulbBuzz.fadeOut(CrackTheCircuit.BOX_LOWER_TIME-50);
};

CircuitBox.prototype.fadeOutNeonSound = function() {
    this.neonHum.fadeOut(CrackTheCircuit.TITLE_BOX_LOWER_TIME-50);
};

CircuitBox.prototype.clearAllElements = function() {
    //delete everything
    
    for(var i = this.numBulbs-1; i >= 0; i--) {
        this.bulbs[i].destroy();
        this.bulbs[i] = null;
    }
    
    for(var m = this.sockets.length-1; m >= 0; m--) {
        this.sockets[m].destroy();
        this.sockets[m] = null;
    }
    
    for(var l = this.bulbTouchBoxes.length-1; l >= 0; l--) {
        this.bulbTouchBoxes[l].destroy();
        this.bulbTouchBoxes[l] = null;
    }
    
    for(var j = this.switches.length-1; j >= 0; j--) {
        this.switches[j].destroy();
        this.switches[j] = null;
    }
    
    for(var k = this.switchHandles.length-1; k >= 0; k--) {
        this.switchHandles[k].destroy();
        this.switchHandles[k] = null;
        this.switchTouchBoxes[k].destroy();
        this.switchTouchBoxes[k] = null;
    }
    
    this.switchStates = [];
    this.bulbs = [];
    this.sockets = [];
    this.bulbPlugStates = [];
    this.switches = [];
    this.switchHandles = [];
    this.switchTouchBoxes = [];
    this.bulbTouchBoxes = [];
    
    this.numBulbsOn = 0;
};

CircuitBox.prototype.addElementsWithLevelData = function(gameData) {
    //load data for the next level
    this.numBulbs = gameData.numBulbs;
    this.numSwitches = gameData.numSwitches;
    this.correctBehavior = gameData.correctBehavior;
    this.winWireCoords = gameData.winWireCoords;
    this.winWireJunctionCoords = gameData.winWireJunctionCoords;
    
    //redraw the new box components
    this.elementScale = 0.6;
    this.setupSpacing(); //elementScale is updated if need be
    this.setupComponents();
    this.setBulbStates(false);
};

CircuitBox.prototype.setupSpacing = function() {
    
    this.bulbY = -0.72*this.boxBase.height;
    this.switchY = -0.97*this.boxBase.height;
    
    if(this.numBulbs == 1) {
        if(this.numSwitches == 0) {
            this.leftmostBulbX = 0;
        }
        else if(this.numSwitches == 1) {
            this.leftmostBulbX = -0.15*this.boxTop.width;
            this.leftmostSwitchX = 0.15*this.boxTop.width;
        }
        else if(this.numSwitches == 2) {
            this.elementScale = 0.57;
            this.leftmostBulbX = 0;
            this.leftmostSwitchX = -0.23*this.boxTop.width;
            this.switchSpacing = 0.46*this.boxTop.width;
        }
    }
    
    else if(this.numBulbs == 2) {
        if(this.numSwitches == 0) {
            this.leftmostBulbX = -0.15*this.boxTop.width;
            this.bulbSpacing = 0.3*this.boxTop.width;
        }
        else if(this.numSwitches == 1) {
            
            if(this.gameState.curLevelNum == 5 || this.gameState.curLevelNum == 6) {
                this.leftmostBulbX = -0.25*this.boxTop.width;
                this.leftmostSwitchX = 0.22*this.boxTop.width;
                this.bulbSpacing = 0.23*this.boxTop.width;
            } else {
                this.leftmostBulbX = -0.25*this.boxTop.width;
                this.leftmostSwitchX = -0.01*this.boxTop.width;
                this.bulbSpacing = 0.5*this.boxTop.width;
            }
        }
        else if(this.numSwitches == 2) {
            this.elementScale = 0.57;
            this.leftmostBulbX = -0.31*this.boxTop.width;
            this.leftmostSwitchX = -0.13*this.boxTop.width;
            this.bulbSpacing = 0.37*this.boxTop.width;
            this.switchSpacing = 0.38*this.boxTop.width;
        }
    }
    
    else if(this.numBulbs == 3) {
        if(this.numSwitches == 0) {
            this.leftmostBulbX = -0.26*this.boxTop.width;
            this.bulbSpacing = 0.26*this.boxTop.width;
        }
        else if(this.numSwitches == 1) {
            this.leftmostBulbX = -0.4*this.boxTop.width;
            this.leftmostSwitchX = 0.4*this.boxTop.width;
            this.bulbSpacing = 0.24*this.boxTop.width;
            this.switchSpacing = -1;
        }
        else if(this.numSwitches == 2) {
            this.elementScale = 0.54;
            this.leftmostBulbX = -0.32*this.boxTop.width;
            this.leftmostSwitchX = -0.16*this.boxTop.width;
            this.bulbSpacing = 0.32*this.boxTop.width;
            this.switchSpacing = 0.32*this.boxTop.width;
        }
    }
};

CircuitBox.prototype.setupComponents = function() {
    
    this.createBulbs();
    
    for(var j = 0; j < this.numSwitches; j++) {
        this.createSwitchAtX(this.leftmostSwitchX + j*this.switchSpacing);
    }
};

CircuitBox.prototype.createBulbs = function() {
    for(var i = 0; i < this.numBulbs; i++) {
        var bulb = this.game.add.group();
        bulb.position = {x:this.leftmostBulbX + i*this.bulbSpacing, y:this.bulbY};
        
        var offSprite = bulb.create(0,0, 'spriteSheetGame','lightbulb_off');
        offSprite.anchor.setTo(0.5,0.8);
        offSprite.scale.setTo(this.elementScale);
        var filamentSprite = bulb.create(0,0, 'spriteSheetGame','lightbulb_filament');
        filamentSprite.anchor.setTo(0.5,0.8);
        filamentSprite.scale.setTo(this.elementScale);
        filamentSprite.alpha = 0;
        var halfOnSprite = bulb.create(0,0, 'spriteSheetGame','lightbulb_half');
        halfOnSprite.anchor.setTo(0.5,0.8);
        halfOnSprite.scale.setTo(this.elementScale);
        halfOnSprite.alpha = 0;
        var onSprite = bulb.create(0,0, 'spriteSheetGame','lightbulb_on');
        onSprite.anchor.setTo(0.5,0.85);
        onSprite.scale.setTo(this.elementScale);
        onSprite.alpha = 0;
        
        bulb.add(offSprite);
        bulb.add(filamentSprite);
        bulb.add(halfOnSprite);
        bulb.add(onSprite);
        bulb.isOn = false;
        bulb.filamentHeatIndex = 0;
        bulb.halfHeatIndex = 0;
        bulb.onHeatIndex = 0;
        bulb.maxHeat = 0;
        
        var socket = this.game.add.sprite(bulb.position.x,bulb.position.y, 'spriteSheetGame','socket');
        socket.anchor.setTo(0.5,0.8);
        socket.scale.setTo(this.elementScale);
        
        this.add(socket);
        this.sockets.push(socket);
        this.add(bulb);
        this.bulbs.push(bulb);
        
        if(this.gameState.curLevelNum > 2) {
            var bulbTouchBox = this.game.add.sprite(bulb.position.x,bulb.position.y-0.43*offSprite.height,'spriteSheetMenu','switch_hitBox');
            bulbTouchBox.anchor.setTo(0.5);
            bulbTouchBox.scale.setTo(0.86*this.elementScale,0.95*this.elementScale);
            bulbTouchBox.index = this.bulbTouchBoxes.length;
            bulbTouchBox.canTouch = true;
            this.add(bulbTouchBox);
            bulbTouchBox.alpha = 0;
            bulbTouchBox.events.onInputDown.add(this.toggleBulb, this);
            bulbTouchBox.events.onInputOver.add(this.bulbOnOver, this);
            bulbTouchBox.events.onInputOut.add(this.bulbOnOut, this);
            this.bulbTouchBoxes.push(bulbTouchBox);

            this.bulbPlugStates.push(1);
        }
    }
};

CircuitBox.prototype.bulbOnOver = function() {
    this.game.canvas.style.cursor = "pointer";
},
    
CircuitBox.prototype.bulbOnOut = function() {
    if(!(this.gameState.gameState == CrackTheCircuit.STATE_GAME && this.gameState.blueprint.isDraggingComponent)) {
        this.game.canvas.style.cursor = "default";
    }
},
    
CircuitBox.prototype.enableBulbTouch = function() {
    for(var i = 0; i < this.bulbTouchBoxes.length; i++) {
        this.bulbTouchBoxes[i].canTouch = true;
    }
},
    
CircuitBox.prototype.disableBulbTouch = function() {
    for(var i = 0; i < this.bulbTouchBoxes.length; i++) {
        this.bulbTouchBoxes[i].canTouch = false;
    }
},

CircuitBox.prototype.setBulbStates = function(fromSwitch) {
        
    var stateIndex = -1;
    var bulbUnpluggedIndex = -1;
    
    for(var i = 0; i < this.bulbPlugStates.length; i++) {
        if(this.bulbPlugStates[i] == 0) { //if the bulb is up
            bulbUnpluggedIndex = i;
            break;
        }
    }
    
    if(this.numSwitches == 0) {
        stateIndex = 0;
    }
    
    else if(this.numSwitches == 1) {
        stateIndex = this.switchStates[0]; // is the only switch open or closed?
    }
    
    else { //if(this.numSwitches == 2) {
        stateIndex = this.switchStates[0] + 2*this.switchStates[1]; // gets the right index from 0-3
    }
    
    var bulbIndex;
    
    for(var i = 0; i < this.numBulbs; i++) {
        
        bulbIndex = this.numSwitches+i;
        
        var bulbState;
        
        if(i == bulbUnpluggedIndex) {
            bulbState = 0;
        }
        
        else {
            
            if(bulbUnpluggedIndex != -1) {
                bulbIndex += this.numBulbs;
                
                if(this.numBulbs == 3) {
                    bulbIndex += i;
                    
                    // I should be shot for doing this. But I'm tired, leave me alone.
                    if((bulbUnpluggedIndex == 2 && (i == 0 || i == 1)) || (bulbUnpluggedIndex == 1 && i == 2)) {
                        bulbIndex += 1;
                    }
                }
            }
            
            bulbState = this.correctBehavior[bulbIndex][stateIndex]; //switches are before bulbs in the 'correct behavior' array
        }
        
        if(bulbState == 0) {
            if(this.bulbs[i].isOn) { //if the bulb was  previously on
                if(this.numBulbsOn==1) {
                    this.bulbBuzz.fadeOut(200);
                }
                this.numBulbsOn--;
            }
            this.bulbs[i].isOn = false;
        }
        
        else { //if(bulbState != 0) 
            if(!this.bulbs[i].isOn) { //if the bulb was not previously on
                if(this.numBulbsOn==0) {
                    if(fromSwitch) { this.bulbBuzz.volume=0.5; }
                    else { this.bulbBuzz.volume = 0; } // to fade in as box rises
                    this.bulbBuzz.play();
                } 
                
                if(fromSwitch) { this.bulbOn.play(); } //do not play if bulb is being set when box is loaded
                this.numBulbsOn++;
            }
            this.bulbs[i].isOn = true;
            this.bulbs[i].maxHeat = this.correctBehavior[bulbIndex][stateIndex];
        }
    }
};

////////// SWITCHES ////////////

CircuitBox.prototype.createTitleSwitch = function(closed) {
    
    var posX = -0.013*this.boxBase.width;
    
    var newSwitchBack = this.game.add.sprite(posX, this.switchY, 'spriteSheetMenu','switch_back');
    newSwitchBack.anchor.setTo(0.5);
    newSwitchBack.scale.setTo(this.elementScale);

    var newSwitchHandle = this.game.add.sprite(newSwitchBack.x- 0.25*newSwitchBack.width, newSwitchBack.y - 0.2*newSwitchBack.height, 'spriteSheetMenu','switch_handle_title');
    newSwitchHandle.anchor.setTo(0.08,0.833);
    newSwitchHandle.scale.setTo(this.elementScale);
    if(!closed) { newSwitchHandle.angle = this.handleAngleOpen };

    var newSwitchFront = this.game.add.sprite(posX, this.switchY, 'spriteSheetMenu','switch_front');
    newSwitchFront.anchor.setTo(0.5);
    newSwitchFront.scale.setTo(this.elementScale);

    this.switches.push(newSwitchBack);
    this.switches.push(newSwitchFront);
    this.switchHandles.push(newSwitchHandle);

    this.switchStates.push(closed); //open switch

    this.add(newSwitchBack);
    this.add(newSwitchHandle);
    this.add(newSwitchFront);

    var switchTouchBox = this.game.add.sprite(posX,this.switchY-0.2*newSwitchBack.height,'spriteSheetMenu','switch_hitBox');
    switchTouchBox.anchor.setTo(0.5,0.6);
    switchTouchBox.scale.setTo(this.elementScale);
    switchTouchBox.index = this.switchTouchBoxes.length;
    switchTouchBox.canTouch = true;
    this.add(switchTouchBox);
    switchTouchBox.alpha = 0;
    switchTouchBox.events.onInputDown.add(this.toggleTitleSwitch, this);
    switchTouchBox.events.onInputOver.add(this.switchOnOver, this);
    switchTouchBox.events.onInputOut.add(this.switchOnOut, this);
    this.switchTouchBoxes.push(switchTouchBox);
},
    
CircuitBox.prototype.switchOnOver = function() {
    this.game.canvas.style.cursor = "pointer";
},
    
CircuitBox.prototype.switchOnOut = function() {
    if(!(this.gameState.gameState == CrackTheCircuit.STATE_GAME && this.gameState.blueprint.isDraggingComponent)) {
        this.game.canvas.style.cursor = "default";
    }
},

CircuitBox.prototype.createSwitchAtX = function(posX) {
    
    var newSwitchBack = this.game.add.sprite(posX, this.switchY, 'spriteSheetMenu','switch_back');
    newSwitchBack.anchor.setTo(0.5);
    newSwitchBack.scale.setTo(this.elementScale*1.15);

    var newSwitchHandle = this.game.add.sprite(newSwitchBack.x- 0.25*newSwitchBack.width, newSwitchBack.y - 0.2*newSwitchBack.height, 'spriteSheetGame','switch_handle');
    newSwitchHandle.anchor.setTo(0.08,0.45);
    newSwitchHandle.scale.setTo(this.elementScale*1.15);
    newSwitchHandle.angle = this.handleAngleOpen;

    var newSwitchFront = this.game.add.sprite(posX, this.switchY, 'spriteSheetMenu','switch_front');
    newSwitchFront.anchor.setTo(0.5);
    newSwitchFront.scale.setTo(this.elementScale*1.15);

    this.switches.push(newSwitchBack);
    this.switches.push(newSwitchFront);
    this.switchHandles.push(newSwitchHandle);

    this.switchStates.push(0); //open switch

    this.add(newSwitchBack);
    this.add(newSwitchHandle);
    this.add(newSwitchFront);

    var switchTouchBox = this.game.add.sprite(posX,this.switchY-0.2*newSwitchBack.height,'spriteSheetMenu','switch_hitBox');
    switchTouchBox.anchor.setTo(0.5);
    switchTouchBox.scale.setTo(this.elementScale);
    switchTouchBox.index = this.switchTouchBoxes.length;
    switchTouchBox.canTouch = true;
    this.add(switchTouchBox);
    switchTouchBox.alpha = 0;
    switchTouchBox.events.onInputDown.add(this.toggleSwitch, this);
    switchTouchBox.events.onInputOver.add(this.switchOnOver, this);
    switchTouchBox.events.onInputOut.add(this.switchOnOut, this);
    this.switchTouchBoxes.push(switchTouchBox);
},
    
CircuitBox.prototype.enableSwitchTouch = function() {
    for(var i = 0; i < this.switchTouchBoxes.length; i++) {
        this.switchTouchBoxes[i].canTouch = true;
    }
},
    
CircuitBox.prototype.disableSwitchTouch = function() {
    for(var i = 0; i < this.switchTouchBoxes.length; i++) {
        this.switchTouchBoxes[i].canTouch = false;
    }
},
    
CircuitBox.prototype.enableKeyholeTouch = function() {
    this.keyhole.inputEnabled = true;
},
    
CircuitBox.prototype.disableKeyholeTouch = function() {
    this.keyhole.inputEnabled = false;
},
    
CircuitBox.prototype.toggleTitleSwitch = function() {
        
    if(!this.switchTouchBoxes[0].canTouch) return;
    
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
    
    this.disableSwitchTouch();
    
    var switchTween;
    
    if(this.switchStates[0] == 0) { //if the switch is open
        switchTween = this.game.add.tween(this.switchHandles[0]).to({angle:0},140,Phaser.Easing.Back.In,true);
        switchTween.onComplete.add(this.turnOnTitleLights, this);
        this.switchStates[0] = 1;
        this.switchClose.play();
    }
    
    else { //if(this.switchStates[0] == 1) { //if the switch is closed
        switchTween = this.game.add.tween(this.switchHandles[0]).to({angle:this.handleAngleOpen},150,"Sine.easeOut",true);
        this.switchStates[0] = 0;
        this.turnOffTitleLights();
        this.switchOpen.play();
    }
    
    switchTween.onComplete.add(this.enableTouch, this); //enable switch touch after the title lights are on
},
    
CircuitBox.prototype.toggleSwitch = function(touchBox,pointer) {
    
    if(!this.switchTouchBoxes[touchBox.index].canTouch) return;
    
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
    
    this.disableSwitchTouch();
    
    var index = touchBox.index;
    var switchTween;
    
    if(this.switchStates[index] == 0) { //if the switch is open
        switchTween = this.game.add.tween(this.switchHandles[index]).to({angle:0},200,Phaser.Easing.Back.In,true);
        this.switchStates[index] = 1;
        switchTween.onComplete.add(this.setBulbStates, this);
        //switchTween.onComplete.add(this.playSwitchCloseSound, this);
        
        //audio
        this.switchClose.play();
    }
    
    else { //if(this.switchStates[index] == 1) { //if the switch is closed
        switchTween = this.game.add.tween(this.switchHandles[index]).to({angle:this.handleAngleOpen},150,"Linear",true);
        this.switchStates[index] = 0;
        this.setBulbStates(true);
        
        //audio
        this.switchOpen.play();
    }
    
    switchTween.onComplete.add(this.enableSwitchTouch, this);
    
    if(this.waitingForTutSwitch) {
        this.waitingForTutSwitch = false;
        this.gameState.tutManager.closeSubtut();
    }
},
    
CircuitBox.prototype.toggleBulb = function(touchBox,pointer) {
    if(!this.bulbTouchBoxes[touchBox.index].canTouch) return;
    
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
    
    this.disableBulbTouch();
    
    if(this.waitingForTutBulb) {
        this.waitingForTutBulb = false;
        this.gameState.tutManager.closeSubtut();
    }
    
    for(var i = 0; i < this.bulbPlugStates.length; i++) {
        if(this.bulbPlugStates[i] == 0) { //if another bulb is up, send it down first
            bulbTween = this.game.add.tween(this.bulbs[i]).to({y:this.bulbs[i].position.y+30},240,Phaser.Easing.Sinusoidal.InOut,true);
            this.bulbPlugStates[i] = 1;
            bulbTween.onComplete.add(function() { this.setBulbStates(true) }, this);
            bulbTween.onComplete.add(this.enableBulbTouch, this);
            return;
        }
    }
    
    var index = touchBox.index;
    var bulbTween;
    
    if(this.bulbPlugStates[index] == 1) { //if the bulb is down
        bulbTween = this.game.add.tween(this.bulbs[index]).to({y:this.bulbs[index].position.y-30},260,Phaser.Easing.Sinusoidal.Out,true);
        this.bulbPlugStates[index] = 0;
        this.setBulbStates(true);
        
        //audio
        //this.bulbUnplug.play();
    }
    
    else { //if(this.bulbPlugStates[index] == 0) { //if the bulb is up
        bulbTween = this.game.add.tween(this.bulbs[index]).to({y:this.bulbs[index].position.y+30},240,Phaser.Easing.Sinusoidal.InOut,true);
        this.bulbPlugStates[index] = 1;
        bulbTween.onComplete.add(function() { this.setBulbStates(true) }, this);
        
        //audio
        //this.bulbPlug.play();
    }
    
    bulbTween.onComplete.add(this.enableBulbTouch, this);
},
    
CircuitBox.prototype.lowerAnyRaisedBulbs = function() {
    for(var i = 0; i < this.bulbPlugStates.length; i++) {
        if(this.bulbPlugStates[i] == 0) { //if a bulb is up, send it down
            bulbTween = this.game.add.tween(this.bulbs[i]).to({y:this.bulbs[i].position.y+30},240,Phaser.Easing.Sinusoidal.InOut,true);
            this.bulbPlugStates[i] = 1;
            bulbTween.onComplete.add(function() { this.setBulbStates(true) }, this);
            return;
        }
    }
},

CircuitBox.prototype.enableTouch = function() {
    for(var i = 0; i < this.switchTouchBoxes.length; i++) {
        this.switchTouchBoxes[i].inputEnabled = true;
    }
    this.enableSwitchTouch();
    
    for(var j = 0; j < this.bulbTouchBoxes.length; j++) {
        this.bulbTouchBoxes[j].inputEnabled = true;
    }
    this.enableBulbTouch();
},
    
CircuitBox.prototype.disableTouch = function() {
    for(var i = 0; i < this.switchTouchBoxes.length; i++) {
        this.switchTouchBoxes[i].inputEnabled = false;
    }
    this.disableSwitchTouch();
    
    for(var j = 0; j < this.bulbTouchBoxes.length; j++) {
        this.bulbTouchBoxes[j].inputEnabled = false;
    }
    this.disableBulbTouch();
},
    
CircuitBox.prototype.update = function() {
    this.updateBulbs();
};

CircuitBox.prototype.updateBulbs = function() {
    for(var i = 0; i < this.bulbs.length; i++) {
        if(this.bulbs[i].isNeon) { //title screen bulb
            if(this.bulbs[i].isOn) {
                this.bulbs[i].onHeatIndex += CrackTheCircuit.NEON_HEAT_UP_CONSTANT*(1-this.bulbs[i].onHeatIndex);
            } else { //if cooling down
                if(this.bulbs[i].onHeatIndex < 0.001) { continue; }
                this.bulbs[i].onHeatIndex -= CrackTheCircuit.NEON_COOL_DOWN_CONSTANT*this.bulbs[i].onHeatIndex;
            }  this.bulbs[i].onSprite.alpha = this.bulbs[i].onHeatIndex;
        } else { //if not neon, just regular bulb in game
            if(this.bulbs[i].isOn) {
                this.bulbs[i].filamentHeatIndex += CrackTheCircuit.FILAMENT_HEAT_UP_CONSTANT*(1-this.bulbs[i].filamentHeatIndex);
                this.bulbs[i].halfHeatIndex += CrackTheCircuit.HALF_HEAT_UP_CONSTANT*(1-this.bulbs[i].halfHeatIndex);

                var maxHeat = this.bulbs[i].maxHeat; //"brightness"
                if(maxHeat >= 0.25) {
                    this.bulbs[i].onHeatIndex += CrackTheCircuit.ON_HEAT_UP_CONSTANT*(maxHeat-this.bulbs[i].onHeatIndex);
                }
            } else { //if cooling down
                if(this.bulbs[i].filamentHeatIndex < 0.001) { continue; }
                this.bulbs[i].filamentHeatIndex -= CrackTheCircuit.FILAMENT_COOL_DOWN_CONSTANT*this.bulbs[i].filamentHeatIndex;
                this.bulbs[i].halfHeatIndex -= CrackTheCircuit.HALF_COOL_DOWN_CONSTANT*this.bulbs[i].halfHeatIndex;
                this.bulbs[i].onHeatIndex -= CrackTheCircuit.ON_COOL_DOWN_CONSTANT*this.bulbs[i].onHeatIndex;
            }  

            if(this.bulbs[i].children[1]) {
                this.bulbs[i].children[1].alpha = this.bulbs[i].filamentHeatIndex; //filament
                this.bulbs[i].children[2].alpha = this.bulbs[i].halfHeatIndex; //half
                this.bulbs[i].children[3].alpha = this.bulbs[i].onHeatIndex;
            }
            
            //console.log("Bulb "+i+" has brightness "+this.bulbs[i].maxHeat+".");
        }
    }
};

/////// WIN SCREEN AND SHADE /////////
CircuitBox.prototype.createWinShade = function() {
    this.winShade = this.game.add.sprite(0,0);
    var winShadeGraphics = this.game.add.graphics(0,0).beginFill('0x000000').drawRect(-0.5*this.game.width,-0.7*this.game.height,this.game.width,1.4*this.game.height);
    this.winShade.addChild(winShadeGraphics);
    this.add(this.winShade);
    this.winShade.alpha = 0;
    this.winShade.visible = false;
};

CircuitBox.prototype.fadeInWinShadeAfterDelay = function(delay) {
    this.winShade.visible = true;
    var fadeTween = this.game.add.tween(this.winShade).to( { alpha: 0.8 }, 1200, "Sine.easeInOut", true,delay);
};

CircuitBox.prototype.fadeOutWinShade = function() {
    var fadeTween = this.game.add.tween(this.winShade);
    fadeTween.to( { alpha: 0 }, 450, "Linear", true);
    fadeTween.onComplete.add(this.makeWinShadeInvisible, this);
    
    this.fadeOutWinGrid();
};

CircuitBox.prototype.makeWinShadeInvisible = function() {
    this.winShade.visible = false;
};

///////// BOX UNLOCKING /////////

CircuitBox.prototype.unlockBox = function() {
    
    this.disableTouch();
    
    this.open = true;
    this.game.add.tween(this.boxFront).to({y:this.boxFrontStartingY-this.openBoxDy},this.unlockBoxTime,"Sine.easeInOut",true);
    this.game.add.tween(this.keyhole).to({y:this.boxFrontStartingY-this.openBoxDy},this.unlockBoxTime,"Sine.easeInOut",true);
    //this.game.add.tween(this.keyholeGlow).to({y:this.boxFrontStartingY-this.openBoxDy},this.unlockBoxTime,"Sine.easeInOut",true);
    var openTween = this.game.add.tween(this.boxTop.scale).to({y:0.55},this.unlockBoxTime,"Sine.easeInOut",true);
    
    openTween.onComplete.add(this.enableTouch, this);
    
    for(var i = 0; i < this.bulbs.length; i++) {
        this.game.add.tween(this.bulbs[i]).to({y:this.bulbY-0.6*this.openBoxDy},this.unlockBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.bulbs[i].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var i = 0; i < this.bulbPlugStates.length; i++) {
        if(this.bulbPlugStates[i] == 0) { //if a bulb is up, set it to down and update when box opened
            this.bulbPlugStates[i] = 1;
            openTween.onComplete.add(function() { this.setBulbStates(true) }, this);
            break;
        }
    }
    
    for(var i = 0; i < this.sockets.length; i++) {
        this.game.add.tween(this.sockets[i]).to({y:this.bulbY-0.6*this.openBoxDy},this.unlockBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.bulbs[i].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var j = 0; j < this.switches.length; j++) {
        this.game.add.tween(this.switches[j]).to({y:this.switchY-0.6*this.openBoxDy},this.unlockBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.switches[j].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    for(var k = 0; k < this.switchHandles.length; k++) {
        this.game.add.tween(this.switchHandles[k]).to({y:this.switchHandles[k].y-0.6*this.openBoxDy},this.unlockBoxTime,"Sine.easeInOut",true);
        //this.game.add.tween(this.switches[j].scale).to({y:0.95},this.openBoxTime,"Sine.easeInOut",true);
    }
    
    this.boxOpenSound.play();
};

/////////// WIN SCHEMATIC DISPLAY ////////////

CircuitBox.prototype.createWinScreen = function() {
    this.winGrid = this.game.add.sprite(0, -0.23*this.game.height,'winGrid');
    this.winGrid.anchor.setTo(0.5);
    this.add(this.winGrid);
    this.winGrid.alpha = 0;
    this.winGrid.visible = false;
    
    this.winWires = this.game.add.graphics();
    this.add(this.winWires);
    this.winWires.alpha = 0;
    this.winWires.visible = false;
    
    this.winBattery = this.game.add.sprite(0,0,'spriteSheetGame','winBattery');
    this.winBattery.anchor.setTo(0.5,1);
    this.add(this.winBattery);
    this.winBattery.alpha = 0;
    this.winBattery.visible = false;
};

CircuitBox.prototype.fadeInWinGridAfterDelay = function(delay) {
    this.winGrid.visible = true;
    this.game.add.tween(this.winGrid).to({alpha:0.64},700, "Linear", true, delay);
    //this.winGrid.scale.setTo(0);
    //this.game.add.tween(this.winGrid.scale).to({x:1,y:1},this.unlockBoxTime,"Sine.easeInOut",true);
 
    this.drawWinWiresForLevel(this.gameState.curLevelNum);
    
    this.winWires.visible = true;
    this.game.add.tween(this.winWires).to( { alpha: 0.8 }, 500, "Linear", true, 500+delay);
    this.winBattery.visible = true;
    this.game.add.tween(this.winBattery).to( { alpha: 0.55 }, 500, "Linear", true, 500+delay);
    
    this.winSchematicSound.play();
};

CircuitBox.prototype.fadeOutWinGrid = function() {
    //this.game.add.tween(this.winGrid.scale).to({x:1.2,y:1.2},500,"Linear",true);
    this.game.add.tween(this.winWires).to( { alpha: 0 }, 400, "Linear", true);
    this.game.add.tween(this.winBattery).to( { alpha: 0 }, 400, "Linear", true);
    var fadeOut = this.game.add.tween(this.winGrid).to({alpha:0},400,"Linear",true);
    fadeOut.onComplete.add(this.makeWinGridInvisible,this);
};

CircuitBox.prototype.makeWinGridInvisible = function() {
    this.winGrid.visible = false;
    this.winWires.visible = false;
    this.winBattery.visible = false;
};

CircuitBox.prototype.drawWinWiresForLevel = function(levelNum) {
    this.winWires.clear();
    var innerWidth = 5;
    var outerWidth = 9;
    
    for(var i = 0; i < this.winWireCoords.length; i++) {        
        //black outline wires
        this.winWires.lineStyle(outerWidth,CrackTheCircuit.WIN_WIRE_BORDER_COLOR,1);
        this.winWires.moveTo(this.winWireCoords[i][0].x,this.winWireCoords[i][0].y); 
        this.winWires.bezierCurveTo(this.winWireCoords[i][1].x,this.winWireCoords[i][1].y,this.winWireCoords[i][2].x,this.winWireCoords[i][2].y,this.winWireCoords[i][3].x,this.winWireCoords[i][3].y);
        //orange wires
        this.winWires.lineStyle(innerWidth,CrackTheCircuit.WIN_WIRE_COLOR,1);
        this.winWires.moveTo(this.winWireCoords[i][0].x,this.winWireCoords[i][0].y); 
        this.winWires.bezierCurveTo(this.winWireCoords[i][1].x,this.winWireCoords[i][1].y,this.winWireCoords[i][2].x,this.winWireCoords[i][2].y,this.winWireCoords[i][3].x,this.winWireCoords[i][3].y);
    }
    
    //placing circles at junctions
    this.winWires.beginFill(CrackTheCircuit.WIN_WIRE_COLOR);
    
    for(var j = 0; j < this.winWireJunctionCoords.length; j++) {
        this.winWires.drawCircle(this.winWireJunctionCoords[j].x,this.winWireJunctionCoords[j].y,0.9*innerWidth);
    }
};

CircuitBox.prototype.loadAudioForMenu = function() { 
    this.neonHum = this.game.add.audio('neonHum',0.15,true);
    this.switchClose = this.game.add.audio('boxSwitchClose',0.4);
    this.switchOpen = this.game.add.audio('boxSwitchOpen',0.65);
};

CircuitBox.prototype.loadAudioForGame = function() {
    this.bulbBuzz = this.game.add.audio('bulbBuzzTop',0.5,true);
    this.bulbOn = this.game.add.audio('bulbOnTop',0.5);
    this.boxOpenSound = this.game.add.audio('boxOpen',0.7);
    this.boxCloseSound = this.game.add.audio('boxClose',0.7);
    this.winSchematicSound = this.game.add.audio('schematicAppear',0.6);
};

////////// TUTORIAL /////////

CircuitBox.prototype.createTutShade = function() {
    this.tutShade = this.game.add.sprite(0,0);
    var tutShadeGraphics = this.game.add.graphics(0,0).beginFill('0x000000').drawRect(-0.5*this.game.width,-0.7*this.game.height,this.game.width,1.4*this.game.height);
    this.tutShade.addChild(tutShadeGraphics);
    this.add(this.tutShade);
    this.tutShade.alpha = 0;
    this.tutShade.visible = false;
};

CircuitBox.prototype.fadeInTutShadeAfterDelay = function(delay) {
    this.tutShade.visible = true;
    var fadeTween = this.game.add.tween(this.tutShade).to( { alpha: 0.6 }, 500, "Sine.easeInOut", true, delay);
};

CircuitBox.prototype.fadeOutTutShadeAfterDelay = function(delay) {
    var fadeTween = this.game.add.tween(this.tutShade);
    fadeTween.to( { alpha: 0 }, 500, "Linear", true, delay);
    fadeTween.onComplete.add(this.makeTutShadeInvisible, this);
};

CircuitBox.prototype.makeTutShadeInvisible = function() {
    this.tutShade.visible = false;
};

//
//CircuitBox.prototype.playSwitchCloseSound = function() {
//    //audio
//    this.switchClose.play();
//};