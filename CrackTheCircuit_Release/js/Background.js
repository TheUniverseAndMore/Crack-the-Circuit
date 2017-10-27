Background = function (game, gameData, width, height) {
    Phaser.Group.call(this, game);
    
    this.background = null;
    
    this.needles = null;
    this.maxNeedleVel = 0;
    this.maxNeedleAccel = 0;
};

Background.prototype = Object.create(Phaser.Group.prototype);
Background.prototype.constructor = Background;

Background.prototype.create = function() {

    this.drawScene();
    this.createGaugeNeedles();
    this.createBlinkingLights();
};


Background.prototype.drawScene = function() {
    this.background = this.game.add.sprite(0,0,'background');
};

Background.prototype.createGaugeNeedles = function() {
    this.needles = new Array(2);
    for(var i = 0; i < this.needles.length; i++) {        
        this.needles[i] = this.game.add.sprite(0,0,'spriteSheetMenu','gauge_pointer');
        this.needles[i].anchor.setTo(0.5,1); //centered at the hinge
        this.needles[i].velocity = 0;
        this.needles[i].acceleration = 0;
        
        var posX = 0;
        var posY = 0;
        if(i == 0) { // upper left pointer
            posX = 0.27847*this.background.width;
            posY = 0.00625*this.background.height;
            this.needles[i].angle = 180+30*Math.random();
        }
        
        else { // lower right pointer
            posX = 0.883*this.background.width;
            posY = 0.149*this.background.height;
            this.needles[i].angle = 90*(1+Math.random());
        }
        
        this.needles[i].position = {x:posX,y:posY};
        
        this.game.add.sprite(posX,posY,'spriteSheetMenu','gauge_pivot').anchor.setTo(0.5);
    }
    
    this.maxNeedleVel = 0.3;
    this.maxNeedleAccel = 0.2;
};

Background.prototype.createBlinkingLights = function() {
    
    this.blinkingLights = new Array(5);
    for(var i = 0; i < this.blinkingLights.length; i++) {
        var lightOffSprite = this.game.add.sprite(0,0,'spriteSheetMenu','background_light_off');
        lightOffSprite.anchor.setTo(0.5);
        lightOffSprite.alpha = 0.64;
        
        this.blinkingLights[i] = this.game.add.sprite(0,0,'spriteSheetMenu','background_light_yellow');
        this.blinkingLights[i].anchor.setTo(0.5);
        
        var posX = 0;
        var posY = 0;
        if(i == 0) { // upper left
            posX = 0.1354*this.background.width;
            posY = 0.25*this.background.height;
        }
        
        else if(i == 1) { // lower left
            posX = 0.07*this.background.width;
            posY = 0.55*this.background.height;
        }
        
        else if(i == 2) { // upper right
            posX = 0.798*this.background.width;
            posY = 0.0516*this.background.height;
        }
        
        else if(i == 3) { // far right
            posX = 1*this.background.width;
            posY = 0.15*this.background.height;
        }
        
        else if(i == 4) { // top middle
            posX = 0.533*this.background.width;
            posY = 0.0516*this.background.height;
        }
        
        if(i == 1 || i == 3 || i == 4) { //red lights
            this.blinkingLights[i].loadTexture('spriteSheetMenu','background_light_red');
            this.blinkingLights[i].blinkTime = 1.3; //s to turn on or off
        }
        
        else { //yellow lights
            this.blinkingLights[i].blinkTime = 2.6; //s to turn on or off
        }
        
        lightOffSprite.position = {x:posX,y:posY};
        this.blinkingLights[i].position = {x:posX,y:posY};
    }
};

Background.prototype.updateGaugeNeedles = function() {
    for(var i = 0; i < this.needles.length; i++) {
        var acceleration = -0.95*this.maxNeedleAccel+2*this.maxNeedleAccel*Math.random();
        if(Math.abs(this.needles[i].velocity + acceleration) < this.maxNeedleVel) {
            this.needles[i].velocity += acceleration;
        }
        this.needles[i].angle += this.needles[i].velocity;
    }
};

Background.prototype.updateLights = function() {
    var timeElapsed = this.game.time.totalElapsedSeconds();
    for(var i = 0; i < this.blinkingLights.length; i++) {
        //0.75 is max alpha
        var lightAlpha = 0.75*(1+Math.sin(2*Math.PI*timeElapsed/this.blinkingLights[i].blinkTime))/2;
        this.blinkingLights[i].alpha = lightAlpha;
    }
};

Background.prototype.blinkLight = function(lightSprite) { //EXPENSIVE
    var fadeInTween = this.game.add.tween(lightSprite).to({alpha:0.75},lightSprite.blinkTime,"Sine.easeInOut").to({alpha:0},lightSprite.blinkTime,"Sine.easeInOut").loop();
    fadeInTween.start();
};

Background.prototype.update = function() {  //Automatically called by World.update
    this.updateGaugeNeedles();
    this.updateLights();
};
