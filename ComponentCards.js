ComponentCards = function (game, gameState, width, height) {
    Phaser.Group.call(this, game);
    
    this.gameState = gameState
    
    this.totalWidth = width;
    this.totalHeight = height;
    
    this.cardWidth = 0;
    this.cardHeight = 0;
    this.spaceBetweenCardsY = 0;
    
    this.curDraggingCard = null;
    
    this.totalBatteries = 1;
    this.totalBulbs;
    this.totalSwitches;
    
    this.numBatteryCardsShowing = 0;
    this.numBulbCardsShowing = 0;
    this.numSwitchCardsShowing = 0;
    
    this.cards = null;
    
    this.cardsLeft = 0;
    this.infiniteSupply = false;
    
    // AUDIO
    this.cardPop = null;
    this.cardThrowSound = null;
};

ComponentCards.prototype = Object.create(Phaser.Group.prototype);
ComponentCards.prototype.constructor = ComponentCards;

ComponentCards.prototype.create = function() {
    this.setupAudio();
    this.setSpacing();
    this.cards = new Array();
};

ComponentCards.prototype.setSpacing = function() {

    //Y
    var percentGapY = 0.2; //fraction of card height that is gap between cards
    if(this.totalSwitches == 0) { //levels 1 and 3
        this.cardHeight = this.totalHeight/(2.8+percentGapY);
    }
    else {
        this.cardHeight = this.totalHeight/(3+2*percentGapY);
    }
    this.spaceBetweenCardsY = (1+percentGapY)*this.cardHeight;
};

// INPUT LISTENERS

ComponentCards.prototype.onCardOver = function(sprite, pointer) {
    if(!sprite.isHighlighted) {
        this.highlightCard(sprite);
    }
    
    this.game.canvas.style.cursor = "pointer";
};

ComponentCards.prototype.onCardDown = function(sprite, pointer) {
    var type = sprite.type;
    this.gameState.startDraggingComponent(sprite.type, sprite.angle);
    this.hideCard(sprite);
    
    if(this.infiniteSupply && type != CrackTheCircuit.COMPONENT_BATTERY && this.gameState.gameState == CrackTheCircuit.STATE_FREE_DRAW) { //throw in new card for free draw
        this.throwInNewCardOfType(type);
    }
    
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
};

ComponentCards.prototype.onCardOut = function(sprite, pointer) {
    if(sprite.isHighlighted) {
        this.unhighlightCard(sprite);
    }
    
    if(!this.gameState.blueprint.isDraggingComponent) {
        this.game.canvas.style.cursor = "default";
    }
};

ComponentCards.prototype.enableInput = function() {
  for(var i = 0; i < this.cards.length; i++) {
      if(this.cards[i]) {
          this.cards[i].inputEnabled = true;
      }
  }
};

ComponentCards.prototype.disableInput = function() {
  for(var i = 0; i < this.cards.length; i++) {
      this.cards[i].inputEnabled = false;
  }
};

ComponentCards.prototype.setupAudio = function() {
    this.cardPop = this.game.add.audio('cardPop');
    this.cardThrowSound = this.game.add.audio('cardThrow',0.6);
};

ComponentCards.prototype.createCardOfType = function(componentType) {        
    var spriteString;
    var cardSprite;
    var posY;
    
    switch(componentType) {
        case CrackTheCircuit.COMPONENT_BATTERY:
            spriteString = 'battery';
            posY = -this.spaceBetweenCardsY;
            if(this.totalSwitches == 0) { posY = -0.5*this.spaceBetweenCardsY; }//levels 1 and 3
            break;
        case CrackTheCircuit.COMPONENT_BULB:
            spriteString = 'bulb';
            posY = 0;
            if(this.totalSwitches == 0) { posY = 0.5*this.spaceBetweenCardsY; }//levels 1 and 3
            break;
        case CrackTheCircuit.COMPONENT_SWITCH:
            spriteString = 'switch';
            posY = this.spaceBetweenCardsY;
            break;
    }
    
    cardSprite = this.game.add.sprite(0,posY,'spriteSheetGame','card_'+spriteString);
    cardSprite.anchor.setTo(0.5);
    cardSprite.posY = posY;
    cardSprite.type = componentType;
    cardSprite.spriteString = spriteString;
    if(this.gameState.gameState == CrackTheCircuit.STATE_GAME) {
        cardSprite.scale.setTo(CrackTheCircuit.CARD_SCALE);
    } else if(this.gameState.gameState == CrackTheCircuit.STATE_FREE_DRAW) {
        cardSprite.scale.setTo(CrackTheCircuit.CARD_SCALE_FREE_DRAW); }
    
    cardSprite.visible = false;
    
    this.cards.push(cardSprite);
    this.addAt(cardSprite,0);
    
    cardSprite.events.onInputOver.add(this.onCardOver, this);
    cardSprite.events.onInputDown.add(this.onCardDown, this);
    cardSprite.events.onInputOut.add(this.onCardOut, this);
};

ComponentCards.prototype.showCardAtIndex = function(index) {
    var cardSprite = this.cards[index];
    var offsetX;
    var maxJitter;
    
    switch(cardSprite.type) {
        case CrackTheCircuit.COMPONENT_BATTERY:
            this.numBatteryCardsShowing++;
            offsetX = 0;
            maxJitter = 2;
            break;
        case CrackTheCircuit.COMPONENT_BULB:
            this.numBulbCardsShowing++;
            offsetX = 4;
            maxJitter = 4;
            break;
        case CrackTheCircuit.COMPONENT_SWITCH:
            this.numSwitchCardsShowing++;
            offsetX = 7;
            maxJitter = 4;
            break;
    }
    
    var jitterX = 2*maxJitter*(2*Math.random()-1);
    var jitterY = 2*maxJitter*(2*Math.random()-1);
    cardSprite.position = {x:1.2*this.game.world.width, y:cardSprite.posY + jitterY};
    cardSprite.xf = offsetX+jitterX;
    cardSprite.angle = -12 + Math.random()*24;
    
    cardSprite.visible = true;
    
    this.cardsLeft++;
};

ComponentCards.prototype.hideCard = function(cardSprite) {   
    
    switch(cardSprite.type) {
        case CrackTheCircuit.COMPONENT_BATTERY:
            this.numBatteryCardsShowing--;
            break;
        case CrackTheCircuit.COMPONENT_BULB:
            this.numBulbCardsShowing--;
            break;
        case CrackTheCircuit.COMPONENT_SWITCH:
            this.numSwitchCardsShowing--;
            break;
    }
    
    this.cardsLeft--;
    
    cardSprite.visible = false;
    cardSprite.inputEnabled = false;
};

ComponentCards.prototype.hideCardOfType = function(componentType) {
    for(var i = this.cards.length-1; i >= 0; i--) {
        if(this.cards[i].visible && this.cards[i].type == componentType) {
            this.hideCard(this.cards[i]);
            return;
        }
    }
};

ComponentCards.prototype.throwInNewCardOfType = function(type) {
    var cardIndex = -1;
    for(var i = 0; i < this.cards.length; i++) {
        if(!this.cards[i].visible && this.cards[i].type == type) {
            cardIndex = i;
        }
    } this.showCardAtIndex(cardIndex);
    
    var spinAngle = 600 + 250*Math.random();
    var card = this.cards[cardIndex];
    card.angle = card.angle + spinAngle;
    var throwTween = this.game.add.tween(card).to({x:card.xf},180,Phaser.Easing.Exponential.Out,true);
    var spinTween = this.game.add.tween(card).to({angle:card.angle - spinAngle},220,Phaser.Easing.Exponential.Out,true);
    spinTween.onComplete.add(function() { this.cards[cardIndex].inputEnabled = true; }, this);
    card.visible = true;
    
    this.cardThrowSound.play();
};

//ComponentCards.prototype.enableInputForLastCardThrown = function() {
//    this.cards[this.cards.length-1].inputEnabled = true;
//};

////////////// THROWING IN CARDS //////////////

ComponentCards.prototype.startThrowingInCardsAfterDelay = function(delay, enableInput) {
    this.throwInCardInitially(0,delay, enableInput);
};

ComponentCards.prototype.throwInCardInitially = function(cardNum, delay, enableInput) {
    if(cardNum >= this.cards.length) {
        this.gameState.cardsLoaded();
        return;
    }
    
    this.showCardAtIndex(cardNum);
    
    var spinAngle = 600 + 250*Math.random();
    this.cards[cardNum].angle = this.cards[cardNum].angle + spinAngle;
    
    var throwTween = this.game.add.tween(this.cards[cardNum]).to({x:this.cards[cardNum].xf},180,Phaser.Easing.Exponential.Out,true, delay);
    var spinTween = this.game.add.tween(this.cards[cardNum]).to({angle:this.cards[cardNum].angle - spinAngle},220,Phaser.Easing.Exponential.Out,true, delay);
    throwTween.onComplete.add(function() { this.throwInCardInitially(cardNum+1, 0, enableInput); }, this);
    if(enableInput) { spinTween.onComplete.add(function() { this.cards[cardNum].inputEnabled = true; }, this) };
    
    this.game.time.events.add(Phaser.Timer.SECOND * delay/1000, this.playCardThrowSound, this);
};

ComponentCards.prototype.playCardThrowSound = function() { 
    this.cardThrowSound.play();
};

////////////// COMPONENT BOXES END ////////////////

ComponentCards.prototype.highlightCard = function(cardSprite) {
    cardSprite.isHighlighted = true;
    cardSprite.loadTexture('spriteSheetGame','card_'+cardSprite.spriteString+'_highlighted');
};

ComponentCards.prototype.unhighlightCard = function(cardSprite) {
    cardSprite.isHighlighted = false;
    cardSprite.loadTexture('spriteSheetGame','card_'+cardSprite.spriteString);
};

ComponentCards.prototype.resetCards = function() {
    
    this.cards = [];
    this.cardsLeft = 0;
    
    for(var i = this.numBatteryCardsShowing; i < this.totalBatteries; i++) {
        this.createCardOfType(CrackTheCircuit.COMPONENT_BATTERY);
    }
    
    for(var k = this.numBulbCardsShowing; k < this.totalBulbs; k++) {
        this.createCardOfType(CrackTheCircuit.COMPONENT_BULB);
    }
    
    for(var j = this.numSwitchCardsShowing; j < this.totalSwitches; j++) {
        this.createCardOfType(CrackTheCircuit.COMPONENT_SWITCH);
    }
};

ComponentCards.prototype.resetCardsAfterTrash = function() {
    
    var playThrowSound = false;
    
    if(this.gameState.gameState == CrackTheCircuit.STATE_FREE_DRAW) {
        if(this.numBatteryCardsShowing == 0) {
            this.throwInNewCardOfTypeAfterTrash(CrackTheCircuit.COMPONENT_BATTERY, true);
            playThrowSound = true;
        }
    } else {
        for(var i = this.numBatteryCardsShowing; i < this.totalBatteries; i++) {
            this.throwInNewCardOfTypeAfterTrash(CrackTheCircuit.COMPONENT_BATTERY, true);
            playThrowSound = true;
        }

        for(var k = this.numBulbCardsShowing; k < this.totalBulbs; k++) {
            this.throwInNewCardOfTypeAfterTrash(CrackTheCircuit.COMPONENT_BULB, true);
            playThrowSound = true;
        }

        for(var j = this.numSwitchCardsShowing; j < this.totalSwitches; j++) {
            this.throwInNewCardOfTypeAfterTrash(CrackTheCircuit.COMPONENT_SWITCH,true);
            playThrowSound = true;
        }
    }
    
    if(playThrowSound) { this.cardThrowSound.play(); }
};

ComponentCards.prototype.throwInNewCardOfTypeAfterTrash = function(type) {
    
    var cardIndex = -1;
    
    for(var i = 0; i < this.cards.length; i++) {
        if(!this.cards[i].visible && this.cards[i].type == type) {
            cardIndex = i;
        }
    }
    this.showCardAtIndex(cardIndex);
    
    var spinAngle = 600 + 250*Math.random();
    var card = this.cards[cardIndex];
    card.angle = card.angle + spinAngle;
    var throwTween = this.game.add.tween(card).to({x:card.xf},180,Phaser.Easing.Exponential.Out,true);
    var spinTween = this.game.add.tween(card).to({angle:card.angle - spinAngle},220,Phaser.Easing.Exponential.Out,true);
    spinTween.onComplete.add(function() { this.cards[cardIndex].inputEnabled = true; }, this);
};

ComponentCards.prototype.destroyAllCards = function() {
    for(var i = this.cards.length-1; i >= 0; i--) {
        this.cards[i].inputEnabled = false;
        this.cards[i].destroy();
        this.cards[i] = null;
    }
    this.cards = [];
    
    this.numBatteryCardsShowing = 0;
    this.numBulbCardsShowing = 0;
    this.numSwitchCardsShowing = 0;
    
    this.cardsLeft = 0;
};

ComponentCards.prototype.allCardsUsedUp = function() {
    return (this.cardsLeft == 0);
};

///////// UPDATE END ////////////

///////// RESET FOR NEW LEVEL //////////

ComponentCards.prototype.resetWithComponents = function(numBulbs,numSwitches) {
    this.totalSwitches = numSwitches;
    this.totalBulbs = numBulbs;
    this.infiniteSupply = false;
    
    this.setSpacing();
    
    this.numBatteryCardsShowing = 0;
    this.numBulbCardsShowing = 0;
    this.numSwitchCardsShowing = 0;
    
    this.resetCards();
};

ComponentCards.prototype.resetForFreeDraw = function() {
    this.totalSwitches = 1;
    this.totalBulbs = 1;
    this.infiniteSupply = true;
    
    this.setSpacingForFreeDraw();
    
    this.numBatteryCardsShowing = 0;
    this.numBulbCardsShowing = 0;
    this.numSwitchCardsShowing = 0;
    
    this.resetCards();
};

ComponentCards.prototype.setSpacingForFreeDraw = function() {
    var percentGapY = 0.8; //fraction of card height that is gap between cards
    if(this.totalSwitches == 0) { //levels 1 and 3
        this.cardHeight = this.totalHeight/(2.8+percentGapY); }
    else { this.cardHeight = this.totalHeight/(3+2*percentGapY); }
    this.spaceBetweenCardsY = (1+percentGapY)*this.cardHeight;
    
    if(this.infiniteSupply) { //free draw
        this.spaceBetweenCardsY = 0.22*this.game.world.height;
    }
};