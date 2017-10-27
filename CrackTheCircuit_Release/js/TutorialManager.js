TutorialManager = function (game, gameState, numTutsComplete) {
    Phaser.Group.call(this, game);
    
    this.gameState = gameState;
    
    this.tutShowing = -1;
    this.subtutShowing = -1;
    this.numTutsComplete = numTutsComplete;
    //1: Level 1 - Circuit box, draw, erase, cards
    //2: Level 2 - Switch on box, switch tap after placing switch
    //3: Level 3 - Removing bulbs?
    
    this.shade = null;
    //this.pencilIcon = null;
    this.tutText = null;
    this.tutText2 = null; //to fix line spacing issue
    this.infoBox = null;
    this.clickToContinue = null;
};

TutorialManager.prototype = Object.create(Phaser.Group.prototype);
TutorialManager.prototype.constructor = TutorialManager;

TutorialManager.prototype.create = function() {
    this.tutText = this.game.add.text(0,0, '', { font: "Quicksand", fontSize: 44, fill: "#ffffff", align: "center" } );
    this.add(this.tutText);
    
    this.tutText.visible = false;
    this.tutText.alpha = 0;
    
    this.clickToContinue = this.game.add.text(0,0, 'click to continue', { font: "Quicksand", fontSize: 28, fill: "#ffffff", align: "center" } );
    this.add(this.clickToContinue);
    
    this.clickToContinue.visible = false;
    this.clickToContinue.alpha = 0;
    
//    this.pencilIcon = this.game.add.sprite(0,0,'blueprintSprites','pencilIcon');
//    this.pencilIcon.anchor.setTo(0.5,1);
//    this.pencilIcon.alpha = 0;
//    this.pencilIcon.visible = false;
};

TutorialManager.prototype.showTutorialNum = function(tutorialNum) {
    this.tutShowing = tutorialNum;
    this.subtutShowing = 1;
    
    switch(tutorialNum) {
        case 1:
            //circuit box intro
            this.gameState.shadeAllButCircuitBox();
            this.tutText.clearColors();
            this.tutText.setText("The circuit box is locked.");
            this.tutText.anchor.setTo(0.5);
            this.tutText.addColor('#68a899', 3);
            this.tutText.addColor('#ffffff', 15);
            this.tutText.position = {x:this.game.world.centerX,y:0.56*this.game.world.height};
            this.fadeInTextAfterDelay(160);
            
            this.tutText2 = this.game.add.text(this.game.world.centerX,0.77*this.game.world.height, 'To unlock it, you will need\nto show how the light bulb\nis connected inside the box.', { font: "Quicksand", fontSize: 44, fill: "#ffffff", align: "center" } );
            this.tutText2.anchor.setTo(0.5);
            this.tutText2.addColor('#fdef5c', 42);
            this.tutText2.addColor('#ffffff', 53);
            this.fadeInText2AfterDelay(200);
            this.add(this.tutText2);
            this.tutText2.alpha = 0;
            
            this.clickToContinue.anchor.setTo(1);
            this.clickToContinue.position = {x:this.game.world.width - 20, y:this.game.world.height - 8};
            this.fadeInClickToContinueAfterDelay(300, true);
            break;
        case 2:
            //switch on circuit box
            this.gameState.shadeAllButCircuitBox();
            
            if(this.gameState.isTouchScreen) { 
                this.tutText.setText("Tap a switch to close or open it.");
                this.tutText.clearColors();
                this.tutText.addColor('#fd6f4c', 6);
                this.tutText.addColor('#ffffff', 13);
            }
            else { 
                this.tutText.setText("Click on a switch to close or open it.");
                this.tutText.clearColors();
                this.tutText.addColor('#fd6f4c', 11);
                this.tutText.addColor('#ffffff', 18);
            }
            
            this.tutText.anchor.setTo(0.5);
            this.tutText.position = {x:this.game.world.centerX,y:0.58*this.game.world.height};
            this.fadeInTextAfterDelay(160);
            
            this.tutText2 = this.game.add.text(this.game.world.centerX,0.79*this.game.world.height, 'Experiment to see how\nthe switches and bulbs are\nconnected inside the box.', { font: "Quicksand", fontSize: 44, fill: "#ffffff", align: "center" } );
            this.tutText2.clearColors();
//            this.tutText2.addColor('#fd6f4c',25);
//            this.tutText2.addColor('#ffffff',33);
//            this.tutText2.addColor('#fff78e',37);
//            this.tutText2.addColor('#ffffff',42);
            this.tutText2.anchor.setTo(0.5);
            this.fadeInText2AfterDelay(200);
            this.add(this.tutText2);
            this.tutText2.alpha = 0;
            
            this.gameState.circuitBox.waitingForTutSwitch = true;
            break;
        case 3:
            //switch on circuit box
            this.gameState.shadeAllButCircuitBox();
            
            if(this.gameState.isTouchScreen) { 
                this.tutText.setText("Tap a light bulb to unplug it.");
                this.tutText.clearColors();
                this.tutText.addColor('#fff78e', 6);
                this.tutText.addColor('#ffffff', 16);
            }
            else { 
                this.tutText.setText("Click on a light bulb to unplug it.");
                this.tutText.clearColors();
                this.tutText.addColor('#fff78e', 11);
                this.tutText.addColor('#ffffff', 21);
            }
            
            this.tutText.anchor.setTo(0.5);
            this.tutText.position = {x:this.game.world.centerX,y:0.58*this.game.world.height};
            this.fadeInTextAfterDelay(160);
            
            this.gameState.circuitBox.waitingForTutBulb = true;
            break;
        default:
            break;
    }
};

TutorialManager.prototype.closeSubtut = function() {
    switch(this.tutShowing) {
        case 1:
            //circuit box intro
            switch(this.subtutShowing) {
                case 1:
                    //circuit box intro
                    this.gameState.fadeOutTutShadeAfterDelay(150);
                    this.gameState.circuitBox.fadeOutTutShadeAfterDelay(150);
                    this.fadeOutTextAfterDelay(0);
                    this.fadeOutText2AfterDelay(0);
                    this.fadeOutClickToContinueAfterDelay(0);
                    break;
                case 2:
                    //blueprint draw
                    this.fadeOutDrawTextAfterDelay(0, true);
                    break;
                case 3:
                    //blueprint erase
                    this.fadeOutDrawTextAfterDelay(0, true);
                    break;
                case 4:
                    //card drag
                    this.fadeOutDrawTextAfterDelay(0, true);
                    break;
                case 5:
                    this.fadeOutTextAfterDelay(0);
                    //this.fadeOutClickToContinueAfterDelay(0);
                    this.gameState.tutorialFinished();
                    this.gameState.fadeOutTutShadeAfterDelay(0);
                    break;
            }
            break;
        case 2:
            //switch on circuit box
            switch(this.subtutShowing) {
                case 1:
                    //switch on circuit box
                    this.fadeOutDrawTextAfterDelay(400, false);
                    this.fadeOutText2AfterDelay(400);
                    this.gameState.fadeOutTutShadeAfterDelay(500);
                    this.gameState.circuitBox.fadeOutTutShadeAfterDelay(500);
                    break;
                default:
                    break;
            }
            break;
        case 3:
            //bulb plug/unplug
            switch(this.subtutShowing) {
                case 1:
                    this.fadeOutDrawTextAfterDelay(0, true);
                    break;
                case 2:
                    //bulb on circuit box
                    this.fadeOutDrawTextAfterDelay(400, false);
                    this.fadeOutText2AfterDelay(400);
                    this.gameState.fadeOutTutShadeAfterDelay(500);
                    this.gameState.circuitBox.fadeOutTutShadeAfterDelay(500);
                    break;
                default:
                    break;
            }
            break;
    }
};

TutorialManager.prototype.goToNextSubtut = function() {
    
    this.subtutShowing++;
    
    switch(this.tutShowing) {
        case 1:
            //circuit box intro
            switch(this.subtutShowing) {
                case 2:
                    //blueprint draw
                    if(this.gameState.isTouchScreen) { 
                        this.tutText.setText("Swipe on the blueprint\nto draw a wire.");
                        this.tutText.clearColors();
                        this.tutText.addColor('#4fc9e6', 12);
                        this.tutText.addColor('#ffffff', 22);
                    }
                    else { 
                        this.tutText.setText("Click and drag on the blueprint\nto draw a wire.");
                        this.tutText.clearColors();
                        this.tutText.addColor('#4fc9e6', 21);
                        this.tutText.addColor('#ffffff', 31);
                    }
                    this.tutText.anchor.setTo(0.5);
                    this.tutText.position = {x:this.game.world.centerX,y:0.3*this.game.world.height};
                    this.gameState.showBlueprintInTutorial();
                    break;
                case 3:
                    //blueprint erase
                    this.tutText.clearColors();
                    if(this.gameState.isTouchScreen) { 
                        this.tutText.setText("Swipe over a wire to erase it.");
                        this.tutText.addColor('#f79f9b', 21);
                        this.tutText.addColor('#ffffff', 26);
                    }
                    else { 
                        this.tutText.setText("Click and drag over a wire to erase it.");
                        this.tutText.clearColors();
                        this.tutText.addColor('#f79f9b', 30);
                        this.tutText.addColor('#ffffff', 35);
                    }
                    
                    this.tutText.anchor.setTo(0.5);
                    this.tutText.position = {x:this.game.world.centerX,y:0.3*this.game.world.height};
                    this.fadeInTextAfterDelay(0);
                    this.gameState.blueprint.waitingForTutErase = true;
                    break;
                case 4:
                    //cards
                    this.tutText.setText("Drag a card onto the blueprint\nto place a battery or light bulb.");
                    this.tutText.clearColors();
                    this.tutText.addColor('#6dee40', 40);
                    this.tutText.addColor('#ffffff', 48);
                    this.tutText.addColor('#efe856', 52);
                    this.tutText.addColor('#ffffff', 62);
                    this.tutText.anchor.setTo(0.5);
                    this.tutText.position = {x:this.game.world.centerX,y:0.25*this.game.world.height};
                    this.gameState.showCardsInTutorial();
                    break;
                case 5:
                    //solve mystery circuit to win
                    this.tutText.clearColors();
                    this.tutText.addColor('#ffffff',0);
                    this.tutText.setText("Draw the mystery circuit to win!");
                    this.tutText.anchor.setTo(0.5);
                    this.tutText.position = {x:this.game.world.centerX,y:0.29*this.game.world.height};
                    this.fadeInTextAfterDelay(0);
                    this.clickToContinue.anchor.setTo(0.5);
                    this.clickToContinue.position = {x:this.game.world.centerX, y:0.4*this.game.world.height};
                    //this.fadeInClickToContinueAfterDelay(0, false);
                    this.gameState.enableTapToAdvanceTutorial();
                    break;
                default:
                    break;
            }
            break;
        case 2:
            //circuit box intro
            switch(this.subtutShowing) {
                case 2:
                    this.gameState.tutorialFinished();
                    break;
                default:
                    break;
            }
            break;
        case 3:
            //circuit box intro
            switch(this.subtutShowing) {
                case 2:
                    if(this.gameState.isTouchScreen) { 
                        this.tutText.setText("Tap again to plug it back in.");
                        this.tutText.clearColors();
                    }
                    else { 
                        this.tutText.setText("Click again to plug it back in.");
                        this.tutText.clearColors();
                    }

                    this.tutText.anchor.setTo(0.5);
                    this.tutText.position = {x:this.game.world.centerX,y:0.58*this.game.world.height};
                    this.fadeInTextAfterDelay(0);
                    
                    this.tutText2 = this.game.add.text(this.game.world.centerX,0.79*this.game.world.height, "See how it affects\nthe other bulbs\nto solve the circuit.", { font: "Quicksand", fontSize: 44, fill: "#ffffff", align: "center" } );
                    this.tutText2.clearColors();
                    this.tutText2.anchor.setTo(0.5);
                    this.fadeInText2AfterDelay(100);
                    this.add(this.tutText2);
                    this.tutText2.alpha = 0;
                    this.gameState.circuitBox.waitingForTutBulb = true;
                    break;
                case 3:
                    this.gameState.tutorialFinished();
                    break;
                default:
                    break;
            }
            break;
    }
};

/////// TEXT ////////

TutorialManager.prototype.fadeInTextAfterDelay = function(delay) {
    this.tutText.visible = true;
    var fadeTween = this.game.add.tween(this.tutText).to( { alpha: 1 }, 300, "Sine.easeInOut", true, delay);
};

TutorialManager.prototype.fadeOutTextAfterDelay = function(delay) {
    var fadeTween = this.game.add.tween(this.tutText).to( { alpha: 0 }, 200, "Linear", true, delay);
    fadeTween.onComplete.add(this.makeTextInvisible,this);
};

TutorialManager.prototype.makeTextInvisible = function() {
    this.tutText.visible = false;
};

TutorialManager.prototype.fadeInText2AfterDelay = function(delay) {
    var fadeTween = this.game.add.tween(this.tutText2).to( { alpha: 1 }, 300, "Sine.easeInOut", true, delay);
};

TutorialManager.prototype.fadeOutText2AfterDelay = function(delay) {
    var fadeTween = this.game.add.tween(this.tutText2).to( { alpha: 0 }, 200, "Linear", true, delay);
    fadeTween.onComplete.add(function() { this.tutText2.destroy(); }, this );
};

/////// CLICK TO CONTINUE ////////

TutorialManager.prototype.fadeInClickToContinueAfterDelay = function(delay, enableTapAfter) {
    this.clickToContinue.visible = true;
    var fadeTween = this.game.add.tween(this.clickToContinue).to( { alpha: 1 }, 300, "Sine.easeInOut", true, delay);
    if(enableTapAfter) {
        fadeTween.onComplete.add(this.gameState.enableTapToAdvanceTutorial,this.gameState);
    } else { this.gameState.enableTapToAdvanceTutorial(); }
};

TutorialManager.prototype.fadeOutClickToContinueAfterDelay = function(delay) {
    var fadeTween = this.game.add.tween(this.clickToContinue).to( { alpha: 0 }, 200, "Linear", true, delay);
    fadeTween.onComplete.add(this.makeClickToContinueInvisible,this);
};

TutorialManager.prototype.makeClickToContinueInvisible = function() {
    this.clickToContinue.visible = false;
};

///////// BLUEPRINT TUTORIALS /////////

TutorialManager.prototype.showBlueprintDrawTut = function() {
    this.fadeInTextAfterDelay(200);
};

TutorialManager.prototype.fadeInPencilAfterDelay = function(delay) {
    
};

TutorialManager.prototype.fadeOutDrawTextAfterDelay = function(delay, goToNext) {
    var fadeTween = this.game.add.tween(this.tutText).to( { alpha: 0 }, 200, "Linear", true, delay);
    
    if(goToNext) {
        fadeTween.onComplete.add(this.goToNextSubtut,this);
    }
};