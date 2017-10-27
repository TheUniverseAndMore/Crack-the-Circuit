Blueprint = function (game, gameState) {
    Phaser.Group.call(this, game);
    
    this.gameState = gameState;
    
    this.active = false;
    
    this.numNodesX;
    this.numNodesY;

    this.bpWidth;
    this.bpHeight;
    
    this.wireWidth;

    this.bpScale = 1;
    
    this.paper = null;
    this.paperTextureOverlay = null;
    
    //node circles
    this.drawNodes = null;
    this.drawNodeScale = CrackTheCircuit.NODE_SCALE_SMALL;
    this.drawNodeAlpha = CrackTheCircuit.NODE_ALPHA_FADED_OUT;
    
    //1 box padding on top and bottom
    this.nodeToNodeDistance;
    
    //component snapping
    this.snapNodes = null;
    this.snapNodeDiameter = 0;
    
    //GHOST - TRANSPARENT COMPONENT OVER MOUSE DURING DRAGGING
    this.ghost = null;
    
    //2D array of all wires and circuit components
    this.circuitComponents = null;
    this.circuitComponentGroup = null; //to keep everything layered correctly;
    
    //Circuit solving
    this.solveCircuitThisFrame = false; //has anything changed during update? Solve on pre-render (to avoid multiple solvings per frame)
    
    //mouse input
    this.currentMouseX = null;
    this.currentMouseY = null;
    
    this.mouseOverPaper = false;
    
    this.mouseOverDrawNodeCol = -1; //which draw node column is the mouse over
    this.mouseOverDrawNodeRow = -1; //which draw node column is the mouse over
    
    this.drawingFromNodeCol = -1;
    this.drawingFromNodeRow = -1;
    this.isDrawingWire = false;
    
    this.drawingWireGraphics = null;
    
    //element dragging input
    this.isDraggingComponent = false;
    this.currDraggingComponent = null;
    
    this.isCoveringUpComponent = false;
    this.coveringUpComponentType = null;
    
    this.mouseOverSnappedComponentCol = -1; //which snapped-in component column is the mouse over
    this.mouseOverSnappedComponentRow = -1; //which snapped-in component column is the mouse over
    
    this.justUnsnapped = false; //to avoid two sounds playing at the same time when unsnapping components
    
    //switch toggling
    this.mouseDownOnSwitch = false;
    this.mouseDownOnSwitchCol = -1;
    this.mouseDownOnSwitchRow = -1;
    this.switchUnsnapMouseXi = null;
    this.switchUnsnapMouseYi = null;
    
    //short circuits
    this.isBatteryShorted = false;
    this.shortHelpBtnShowing = false;
    
    //in win screen - can only toggle switches
    this.inWinScreen = false;
    
    //draw size scaling
    this.drawSize = CrackTheCircuit.DRAW_SIZE_SMALL;
    
    //free draw
    this.freeDrawScale = 1;
    
    //tutorials
    this.waitingForTutDraw = false;
    this.waitingForTutErase = false;
    this.waitingForTutAdd = false;
    
    //Sound Effects
    this.startDraw = null;
    this.drawBlip = null;
    this.componentBlip = null;
    this.componentClick = null;
    this.componentUnclick = null;
    this.bulbOn = null;
    this.shortSound = null;
    this.switchClose = null;
    this.switchOpen = null;
};

Blueprint.prototype = Object.create(Phaser.Group.prototype);
Blueprint.prototype.constructor = Blueprint;

Blueprint.prototype.create = function() {

    this.loadAudio();
    this.createPaper();
    this.setupWireDrawing();
    this.circuitComponentGroup = this.game.add.group();
    this.add(this.circuitComponentGroup);
};

Blueprint.prototype.createPaper = function() {
    this.paper = this.game.add.sprite(0,0,'blueprint');
    this.paper.anchor.setTo(0.51);
    this.add(this.paper);
    
    this.paper.events.onInputOver.add(this.onPaperOver, this);
    this.paper.events.onInputDown.add(this.onPaperDown, this);
    this.paper.events.onInputOut.add(this.onPaperOut, this);
    this.paper.events.onInputUp.add(this.onPaperUp, this);
};

Blueprint.prototype.setDimensionsForGame = function() {
    if(this.drawSize == CrackTheCircuit.DRAW_SIZE_SMALL) {
        this.numNodesX = 4;
        this.numNodesY = 3;
        this.bpWidth = Math.round(0.533*this.game.world.width);
        this.bpHeight = Math.round(0.54*this.game.world.height);
        this.nodeToNodeDistance = 0.207*this.bpWidth;
        this.wireWidth = CrackTheCircuit.WIRE_WIDTH;
    } else if(this.drawSize == CrackTheCircuit.DRAW_SIZE_LARGE) {
        this.numNodesX = 6;
        this.numNodesY = 4;
        this.bpWidth = Math.round(0.533*this.game.world.width);
        this.bpHeight = Math.round(0.54*this.game.world.height);
        this.nodeToNodeDistance = 0.149*this.bpWidth;
        this.wireWidth = CrackTheCircuit.WIRE_WIDTH;
    }
    
    while((this.bpHeight/this.numNodesY) % 2 != 0) { //if it is an odd number, to prevent pixel misalignment
        this.bpHeight--; 
    }
    
    this.createGhost();
};

Blueprint.prototype.setDimensionsForFreeDraw = function(sizeIndex) {
    this.freeDrawScale = sizeIndex;
    if(this.freeDrawScale == 1) {
        this.numNodesX = 4;
        this.numNodesY = 3;
        this.wireWidth = CrackTheCircuit.WIRE_WIDTH_FD_1;
    } else if(this.freeDrawScale == 2) {
        this.numNodesX = 5;
        this.numNodesY = 4;
        this.wireWidth = CrackTheCircuit.WIRE_WIDTH_FD_2;
    } else if(this.freeDrawScale == 3) {
        this.numNodesX = 7;
        this.numNodesY = 5;
        this.wireWidth = CrackTheCircuit.WIRE_WIDTH_FD_3;
    }
    this.bpWidth = Math.round(this.paper.width);
    this.bpHeight = Math.round(this.paper.height);
    
    if(this.freeDrawScale == 1) {
        this.nodeToNodeDistance = this.bpWidth/4.4;
    } else if(this.freeDrawScale == 2) {
        this.nodeToNodeDistance = this.bpWidth/5.8;
    } else if(this.freeDrawScale == 3) {
        this.nodeToNodeDistance = this.bpWidth/7.7;
    }
    
    while((this.bpHeight/this.numNodesY) % 2 != 0) { //if it is an odd number, to prevent pixel misalignment
        this.bpHeight--;
    }
    
    this.createGhost();
};

Blueprint.prototype.constructForGame = function() {
    this.paper.loadTexture('blueprint');
    this.setDimensionsForGame();
    this.createDrawNodes();
    this.createSnapNodes();
    this.createCircuitComponents();
    
    this.active = true;
    this.solveCircuitInState(-1); 
};

//// INPUT CLASS

Blueprint.prototype.enableTouch = function() {
    this.paper.inputEnabled = true;
    this.game.input.addMoveCallback(this.cursorMoved, this);
    //for(drawNodes) { this.drawNode.inputEnabled = true; } etc
};

Blueprint.prototype.disableTouch = function() {
    this.cancelCurrentTouch();
    this.paper.inputEnabled = false;
    this.game.input.deleteMoveCallback(this.cursorMoved, this);
    //for(drawNodes) { this.drawNode.inputEnabled = false; } etc
};

Blueprint.prototype.cancelCurrentTouch = function() {
    if(this.isDrawingWire) { this.stopDrawingWire(); }
    this.mouseOverPaper = false;
    this.mouseOverDrawNodeCol = -1;
    this.mouseOverDrawNodeRow = -1;
    this.mouseOverSnappedComponentCol = -1;
    this.mouseOverSnappedComponentRow = -1;   
    this.mouseDownOnSwitch = false;
    
    this.fadeDrawNodesToAlpha(CrackTheCircuit.NODE_ALPHA_FADED_OUT);
    this.scaleAllDrawNodesTo(CrackTheCircuit.NODE_SCALE_SMALL);
};

Blueprint.prototype.onPaperOver = function() {
    if(this.inWinScreen) {return;}
    this.fadeDrawNodesToAlpha(1);
    this.mouseOverPaper = true;
    this.game.canvas.style.cursor = "pointer";
};

Blueprint.prototype.onPaperDown = function() {
    
    this.game.input.touch.preventDefault = true; //to prevent window scrolling
    
    if(this.inWinScreen) { //only allow toggling existing switches in win screen
        this.currentMouseX = this.game.input.activePointer.x;
        this.currentMouseY = this.game.input.activePointer.y;
        this.checkToToggleSwitchesOnly();
        return;
    }
    
    this.fadeDrawNodesToAlpha(1);
    this.mouseOverPaper = true;
    
    if(this.gameState.isTouchScreen) { // if touch screen
        this.updateMouseOverDrawNodes();
        this.updateMouseOverSnapNodes();
    }
    
    if(this.mouseOverSnappedComponentCol != -1 && this.mouseOverSnappedComponentRow != -1) {
        this.unsnapComponent(false);
    }
    
    else if(this.mouseOverDrawNodeCol != -1 && this.mouseOverDrawNodeRow != -1) {
        this.startDrawingWire(true);
    }
};

Blueprint.prototype.onPaperOut = function() {
    if(this.inWinScreen) {return;}
    
    if(!this.isDraggingComponent) {
        this.fadeDrawNodesToAlpha(CrackTheCircuit.NODE_ALPHA_FADED_OUT);
    }
    this.mouseOverPaper = false;
    if(!this.isDraggingComponent) {
        this.game.canvas.style.cursor = "default";
    }
};

Blueprint.prototype.onPaperUp = function() {
    if(this.inWinScreen) {return;}
    this.fadeDrawNodesToAlpha(CrackTheCircuit.NODE_ALPHA_FADED_OUT);
    if(this.gameState.isTouchScreen) { // if touch screen
        if(this.isDrawingWire) {
            this.stopDrawingWire();
        }
        
        this.mouseOverPaper = false;
        
        this.scaleAllDrawNodesTo(CrackTheCircuit.NODE_SCALE_SMALL);

        this.mouseOverDrawNodeCol = -1;
        this.mouseOverDrawNodeRow = -1;

       if(this.mouseDownOnSwitch) {
           this.highlightComponentAt(this.mouseOverSnappedComponentCol,this.mouseOverSnappedComponentRow,false);
            this.mouseDownOnSwitch = false;
       }
       
       this.mouseOverSnappedComponentCol = -1;
       this.mouseOverSnappedComponentRow = -1;

       return;
    }

    //if not touch screen

    else if(this.isDrawingWire) {
        this.stopDrawingWire();

        if(!this.mouseOverPaper) { this.fadeDrawNodesToAlpha(CrackTheCircuit.NODE_ALPHA_FADED_OUT); }
    }

    this.mouseDownOnSwitch = false;
};

Blueprint.prototype.cursorMoved = function() {
    if(this.inWinScreen) {return;}
    this.currentMouseX = this.game.input.activePointer.x;
    this.currentMouseY = this.game.input.activePointer.y;
    this.updateMouseOverDrawNodes();
    
    if(this.gameState.isTouchScreen) { //if touch screen, don't update mouse position unless drawing/dragging
        if(this.isDraggingComponent) {
            this.updateMouseOverSnapNodes();
            this.updateDraggingComponent();
        }

        if(this.isDrawingWire && this.mouseOverPaper) { this.updateDrawingWire(); }

        if(this.mouseDownOnSwitch) { 
            this.updateMouseOverSnapNodes();
            this.checkToUnsnapSwitch(); }

        if(this.solveCircuitThisFrame) {
            this.solveCircuitInState(-1); //current state
            this.solveCircuitThisFrame = false;
        }
    }
    
    else { //if the user is using a mouse
        if(this.isDraggingComponent) { this.updateDraggingComponent(); }
        else {
            if(!this.isDrawingWire) { this.updateMouseOverSnapNodes(); }
        }

        if(this.isDrawingWire && this.mouseOverPaper) { this.updateDrawingWire(); }

        if(this.mouseDownOnSwitch) { this.checkToUnsnapSwitch(); }

        if(this.solveCircuitThisFrame) {
            this.solveCircuitInState(-1); //current state
            this.solveCircuitThisFrame = false;
        }
    }
};


///////////////// DRAW NODES START ////////////////

Blueprint.prototype.createDrawNodes = function() {
    this.drawNodeScale = (this.nodeToNodeDistance/this.game.cache.getImage('drawNode').width);

    var numElementsX = (2*this.numNodesX-1);
    var numElementsY = (2*this.numNodesY-1);
    this.drawNodes = new Array(numElementsX);

    for(var i = 0; i < numElementsX; i++) {
        this.drawNodes[i] = new Array(numElementsY);
    }

    for(var i = 0; i < numElementsX; i++) {
        for(var j = 0; j < numElementsY; j++) {
            if(i%2 == 0 && j%2 == 0) {
                this.createDrawNode(i,j);
            }
        }
    }
};

Blueprint.prototype.createDrawNode = function(columnNum, rowNum) {
    var drawNodeSprite = this.game.add.sprite(- 0.5*(this.numNodesX-1)*this.nodeToNodeDistance + 0.5*columnNum*this.nodeToNodeDistance, - 0.5*(this.numNodesY-1)*this.nodeToNodeDistance + 0.5*rowNum*this.nodeToNodeDistance,'drawNode');

    drawNodeSprite.anchor.setTo(0.5);
    drawNodeSprite.scale.setTo(this.drawNodeScale);
    
    this.add(drawNodeSprite);

    drawNodeSprite.canBeDrawnTo = false;
    drawNodeSprite.heatingUp = false;
    drawNodeSprite.heatIndex = 0;

    drawNodeSprite.hasWireN = false;
    drawNodeSprite.hasWireS = false;
    drawNodeSprite.hasWireE = false;
    drawNodeSprite.hasWireW = false;

    //components other than wires
    drawNodeSprite.hasComponentN = false;
    drawNodeSprite.hasComponentS = false;
    drawNodeSprite.hasComponentE = false;
    drawNodeSprite.hasComponentW = false;

    drawNodeSprite.nodeScale = CrackTheCircuit.NODE_SCALE_SMALL;

    drawNodeSprite.alpha = CrackTheCircuit.NODE_ALPHA_FADED_OUT;

    this.drawNodes[columnNum][rowNum] = drawNodeSprite;
};

Blueprint.prototype.fadeDrawNodesToAlpha = function(alpha) {
        
    if(this.drawNodeAlpha == alpha) return;
    
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.drawNodes[i][j]) continue;

            if(!this.isAttachedToAnything(this.drawNodes[i][j]))
            {
                this.game.add.tween(this.drawNodes[i][j]).to({ alpha: alpha }, 150, "Sine.easeIn", true);
            }
        }
    }
    
    this.drawNodeAlpha = alpha;
};

Blueprint.prototype.eraseDrawNodes = function() {
    for(var i = 2*this.numNodesX-2; i >= 0; i--) {
        for(var j = 2*this.numNodesY-2; j >= 0; j--) {
            if(i%2 == 0 && j%2 == 0) {
                this.drawNodes[i][j].destroy();
                this.drawNodes[i][j] = null;
            }
        } this.drawNodes[i] = null;
    } this.drawNodes = null;
};

///////////////// DRAW NODES END ////////////////

///////////////// SNAP NODES START ///////////////

Blueprint.prototype.createSnapNodes = function() {
        
    this.snapNodeDiameter = 0.35*this.nodeToNodeDistance*this.bpScale;

    this.snapNodes = new Array(2*this.numNodesX-1);

    for(var a = 0; a < 2*this.numNodesX-1; a++) {
        this.snapNodes[a] = new Array(2*this.numNodesY-1);
    }

    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {
            if(i%2 != j%2) {
                this.createSnapNode(i,j);
            }
        }
    }
};
    
Blueprint.prototype.createSnapNode = function(columnNum,rowNum) {
        
    var snapNodeX = 0;
    var snapNodeY = 0;

    snapNodeX = -0.5*(this.numNodesX-1)*this.nodeToNodeDistance*this.bpScale + 0.5*columnNum*this.nodeToNodeDistance*this.bpScale;
    snapNodeY = -0.5*(this.numNodesY-1)*this.nodeToNodeDistance*this.bpScale + 0.5*rowNum*this.nodeToNodeDistance*this.bpScale;

    this.snapNodes[columnNum][rowNum] = {x:snapNodeX, y:snapNodeY}; //only allow snapping to the ones between two nodes
};

Blueprint.prototype.eraseSnapNodes = function() {
    for(var i = 2*this.numNodesX-2; i >= 0; i--) {
        for(var j = 2*this.numNodesY-2; j >= 0; j--) {
            if(i%2 != j%2) {
                this.snapNodes[i][j] = null;
            }
        }
        this.snapNodes[i] = null;
    } this.snapNodes = null;
};

//////////////// SNAP NODES END ////////////////

//////////////// CIRCUIT COMPONENTS ///////////

Blueprint.prototype.createCircuitComponents = function() {
        
    this.circuitComponents = new Array(2*this.numNodesX-1);

    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        this.circuitComponents[i] = new Array(2*this.numNodesY-1);
    }    
};

Blueprint.prototype.clearCircuitComponents = function() {
    for(var i = 2*this.numNodesX-2; i >= 0; i--) {
        for(var j = 2*this.numNodesY-2; j >= 0; j--) {
            if(this.circuitComponents[i][j]) {
                this.circuitComponents[i][j].destroy();
                this.circuitComponents[i][j] = null;
            }
        } this.circuitComponents[i] = null;
    } this.circuitComponents = null;
};

Blueprint.prototype.setupWireDrawing = function() {
    this.drawingWireGraphics = this.game.add.graphics(0,0);
    this.drawingWireGraphics.lineStyle(this.wireWidth, 0xffffff);
    this.add(this.drawingWireGraphics);
};


Blueprint.prototype.update = function() {
    if(this.active) {
        this.updateShortColors();
    }
};

Blueprint.prototype.updateShortColors = function() {
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {
            
            if(i%2 == 0 && j%2 == 0) { //draw node
                if(!this.drawNodes[i][j]) { //if nonexistent or the element is a draw node
                    continue;
                }

                if(this.drawNodes[i][j].heatingUp) {
                    this.drawNodes[i][j].heatIndex += CrackTheCircuit.WIRE_HEAT_UP_CONSTANT*(1-this.drawNodes[i][j].heatIndex);
                }

                else { //if cooling down
                    if(this.drawNodes[i][j].heatIndex < 0.001) { continue; }
                    this.drawNodes[i][j].heatIndex -= CrackTheCircuit.WIRE_COOL_DOWN_CONSTANT*this.drawNodes[i][j].heatIndex;
                }

                var g = Math.round(14 + (255-14) * (1-this.drawNodes[i][j].heatIndex));
                var b = Math.round(14 + (255-14) * (1-this.drawNodes[i][j].heatIndex));

                this.drawNodes[i][j].tint = (255 * 0x010000) + (g * 0x000100) + (b * 0x000001);
                
                continue;
            }
            
            if(!this.circuitComponents[i][j]) { //if nonexistent or the element is a draw node
                continue;
            }
            
            if(this.circuitComponents[i][j].heatingUp) {
                this.circuitComponents[i][j].heatIndex += CrackTheCircuit.WIRE_HEAT_UP_CONSTANT*(1-this.circuitComponents[i][j].heatIndex);
            }
            
            else { //if cooling down
                this.circuitComponents[i][j].heatIndex -= CrackTheCircuit.WIRE_COOL_DOWN_CONSTANT*this.circuitComponents[i][j].heatIndex;
            }
            
            var g = Math.round(14 + (255-14) * (1-this.circuitComponents[i][j].heatIndex));
            var b = Math.round(14 + (255-14) * (1-this.circuitComponents[i][j].heatIndex));
            
            this.circuitComponents[i][j].tint = (255 * 0x010000) + (g * 0x000100) + (b * 0x000001);
        }
    }
};

///////// UPDATE END ////////////

Blueprint.prototype.render = function() {
  //  Let's apply a basic scanline effect over the top of the game
//    this.gameState.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
//
//    for (var y = 0; y < this.bpHeight; y += 4)
//    {
//        this.gameState.context.fillRect(0, y, this.bpWidth, 1);
//    }
};

//////////// DRAW NODE FUNCTIONALITY START //////////////

Blueprint.prototype.updateMouseOverDrawNodes = function() {
    var mouseOverAny = false;

    if(this.mouseOverSnappedComponentCol == -1 && this.mouseOverSnappedComponentRow == -1) {
        for(var i = 0; i < 2*this.numNodesX-1; i++) {
            for(var j = 0; j < 2*this.numNodesY-1; j++) {

                if(!this.drawNodes[i][j]) continue;

                var drawNodePosGlobal = this.drawNodePosInWorldSpace(i,j);

                var distanceFromMouseToDrawNode = Math.sqrt(Math.pow(this.currentMouseX - drawNodePosGlobal.x,2)+(Math.pow(this.currentMouseY - drawNodePosGlobal.y,2)));

                //if the mouse is within a box of the draw node
                if((Math.abs(this.currentMouseX - drawNodePosGlobal.x)<0.5*this.nodeToNodeDistance*this.bpScale && Math.abs(this.currentMouseY - drawNodePosGlobal.y)<0.5*this.nodeToNodeDistance*this.bpScale)) {

                    this.mouseOverDrawNodeCol = i;
                    this.mouseOverDrawNodeRow = j;
                    mouseOverAny = true;

                    if(this.isDrawingWire && this.drawNodes[i][j].canBeDrawnTo) {

                        this.snapToDrawNodeAt(i,j);
                    }
                }
            }
        }
    }

    if(!mouseOverAny) {
        this.mouseOverDrawNodeCol = -1;
        this.mouseOverDrawNodeRow = -1;
    }

    //scale change for mouse hover
    if(!this.isDrawingWire && !this.isDraggingComponent) {

        for(var i = 0; i < 2*this.numNodesX-1; i++) {
            for(var j = 0; j < 2*this.numNodesY-1; j++) {

                if(!this.drawNodes[i][j]) continue;

                if(i == this.mouseOverDrawNodeCol && j == this.mouseOverDrawNodeRow && !this.gameState.isTouchScreen) {
                    this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_MEDIUM);
                }

                else {
                    this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_SMALL);
                }
            }
        }
    }
};

Blueprint.prototype.scaleAllDrawNodesTo = function(nodeScale) {
    
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.drawNodes[i][j]) continue;
            
            this.scaleDrawNodeTo(i,j,nodeScale);
        }
    }
};

Blueprint.prototype.scaleDrawNodeTo = function(nodeCol, nodeRow, nodeScale) {
    if(nodeScale != this.drawNodes[nodeCol][nodeRow].nodeScale) {
        this.game.add.tween(this.drawNodes[nodeCol][nodeRow].scale).to({ x: nodeScale*this.drawNodeScale, y:nodeScale*this.drawNodeScale}, 80, "Sine.easeOut", true);
        this.drawNodes[nodeCol][nodeRow].nodeScale = nodeScale;
    }
};

Blueprint.prototype.drawNodePosInWorldSpace = function(colNum,rowNum) {
    var worldPosX = this.drawNodes[colNum][rowNum].position.x*this.bpScale + this.position.x;
    var worldPosY = this.drawNodes[colNum][rowNum].position.y*this.bpScale + this.position.y;
    return({x:worldPosX,y:worldPosY});
};

//////////// DRAW NODE FUNCTIONALITY END //////////////


//////////// SNAP NODE FUNCTIONALITY START ////////////

Blueprint.prototype.updateMouseOverSnapNodes = function() {
    var mouseOverAny = false;

    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.circuitComponents[i][j] || this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_WIRE) { //if there is nothing there, or a wire there
                continue;
            }

            var distanceFromMouseToSnapNode = Math.sqrt(Math.pow(this.currentMouseX - (this.position.x + this.snapNodes[i][j].x),2)+Math.pow(this.currentMouseY - (this.position.y + this.snapNodes[i][j].y),2));

            
            //if the mouse is within the snap node radius
            if(distanceFromMouseToSnapNode <= this.snapNodeDiameter) {

                this.mouseOverSnappedComponentCol = i;
                this.mouseOverSnappedComponentRow = j;

                mouseOverAny = true;
            }
        }
    }

    if(!mouseOverAny) {
        this.mouseOverSnappedComponentCol = -1;
        this.mouseOverSnappedComponentRow = -1;
    }

    //scale change for mouse hover
    if(!this.isDrawingWire) {

        for(var i = 0; i < 2*this.numNodesX-1; i++) {
            for(var j = 0; j < 2*this.numNodesY-1; j++) {

                if(!this.circuitComponents[i][j] || this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_WIRE) { //if there is nothing there, or a wire there
                    continue;
                }

                if(i == this.mouseOverSnappedComponentCol && j == this.mouseOverSnappedComponentRow) {
                    if(!this.circuitComponents[i][j].isHighlighted) { //temporary for testing
                        this.highlightComponentAt(i,j, true);
                    }
                }

                else {
                    if(this.circuitComponents[i][j].isHighlighted) { //temporary for testing
                        this.highlightComponentAt(i,j, false);
                    }
                }
            }
        }
    }
};

Blueprint.prototype.highlightComponentAt = function(colNum,rowNum, highlight) {
    
    if (colNum < 0 || rowNum < 0) return;
    
    this.circuitComponents[colNum][rowNum].isHighlighted = highlight;
    var textureString = '';
    switch(this.circuitComponents[colNum][rowNum].componentType) {
        case CrackTheCircuit.COMPONENT_BATTERY:
            textureString = 'battery';
            if(this.circuitComponents[colNum][rowNum].angle != 0){
                textureString = textureString + 'Vert';
            }
            break;
        case CrackTheCircuit.COMPONENT_SWITCH:
            textureString = 'switch';
            if(this.circuitComponents[colNum][rowNum].closed){
                textureString = textureString + 'Closed'; }
            break;
        case CrackTheCircuit.COMPONENT_BULB:
            textureString = 'bulb';
            if(highlight) {
                this.circuitComponents[colNum][rowNum].loadTexture('spriteSheetGame','bulbHighlighted');
                this.circuitComponents[colNum][rowNum].glowSprite.loadTexture('spriteSheetGame','bulbLitHighlighted');
            } else {
                this.circuitComponents[colNum][rowNum].loadTexture('spriteSheetGame','bulb');
                this.circuitComponents[colNum][rowNum].glowSprite.loadTexture('spriteSheetGame','bulbLit');
            }
            return;
    }
    
    if(highlight) { textureString = textureString + 'Highlighted'; }

    this.circuitComponents[colNum][rowNum].loadTexture('spriteSheetGame',textureString);
};

//////////// SNAP NODE FUNCTIONALITY END /////////////

///////////// WIRE DRAWING START ////////////////////////

Blueprint.prototype.startDrawingWire = function(firstTimeForClick) { 
    //is it the first time in this click? (self-reference)
    this.isDrawingWire = true;

    this.drawingFromNodeCol = this.mouseOverDrawNodeCol;
    this.drawingFromNodeRow = this.mouseOverDrawNodeRow;

    //highlight the draw nodes that are directly adjacent to the currently selected one
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.drawNodes[i][j]) continue;

            //the currently active draw node
            if(i == this.drawingFromNodeCol && j == this.drawingFromNodeRow) {
                this.drawNodes[i][j].canBeDrawnTo = false;
                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_LARGE);
            }

            //if the node is adjacent to the current draw node horizontally or vertically
            else if((i == this.drawingFromNodeCol && Math.abs(j - this.drawingFromNodeRow) == 2) || (j == this.drawingFromNodeRow && Math.abs(i - this.drawingFromNodeCol) == 2)) {

                this.drawNodes[i][j].canBeDrawnTo = true;

                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_SMALL);
            }

            //a draw node not adjacent to the current one
            else {
                this.drawNodes[i][j].canBeDrawnTo = false;
                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_SMALL);
            }
        }
    }
    
    if(firstTimeForClick) {
        this.startDraw.play();
    }
};

Blueprint.prototype.updateDrawingWire = function() {
        
    this.drawingWireGraphics.clear();
    this.drawingWireGraphics.lineStyle(this.wireWidth, 0xffffff);

    var wireFromX = this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].x;
    var wireFromY = this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].y;

    var dx = this.currentMouseX-this.drawNodePosInWorldSpace(this.drawingFromNodeCol,this.drawingFromNodeRow).x;
    var dy = this.currentMouseY-this.drawNodePosInWorldSpace(this.drawingFromNodeCol,this.drawingFromNodeRow).y;

    var radius = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));

    var theta = Math.atan2(dy,dx);  
    if(theta < 0) {
        theta = 2*Math.PI+theta;}

    //if the mouse has skipped a draw box, and is on a box labeled 'canDrawTo = false'
    while(radius>this.nodeToNodeDistance*this.bpScale*Math.SQRT2/2) {

        if(theta <= Math.PI/4 || theta >= 1.75*Math.PI){ //line to mouse intersects box to the right of currently selected draw node

            if(this.drawingFromNodeCol == 2*(this.numNodesX-1)) return; //if it is on the rightmost column

            this.mouseOverDrawNodeCol = this.drawingFromNodeCol+2; //to skip over the placeholder array item
            this.mouseOverDrawNodeRow = this.drawingFromNodeRow;
        }

        else if(theta >= 0.75*Math.PI && theta <= 1.25*Math.PI){ //line to mouse intersects box to the left of currently selected draw node

            if(this.drawingFromNodeCol == 0) return;

            this.mouseOverDrawNodeCol = this.drawingFromNodeCol-2; //to skip over the placeholder array item
            this.mouseOverDrawNodeRow = this.drawingFromNodeRow;
        }

        else if(theta >= Math.PI/4 && theta <= 0.75*Math.PI){ 
            //line to mouse intersects box below currently selected draw node

            if(this.drawingFromNodeRow == 2*(this.numNodesY-1)) return;

            this.mouseOverDrawNodeCol = this.drawingFromNodeCol;
            this.mouseOverDrawNodeRow = this.drawingFromNodeRow+2; 
            //to skip over the placeholder array item
        }

        else { //line to mouse intersects box above currently selected draw node

            if(this.drawingFromNodeRow == 0) return;

            this.mouseOverDrawNodeCol = this.drawingFromNodeCol;
            this.mouseOverDrawNodeRow = this.drawingFromNodeRow-2; 
            //to skip over the placeholder array item
        }

        this.snapToDrawNodeAt(this.mouseOverDrawNodeCol, this.mouseOverDrawNodeRow);

        wireFromX = this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].x;
        wireFromY = this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].y;

        dx = this.currentMouseX-this.drawNodePosInWorldSpace(this.drawingFromNodeCol,this.drawingFromNodeRow).x;
        dy = this.currentMouseY-this.drawNodePosInWorldSpace(this.drawingFromNodeCol,this.drawingFromNodeRow).y;

        radius = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));

        theta = Math.atan2(dy,dx);  
         if(theta < 0) {
             theta = 2*Math.PI+theta; }
    }

    var wireLength = (radius/this.bpScale)*((Math.cos(4*theta)+1)/2);


    var lineToX;
    var lineToY;

    if(theta <= Math.PI/4 || theta >= 1.75*Math.PI){ //wire to the right

        if(this.drawingFromNodeCol == 2*(this.numNodesX-1) || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasComponentE || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireE) return; //if it is on the rightmost column or has a non-wire component to the East

//        if(this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireE) {
//            //this.drawingWireGraphics.lineStyle(CrackTheCircuit.WIRE_WIDTH_BLUE, CrackTheCircuit.BLUEPRINT_COLOR);
//            wireFromX = this.drawNodes[this.drawingFromNodeCol+2][this.drawingFromNodeRow].x;
//            wireFromY = this.drawNodes[this.drawingFromNodeCol+2][this.drawingFromNodeRow].y;
//            lineToX = wireFromX-(this.nodeToNodeDistance - wireLength);
//            lineToY = wireFromY;
//        }

//        else {
            lineToX = wireFromX+wireLength;
            lineToY = wireFromY;
       // }        
    }

    else if(theta >= 0.75*Math.PI && theta <= 1.25*Math.PI){ //wire left

        if(this.drawingFromNodeCol == 0 || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasComponentW || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireW) return; //if it is on the leftmost column or has a non-wire component to the West

//        if(this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireW) {
//            //this.drawingWireGraphics.lineStyle(CrackTheCircuit.WIRE_WIDTH_BLUE, CrackTheCircuit.BLUEPRINT_COLOR);
//        }
//
//        else {
//            //this.drawingWireGraphics.lineStyle(CrackTheCircuit.WIRE_WIDTH, 0xffffff);
//        }

        wireLength = (radius/this.bpScale)*((Math.cos(4*theta)+1)/2);
        lineToX = wireFromX-wireLength;
        lineToY = wireFromY;
    }

    else if(theta >= Math.PI/4 && theta <= 0.75*Math.PI){ //wire down

        if(this.drawingFromNodeRow == 2*(this.numNodesY-1) || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasComponentS || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireS) return; //if it is in the bottom row or has a non-wire component to the South

//        if(this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireS) {
//            //this.drawingWireGraphics.lineStyle(CrackTheCircuit.WIRE_WIDTH_BLUE, CrackTheCircuit.BLUEPRINT_COLOR);
//        }
//
//        else {
//            //this.drawingWireGraphics.lineStyle(CrackTheCircuit.WIRE_WIDTH, 0xffffff);
//        }

        theta+=Math.PI/4;
        wireLength = (radius/this.bpScale)*((-Math.cos(4*theta)+1)/2);
        lineToX = wireFromX;
        lineToY = wireFromY+wireLength;
    }

    else { // wire up

        if(this.drawingFromNodeRow == 0 || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasComponentN || this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireN) return; //if it is in the top row or has a non-wire component to the North

//        if(this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireN) {
//            //this.drawingWireGraphics.lineStyle(CrackTheCircuit.WIRE_WIDTH_BLUE, CrackTheCircuit.BLUEPRINT_COLOR);
//        }
//
//        else {
//            //this.drawingWireGraphics.lineStyle(CrackTheCircuit.WIRE_WIDTH, 0xffffff);
//        }

        theta+=Math.PI/4;
        wireLength = (radius/this.bpScale)*((-Math.cos(4*theta)+1)/2);
        lineToX = wireFromX;
        lineToY = wireFromY-wireLength; 
    }

    this.drawingWireGraphics.moveTo(wireFromX,wireFromY);
    this.drawingWireGraphics.lineTo(lineToX,lineToY);
};

Blueprint.prototype.stopDrawingWire = function() {
    this.isDrawingWire = false;

    this.drawingWireGraphics.clear();

    this.drawingFromNodeCol = -1;
    this.drawingFromNodeRow = -1;

    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.drawNodes[i][j]) continue;

            this.drawNodes[i][j].canBeDrawnTo = false;

            if(i==this.mouseOverDrawNodeCol && j==this.mouseOverDrawNodeRow)
            {
                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_MEDIUM);
            }

            else {
                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_SMALL);
            }
        }
    }
};


Blueprint.prototype.drawWireAt = function(colNum,rowNum) { 

    var wireSprite = this.game.add.sprite(- 0.5*(this.numNodesX-1)*this.nodeToNodeDistance + 0.5*colNum*this.nodeToNodeDistance,- 0.5*(this.numNodesY-1)*this.nodeToNodeDistance + 0.5*rowNum*this.nodeToNodeDistance,'spriteSheetGame', 'wire');
    wireSprite.anchor.setTo(0.5);
    wireSprite.scale.setTo(this.nodeToNodeDistance/wireSprite.width);
    wireSprite.componentType = CrackTheCircuit.COMPONENT_WIRE;

    var angle = this.angleForComponent(colNum,rowNum,CrackTheCircuit.COMPONENT_WIRE);  
    wireSprite.angle = angle;  

    this.circuitComponents[colNum][rowNum] = wireSprite;
    this.circuitComponentGroup.add(wireSprite);
    
    wireSprite.heatIndex = 0; //for short circuit color animating

    //set hasWireN/S/E/W for drawNodes
    if(this.drawingFromNodeCol == this.mouseOverDrawNodeCol) { // drawing vertically

        if(this.drawingFromNodeRow < this.mouseOverDrawNodeRow) { //drawing downward

            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireS = true;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireN = true;
        }

        else { //drawing upward
            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireN = true;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireS = true;
        }
    }

    else { // drawing horizontally

        if(this.drawingFromNodeCol < this.mouseOverDrawNodeCol) { //drawing right

            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireE = true;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireW = true;
        }

        else { //drawing left
            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireW = true;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireE = true;
        }
    }

    this.solveCircuitThisFrame = true;

    this.startDrawingWire(false); //make the "draw to" node into the "draw from" node and start over
    
    if(this.waitingForTutDraw) {
        this.waitingForTutDraw = false;
        this.gameState.tutManager.closeSubtut();
    }
};

Blueprint.prototype.eraseWireAt = function(colNum,rowNum) {
    this.circuitComponents[colNum][rowNum].destroy();
    this.circuitComponents[colNum][rowNum] = 0;

    //set hasWireN/S/E/W for drawNodes
    if(this.drawingFromNodeCol == this.mouseOverDrawNodeCol) { // drawing vertically

        if(this.drawingFromNodeRow < this.mouseOverDrawNodeRow) { //drawing downward

            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireS = false;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireN = false;
        }

        else { //drawing upward
            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireN = false;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireS = false;
        }
    }

    else { // drawing horizontally

        if(this.drawingFromNodeCol < this.mouseOverDrawNodeCol) { //drawing right

            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireE = false;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireW = false;
        }

        else { //drawing left
            this.drawNodes[this.drawingFromNodeCol][this.drawingFromNodeRow].hasWireW = false;
            this.drawNodes[this.mouseOverDrawNodeCol][this.mouseOverDrawNodeRow].hasWireE = false;
        }
    }

    this.solveCircuitThisFrame = true;

    this.startDrawingWire(false); //make the "draw to" node into the "draw from" node and start over
    
    if(this.waitingForTutErase) {
        this.waitingForTutErase = false;
        this.gameState.tutManager.closeSubtut();
    }
};

Blueprint.prototype.snapToDrawNodeAt = function(colNum,rowNum) {
        
    var circuitElementColumnNum;
    var circuitElementRowNum;

    //if connecting nodes horizontally
    if(this.drawingFromNodeRow == rowNum) {
        circuitElementColumnNum = (this.drawingFromNodeCol + colNum)/2;
        circuitElementRowNum = rowNum;
    }

    //if connecting nodes vertically
    else {
        circuitElementColumnNum = colNum;
        circuitElementRowNum = (this.drawingFromNodeRow + rowNum)/2
    }

    if(!this.circuitComponents[circuitElementColumnNum][circuitElementRowNum]) { //if there is nothing there
        this.drawWireAt(circuitElementColumnNum,circuitElementRowNum);
    }

    else if(this.circuitComponents[circuitElementColumnNum][circuitElementRowNum].componentType == CrackTheCircuit.COMPONENT_WIRE) {
        this.eraseWireAt(circuitElementColumnNum,circuitElementRowNum);
    }

    else { //if there is a component (other than a wire) there
        //skip over the element and update the currently active draw node
        this.skipToDrawNodeAt(circuitElementColumnNum,circuitElementRowNum);
    }
    
    this.drawBlip.play();
};

Blueprint.prototype.skipToDrawNodeAt = function(colNum, rowNum) {

    this.drawingFromNodeCol = this.mouseOverDrawNodeCol;
    this.drawingFromNodeRow = this.mouseOverDrawNodeRow;

    //highlight the draw nodes that are directly adjacent to the currently selected one
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.drawNodes[i][j]) continue;

            //the currently active draw node
            if(i == this.drawingFromNodeCol && j == this.drawingFromNodeRow) {
                this.drawNodes[i][j].canBeDrawnTo = false;
                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_LARGE);
            }

            //if the node is adjacent to the current draw node horizontally or vertically
            else if((i == this.drawingFromNodeCol && Math.abs(j - this.drawingFromNodeRow) == 2) || (j == this.drawingFromNodeRow && Math.abs(i - this.drawingFromNodeCol) == 2)) {

                this.drawNodes[i][j].canBeDrawnTo = true;
                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_SMALL);
            }

            //a draw node not adjacent to the current one
            else {
                this.drawNodes[i][j].canBeDrawnTo = false;
                this.scaleDrawNodeTo(i,j,CrackTheCircuit.NODE_SCALE_SMALL);
            }
        }
    }
};

///////////// WIRE DRAWING END //////////////////
    

///////////// DRAGGING / ADDING COMPONENT START //////////////////
    
Blueprint.prototype.startDraggingComponent = function(componentType, cardAngle, colNum, rowNum) {
    
    this.game.input.onUp.add(this.releaseDraggingComponent, this);
    
    
    if(colNum == -1 && rowNum == -1) { //if coming from component cards
        this.mouseOverPaper = false; // for touch screen
    }
    
    var componentString = '';

    switch(componentType) {
        case CrackTheCircuit.COMPONENT_BATTERY:
            componentString = 'battery';
            break;
        case CrackTheCircuit.COMPONENT_SWITCH:
            componentString = 'switch';
            break;
        case CrackTheCircuit.COMPONENT_BULB:
            componentString = 'bulb';
            break;
    }

    if(!this.mouseOverPaper) {
        this.currDraggingComponent = this.game.add.sprite(this.currentMouseX,this.currentMouseY,'spriteSheetGame','card_'+componentString);
        this.currDraggingComponent.isCard = true;
        if(this.gameState.gameState == CrackTheCircuit.STATE_GAME) { this.currDraggingComponent.scale.setTo(CrackTheCircuit.CARD_SCALE); }
        else if(this.gameState.gameState == CrackTheCircuit.STATE_FREE_DRAW) { this.currDraggingComponent.scale.setTo(CrackTheCircuit.CARD_SCALE_FREE_DRAW); }
        this.currDraggingComponent.angle = cardAngle;
        this.currDraggingComponent.alpha = 1;
    } else {
        this.currDraggingComponent = this.game.add.sprite(this.currentMouseX,this.currentMouseY,'spriteSheetGame',componentString + 'Dragging');
        this.currDraggingComponent.isCard = false;
        this.currDraggingComponent.alpha = CrackTheCircuit.COMPONENT_ALPHA_UNSNAPPED;
        
        this.ghost.visible = true;
        this.ghost.angle = this.currDraggingComponent.angle;
        this.ghost.position.x = this.currentMouseX;
        this.ghost.position.y = this.currentMouseY;
        
        //HEEER
        
        
    }
    
    this.currDraggingComponent.anchor.setTo(0.5);
    
    if(!this.currDraggingComponent.isCard) {
        this.currDraggingComponent.scale.setTo(this.nodeToNodeDistance*this.bpScale/this.currDraggingComponent.width); //so that it is the same size as the other components, even though it is not a child of the blueprint group until it is snapped
    }

    this.currDraggingComponent.colNum = colNum;
    this.currDraggingComponent.rowNum = rowNum;
    
    this.currDraggingComponent.componentType = componentType;
    this.currDraggingComponent.componentString = componentString;

    this.isDraggingComponent = true;
    
    if(!this.mouseOverPaper || this.gameState.isTouchScreen) { //triggered when a component card is grabbed
        this.fadeDrawNodesToAlpha(1);
        this.scaleAllDrawNodesTo(CrackTheCircuit.NODE_SCALE_MEDIUM); // to make draw nodes visible when trying to snap components between them and a wire is present
    }
    
    this.game.world.bringToTop(this.ghost);
    this.ghost.loadTexture('spriteSheetGame',this.currDraggingComponent.componentString);
};

Blueprint.prototype.releaseDraggingComponent = function() {
    
    this.game.input.onUp.removeAll(); //so it doesnt keep firing
    
    //if not snapped in
    if(this.currDraggingComponent.colNum == -1 && this.currDraggingComponent.rowNum == -1) { 
        this.gameState.addCardOfType(this.currDraggingComponent.componentType); // replace the card in the component cards
        
        this.currDraggingComponent.destroy();
        this.isDraggingComponent = false;
    }

    //if snapped in
    else {
        this.addComponentAt(this.currDraggingComponent.colNum,this.currDraggingComponent.rowNum, this.currDraggingComponent.componentType);
        
        this.currDraggingComponent.destroy();
        this.isDraggingComponent = false;

        if(this.isCoveringUpComponent) {
             this.gameState.addCardOfType(this.coveringUpComponentType);
             this.resetCoveringUpComponent();
        }
        
        this.solveCircuitInState(-1); //current state
        this.solveCircuitThisFrame = false;
    }
    
    this.scaleAllDrawNodesTo(CrackTheCircuit.NODE_SCALE_SMALL);

    this.mouseOverDrawNodeCol = -1;
    this.mouseOverDrawNodeRow = -1;
    this.mouseOverSnappedComponentCol = -1;
    this.mouseOverSnappedComponentRow = -1;

    this.mouseDownOnSwitch = false;
    
    if(this.gameState.isTouchScreen || !this.mouseOverPaper) {
        this.fadeDrawNodesToAlpha(CrackTheCircuit.NODE_ALPHA_FADED_OUT);
        if(!this.mouseOverPaper) {
            this.game.canvas.style.cursor = "default";
        }
        this.mouseOverPaper = false;
    }
    
    if(!this.gameState.isTouchScreen && this.mouseOverPaper) {
        this.updateMouseOverDrawNodes();
        this.updateMouseOverSnapNodes();
    }
    
    this.ghost.visible = false;
};
    
Blueprint.prototype.updateDraggingComponent = function() {  
    if(this.gameState.isTouchScreen) {
        if((Math.abs(this.currentMouseX - this.position.x) < 0.5*this.bpWidth*this.bpScale) && (Math.abs(this.currentMouseY - this.position.y) < 0.5*this.bpHeight*this.bpScale)) { this.mouseOverPaper = true; } else this.mouseOverPaper = false; 
    }
    
    if(!this.mouseOverPaper && !this.currDraggingComponent.isCard) {
        this.currDraggingComponent.loadTexture('spriteSheetGame','card_'+this.currDraggingComponent.componentString);
        this.currDraggingComponent.isCard = true;
        if(this.gameState.gameState == CrackTheCircuit.STATE_GAME) { this.currDraggingComponent.scale.setTo(CrackTheCircuit.CARD_SCALE); }
        else if(this.gameState.gameState == CrackTheCircuit.STATE_FREE_DRAW) { this.currDraggingComponent.scale.setTo(CrackTheCircuit.CARD_SCALE_FREE_DRAW); }
        this.currDraggingComponent.alpha = 1;
        this.currDraggingComponent.angle = 0;
        
        this.ghost.visible = false;
    } else if(this.mouseOverPaper && this.currDraggingComponent.isCard) {          
        this.currDraggingComponent.loadTexture('spriteSheetGame',this.currDraggingComponent.componentString + 'Dragging');
        this.currDraggingComponent.isCard = false;
        this.currDraggingComponent.alpha = CrackTheCircuit.COMPONENT_ALPHA_UNSNAPPED;
        this.currDraggingComponent.scale.setTo(1);
        this.currDraggingComponent.scale.setTo(this.nodeToNodeDistance*this.bpScale/this.currDraggingComponent.width); //so that it is the same size as the other components, even though it is not a child of the blueprint group until it is snapped
        this.currDraggingComponent.angle = 0;
    }
    
    if(!this.mouseOverPaper) {
        this.currDraggingComponent.position.x = this.currentMouseX;
        this.currDraggingComponent.position.y = this.currentMouseY;

        //if previously snapped to a snap node
        if(!(this.currDraggingComponent.colNum == -1 && this.currDraggingComponent.rowNum == -1)) {
            this.tempUnsnapDragComponentFrom(this.currDraggingComponent.colNum,this.currDraggingComponent.rowNum);
        }
        
        return;
    }
    
    //is mouse is over paper
    
    var dx;
    var dy;
    var radius;

    var snapNodeX = 0;
    var snapNodeY = 0;

    var snappedToAny = false;
    var shortestDist = -1;
    var closestCol = -1;
    var closestRow = -1;

    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.snapNodes[i][j]) continue; //only elements that contain a snap node

            dx = this.currentMouseX-(this.snapNodes[i][j].x+(this.position.x));
            dy = this.currentMouseY-(this.snapNodes[i][j].y+(this.position.y));

            radius = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
            
            if((radius <= this.nodeToNodeDistance) && (radius < shortestDist || shortestDist == -1)) {
                shortestDist = radius;
                closestCol = i;
                closestRow = j;
                snappedToAny = true;
            }
        }
    }
    
    if(snappedToAny) {
        //if not already snapped to this snap node
        if(!(this.currDraggingComponent.colNum == closestCol && this.currDraggingComponent.rowNum == closestRow)) {
            //if the previous frame it was attached to a different one
            if(!(this.currDraggingComponent.colNum == -1 && this.currDraggingComponent.rowNum == -1)) {             
                this.tempUnsnapDragComponentFrom(this.currDraggingComponent.colNum,this.currDraggingComponent.rowNum);
            }

            this.tempSnapDragComponentTo(closestCol,closestRow,true);
        }
    }

    else {
        this.currDraggingComponent.position.x = this.currentMouseX;
        this.currDraggingComponent.position.y = this.currentMouseY;

        //if previously snapped to a snap node
        if(!(this.currDraggingComponent.colNum == -1 && this.currDraggingComponent.rowNum == -1)) {
            this.tempUnsnapDragComponentFrom(this.currDraggingComponent.colNum,this.currDraggingComponent.rowNum);
        }
    }
    
    this.ghost.position.x = this.currentMouseX;
    this.ghost.position.y = this.currentMouseY;
};
    
Blueprint.prototype.unsnapComponent = function(fromSwitchSlide) { //when a snapped component is clicked
        
    var colNum = this.mouseOverSnappedComponentCol;
    var rowNum = this.mouseOverSnappedComponentRow;

    var componentType;

    if(fromSwitchSlide) {
        componentType = CrackTheCircuit.COMPONENT_SWITCH;
    }

    else componentType = this.circuitComponents[colNum][rowNum].componentType;

    if(componentType == CrackTheCircuit.COMPONENT_SWITCH && !this.mouseDownOnSwitch) {
        this.toggleSwitchAt(colNum,rowNum);
        this.mouseDownOnSwitch = true;
        this.switchUnsnapMouseXi = this.currentMouseX;
        this.switchUnsnapMouseYi = this.currentMouseY;
        this.mouseDownOnSwitchCol = colNum;
        this.mouseDownOnSwitchRow = rowNum;
        
        return;
    }

    //delete old one

    if(fromSwitchSlide) { 
        colNum = this.mouseDownOnSwitchCol;
        rowNum = this.mouseDownOnSwitchRow;
    }

    this.circuitComponents[colNum][rowNum].destroy();
    this.circuitComponents[colNum][rowNum] = 0;

    if(rowNum%2 == 0) { //if the component was positioned horizontally between draw nodes            
        this.drawNodes[colNum-1][rowNum].hasComponentE = false;
        this.drawNodes[colNum+1][rowNum].hasComponentW = false;
    }

    else { //if the component was positioned vertically between draw nodes
        this.drawNodes[colNum][rowNum-1].hasComponentS = false;
        this.drawNodes[colNum][rowNum+1].hasComponentN = false;
    }

    //create new dragging one

    this.startDraggingComponent(componentType, 0, colNum, rowNum);

    //reposition it and update the properties

    this.currDraggingComponent.position = {x:this.position.x - 0.5*(this.numNodesX-1)*this.nodeToNodeDistance*this.bpScale + 0.5*colNum*this.nodeToNodeDistance*this.bpScale, y:this.position.y - 0.5*(this.numNodesY-1)*this.nodeToNodeDistance*this.bpScale + 0.5*rowNum*this.nodeToNodeDistance*this.bpScale};

    if(fromSwitchSlide) {
        this.currDraggingComponent.alpha = CrackTheCircuit.COMPONENT_ALPHA_UNSNAPPED;
    }

    else this.currDraggingComponent.alpha = 1;

    var angle = this.angleForComponent(colNum,rowNum,componentType);

    this.currDraggingComponent.angle = angle;
    this.ghost.angle = angle;

    //for making the negative sign always appear horizontal (lazy, I know ._.)
    if(componentType == CrackTheCircuit.COMPONENT_BATTERY) {
        if(angle == 0) {
            this.currDraggingComponent.loadTexture('spriteSheetGame','batteryDragging');
            this.ghost.loadTexture('spriteSheetGame','batteryDragging');
        }

        else {
            this.currDraggingComponent.loadTexture('spriteSheetGame','batteryVertDragging');
            this.ghost.loadTexture('spriteSheetGame','batteryVertDragging');
        }
    }
    
    //if not toggling a switch
    this.solveCircuitInState(-1); //current state
    this.solveCircuitThisFrame = false;
    
    this.scaleAllDrawNodesTo(CrackTheCircuit.NODE_SCALE_MEDIUM); // to make draw nodes visible when trying to snap components between them and a wire is present
    
    this.justUnsnapped = true;
    this.componentUnclick.play();
};
    
Blueprint.prototype.tempSnapDragComponentTo = function(colNum,rowNum) {
    this.currDraggingComponent.position.x = this.snapNodes[colNum][rowNum].x+(this.position.x);
    this.currDraggingComponent.position.y = this.snapNodes[colNum][rowNum].y+(this.position.y);        

    var angle = this.angleForComponent(colNum,rowNum,this.currDraggingComponent.componentType);

    this.currDraggingComponent.angle = angle;
    this.ghost.angle = angle;

    //for making the negative sign always appear horizontal (lazy, I know ._.)
    if(this.currDraggingComponent.componentType == CrackTheCircuit.COMPONENT_BATTERY) {
        if(angle == 0) {
            this.currDraggingComponent.loadTexture('spriteSheetGame','batteryDragging');
            this.ghost.loadTexture('spriteSheetGame','batteryDragging');
        }

        else {
            this.currDraggingComponent.loadTexture('spriteSheetGame','batteryVertDragging');
            this.ghost.loadTexture('spriteSheetGame','batteryVertDragging');
        }
    }

    this.currDraggingComponent.colNum = colNum;
    this.currDraggingComponent.rowNum = rowNum;
    this.currDraggingComponent.alpha = 1;

    if(this.circuitComponents[colNum][rowNum]) { //if there is something already there
        this.circuitComponents[colNum][rowNum].visible = false;
        
        if(this.circuitComponents[colNum][rowNum].componentType != CrackTheCircuit.COMPONENT_WIRE) {
            this.isCoveringUpComponent = true;
            this.coveringUpComponentType = this.circuitComponents[colNum][rowNum].componentType;
        }
    }
    
    if(this.justUnsnapped) {
        this.justUnsnapped = false;
    }
    
    else this.componentBlip.play();
    
    this.ghost.visible = true;
};
    
Blueprint.prototype.tempUnsnapDragComponentFrom = function(colNum,rowNum) {
    this.currDraggingComponent.colNum = -1;
    this.currDraggingComponent.rowNum = -1;
    
    if(this.mouseOverPaper) {
        this.currDraggingComponent.alpha = CrackTheCircuit.COMPONENT_ALPHA_UNSNAPPED;
    }

    if(this.circuitComponents[colNum][rowNum]) { //if there was something already there, but invisible
        this.circuitComponents[colNum][rowNum].visible = true;
        this.isCoveringUpComponent = false;
        this.coveringUpComponentType = null;
    }
};
    
Blueprint.prototype.addComponentAt = function(colNum,rowNum,componentType) {
        
    if(this.circuitComponents[colNum][rowNum])
    {
        this.circuitComponents[colNum][rowNum].destroy();
    }

    var componentString = '';

    switch(componentType) {
        case CrackTheCircuit.COMPONENT_BATTERY:
            componentString = 'battery';
            break;
        case CrackTheCircuit.COMPONENT_SWITCH:
            componentString = 'switch';
            break;
        case CrackTheCircuit.COMPONENT_BULB:
            componentString = 'bulb';
            break;
    }

    var newComponent = this.game.add.sprite(- 0.5*(this.numNodesX-1)*this.nodeToNodeDistance + 0.5*colNum*this.nodeToNodeDistance,- 0.5*(this.numNodesY-1)*this.nodeToNodeDistance + 0.5*rowNum*this.nodeToNodeDistance,'spriteSheetGame',componentString);

    newComponent.anchor.setTo(0.5);
    newComponent.scale.setTo(this.nodeToNodeDistance/newComponent.width);

    newComponent.componentType = componentType;

    if(componentType == CrackTheCircuit.COMPONENT_SWITCH) {
        newComponent.closed = false; //is the switch closed?
    }
    
    else if(componentType == CrackTheCircuit.COMPONENT_BULB) {
        newComponent.bulbBrightness = 0; //default brightness
        var glowSprite = this.game.add.sprite(0,0,'spriteSheetGame','bulbLit');
        glowSprite.anchor.setTo(0.5);
        glowSprite.visible = false;
        newComponent.addChild(glowSprite);
        newComponent.glowSprite = glowSprite;
        var shortSymbol = this.game.add.sprite(0,0,'spriteSheetGame','shortSymbol');
        shortSymbol.anchor.setTo(0.5);
        shortSymbol.visible = false;
        newComponent.addChild(shortSymbol);
        newComponent.shortSymbol = shortSymbol;
    }

    newComponent.heatIndex = 0; //for short circuit color animating
    
    this.circuitComponents[colNum][rowNum] = newComponent;

    this.circuitComponentGroup.add(newComponent);

    //set hasComponent N/S/E/W for drawNodes

    if(rowNum%2 == 0) { //if the component is positioned horizontally between draw nodes
        this.drawNodes[colNum-1][rowNum].hasComponentE = true;
        this.drawNodes[colNum+1][rowNum].hasComponentW = true;

        this.drawNodes[colNum-1][rowNum].hasWireE = false;
        this.drawNodes[colNum+1][rowNum].hasWireW = false; //to prevent leftover hightlighted draw nodes after a component deletes a wire and is then deleted
    }

    else { //if the component is positioned vertically between draw nodes            
        this.drawNodes[colNum][rowNum-1].hasComponentS = true;
        this.drawNodes[colNum][rowNum+1].hasComponentN = true;

        this.drawNodes[colNum][rowNum-1].hasWireS = false;
        this.drawNodes[colNum][rowNum+1].hasWireN = false;
    }

    var angle = this.angleForComponent(colNum,rowNum,componentType);  

    newComponent.angle = angle;

    //for making the negative sign always appear horizontal (lazy, I know ._.)
    if(componentType == CrackTheCircuit.COMPONENT_BATTERY) {
        if(angle == 0) {
            newComponent.loadTexture('spriteSheetGame','battery');
        }

        else newComponent.loadTexture('spriteSheetGame','batteryVert');
    }
    
    newComponent.isHighlighted = false; //for mouse hover highlighting

    this.solveCircuitThisFrame = true;
    
    this.componentClick.play();
    
    if(this.waitingForTutAdd) {
        this.waitingForTutAdd = false;
        this.gameState.tutManager.closeSubtut();
    }
};

///////////// DRAGGING COMPONENT END //////////////////

//////////// END MOUSE INPUT ////////////////

/////////// CHECK IF DRAW NODES ARE CONNECTED TO ANYTHING ///////////

Blueprint.prototype.isAttachedToAnyWires = function(drawNode) {
    return (drawNode.hasWireN || drawNode.hasWireS || drawNode.hasWireE || drawNode.hasWireW);
};
    
Blueprint.prototype.isAttachedToAnyComponents = function(drawNode) {
    return (drawNode.hasComponentN || drawNode.hasComponentS || drawNode.hasComponentE || drawNode.hasComponentW);
};
    
Blueprint.prototype.isAttachedToAnything = function(drawNode) {
    return (this.isAttachedToAnyWires(drawNode) || this.isAttachedToAnyComponents(drawNode));
};

//////////// OTHER FUNCTIONS ////////////////

Blueprint.prototype.toggleSwitchAt = function(colNum,rowNum) {
    var isClosed = this.circuitComponents[colNum][rowNum].closed;

    this.circuitComponents[colNum][rowNum].closed = !isClosed;

    if(!isClosed) {
        this.circuitComponents[colNum][rowNum].loadTexture('spriteSheetGame','switchClosedHighlighted');
        this.switchClose.play();
    }

    else {
        this.circuitComponents[colNum][rowNum].loadTexture('spriteSheetGame','switchHighlighted');
        this.switchOpen.play();
    }

    this.solveCircuitInState(-1); //current state
    this.solveCircuitThisFrame = false;
};

Blueprint.prototype.checkToToggleSwitchesOnly = function() {
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
            for(var j = 0; j < 2*this.numNodesY-1; j++) {
                if(this.circuitComponents[i][j] && this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_SWITCH) { 
                    var distanceFromMouseToSnapNode = Math.sqrt(Math.pow(this.currentMouseX - (this.position.x + this.snapNodes[i][j].x),2)+Math.pow(this.currentMouseY - (this.position.y + this.snapNodes[i][j].y),2));
                    //if the mouse is within the snap node radius
                    if(distanceFromMouseToSnapNode <= this.snapNodeDiameter) {
                        this.toggleSwitchAt(i,j);
                        return;
                    }
                }
            }
    } return; 
};

Blueprint.prototype.checkToUnsnapSwitch = function() {
    
    //to prevent prematurely unsnapping the switch when the mouse slides but is still over the snap area
    if(this.mouseOverSnappedComponentCol == this.mouseDownOnSwitchCol && this.mouseOverSnappedComponentRow == this.mouseDownOnSwitchRow)  {
        return;
    }

    var dx = this.currentMouseX-this.switchUnsnapMouseXi;
    var dy = this.currentMouseY-this.switchUnsnapMouseYi;
    var radius = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));

    if(radius > this.snapNodeDiameter/2) {
        this.unsnapComponent(true);
        this.mouseDownOnSwitch = false;
    }
};

Blueprint.prototype.angleForComponent = function(colNum,rowNum,componentType) {
    if(rowNum%2 == 0) { //component is positioned horizontally between draw nodes

        if(rowNum == 2*(this.numNodesY-1)) {
            //if(componentType == CrackTheCircuit.COMPONENT_BATTERY)
                //return 180;
        }

        return 0;
    }

    else { //component is positioned vertically between draw nodes

//        if(colNum < this.numNodesX-1) {
//            return -90;
//        }

        return -90;
    }
};

Blueprint.prototype.solveCircuitInState = function(state) {
    
    var circuitObjectsToSolve = this.circuitObjectsToSolveForIteration(state);
    
    if(circuitObjectsToSolve.length == 0) return;
    
    var soln = simulateCircuit(circuitObjectsToSolve);

    if(state == -1) { //update current components
        this.updateBulbsAndShorts(soln);
        this.gameState.circuitSolvedInBlueprint(); //to check 'Circuit Checker'
    }
    
    else { //if the circuit is being checked to return bulb current values in different switch states
        return soln;
    }
};

Blueprint.prototype.updateBulbsAndShorts = function(solution) {
    
    //this.makeAllDrawNodesWhite();

    this.resetShorts();
    
    var batteryShorted = false;
    
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {
            
            if(!this.circuitComponents[i][j] || (i%2 == 0 && j%2 == 0)) { //if nonexistent or the element is a draw node
                continue;
            }
            
            //this.circuitComponents[i][j].tint = 0xffffff;
            
            if(this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_SWITCH && !this.circuitComponents[i][j].closed) {
                continue;
            }
            
            var currentThroughObject = solution[currentVariable(this.circuitComponents[i][j].indexInCircuitObjectsArray)];
            
            //console.log(currentThroughObject);
            
            if(this.circuitComponents[i][j].componentType != CrackTheCircuit.COMPONENT_BULB) { //batteries, switches, wires can be shorted
                if(Math.abs(currentThroughObject) > CrackTheCircuit.MIN_CURRENT_SHORT) {
                    if(!batteryShorted && this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_BATTERY) { //if the battery is shorted, turn off all bulbs
                        batteryShorted = true;
                        if(!this.isBatteryShorted) { //only if there it was not already a short
                            this.shortSound.play();
                        }
                    }
                    
                    this.setShortCircuitAtIndex(i,j);
                }
            }
        }
    }
    
    this.isBatteryShorted = batteryShorted;
    
    var anyBulbsShorted = false;
    
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {
            if(!this.circuitComponents[i][j] || (i%2 == 0 && j%2 == 0)) { //the element is nonexistent or a draw node
                continue; 
            }

            if(this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_BULB) {
                var currentThroughObject = solution[currentVariable(this.circuitComponents[i][j].indexInCircuitObjectsArray)];
                this.setBulbImageAtIndexForCurrent(i,j,currentThroughObject,batteryShorted);
                
                if(currentThroughObject != 0) {
                    var brightness = currentThroughObject*currentThroughObject;
                    if(batteryShorted || (brightness > CrackTheCircuit.MIN_CURRENT_CONNECTED && brightness < CrackTheCircuit.MIN_POWER_BULB_ON)) {
                        anyBulbsShorted = true;
                    } 
                } 
            }
        }
    }
    
    if(anyBulbsShorted || batteryShorted) {
        if(!this.shortHelpBtnShowing) {
            this.shortHelpBtnShowing = true;
            this.gameState.menu.showShortHelpBtn();
            
        }
    } else if(!anyBulbsShorted && !batteryShorted) {
        if(this.shortHelpBtnShowing) {
            this.shortHelpBtnShowing = false;
            this.gameState.menu.hideShortHelpBtn();
        }
    }
};

//iteration 0 = [0,0], iteration 1 = [1,0], iteration 2 = [0,1], iteration 3 = [1,1]
//iteration -1 means just solving the circuit as it is now, not for any switch combo iteration
Blueprint.prototype.circuitObjectsToSolveForIteration = function(iteration) {

    //console.log(this.circuitComponents);
    var circuitObjects = new Array();
    
    var firstSwitchEncountered = true;
    
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(i%2 == 0 && j%2 == 0) { //the element is a draw node
                continue; 
            }

            if(!this.circuitComponents[i][j]) { 
                continue;
            }

            var x1;
            var y1;
            var x2;
            var y2;
            
            if(j%2 == 0) { //component is positioned horizontally between draw nodes
                x1 = i-1;
                x2 = i+1;
                y1 = j;
                y2 = j;
            }

            else { //component is positioned vertically between draw nodes
                x1 = i;
                x2 = i;
                y1 = j-1;
                y2 = j+1;
            }
            
            if(this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_SWITCH) {
                
                if(iteration == -1) { //just the current state of the circuit blueprint
                    if(this.circuitComponents[i][j].closed) {
                        circuitObjects.push(new Resistor(x1,y1,x2,y2,CrackTheCircuit.WIRE_RESISTANCE));
                    } else continue;
                }
                
                if(firstSwitchEncountered) {
                    if(iteration == 0 || iteration == 2) {
                        //do nothing, open switch
                    }
                    else {
                        circuitObjects.push(new Resistor(x1,y1,x2,y2,CrackTheCircuit.WIRE_RESISTANCE));
                    }
                    firstSwitchEncountered = false;
                }

                else { //second switch
                    if(iteration == 0 || iteration == 1) {
                        //do nothing, open switch
                    }
                    else {
                        circuitObjects.push(new Resistor(x1,y1,x2,y2,CrackTheCircuit.WIRE_RESISTANCE));
                    }
                }
            }
            
            else if(this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_BATTERY) {
                circuitObjects.push(new VoltageSource(x1,y1,x2,y2,CrackTheCircuit.BATTERY_VOLTAGE));
            }

            else if(this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_BULB) {
                circuitObjects.push(new Resistor(x1,y1,x2,y2,CrackTheCircuit.BULB_RESISTANCE));
            }

            else { //if wire
                circuitObjects.push(new Resistor(x1,y1,x2,y2,CrackTheCircuit.WIRE_RESISTANCE));
            }
            
            this.circuitComponents[i][j].indexInCircuitObjectsArray = circuitObjects.length-1;
        }
    }
    
    return circuitObjects;
};

Blueprint.prototype.allSolvedCircuits = function(numBulbs, numSwitches) {
    
    var totalIterations = Math.pow(2,numSwitches); //2 to the n    
    
    var allCircuits = new Array(numBulbs); //will contain numerical values for the current through each bulb in each circuit state
    
    for(var b = 0; b < numBulbs; b++) {
        allCircuits[b] = new Array(totalIterations);
    }
    
    for(var b = 0; b < numBulbs; b++) { //parse allCircuits data into same type of array as correctBehavior
        for(var ss = 0; ss < totalIterations; ss++) { //go through the switch state iterations for each bulb

            var circuitState = this.solveCircuitInState(ss);
                
            var batteryShorted = false;
            var bulbIndex = 0;
            
            for(var i = 0; i < 2*this.numNodesX-1; i++) {
                for(var j = 0; j < 2*this.numNodesY-1; j++) {
                    if(!this.circuitComponents[i][j] || (i%2 == 0 && j%2 == 0)) { //the element is nonexistent or a draw node
                        continue; 
                    }

                    if(this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_BATTERY) { //if the battery is shorted, turn off all bulbs
                        var currentThroughObject = circuitState[currentVariable(this.circuitComponents[i][j].indexInCircuitObjectsArray)];
                        if(Math.abs(currentThroughObject) > CrackTheCircuit.MIN_CURRENT_SHORT) {
                            //Battery Shorted
                            batteryShorted = true;
                            for(var k = 0; k < numBulbs; k++) { //if battery shorted, go through all bulb indices and set current = 0
                                allCircuits[k][ss] = 0;
                            }
                        }
                    }

                    else if(!batteryShorted && this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_BULB) {
                        if(bulbIndex == b) { //correct bulb corresponding to the one whose array is being built
                            
                            var currentThroughObject = circuitState[currentVariable(this.circuitComponents[i][j].indexInCircuitObjectsArray)];

                            if(currentThroughObject*currentThroughObject > CrackTheCircuit.MIN_POWER_BULB_ON) {
                                allCircuits[b][ss] = currentThroughObject*currentThroughObject;
                            }
                            else allCircuits[b][ss] = 0;
                        }

                        bulbIndex++;
                    }
                }
            }
        }
    }
    
    return allCircuits;
};

/////////////////////////////////////////////
    
Blueprint.prototype.setBulbImageAtIndexForCurrent = function(colNum, rowNum, current, shorted) { //brightness can be 0,1,2,3
    var imageString = '';
    var brightness = current*current;
    var isShorted = false;
    var isLit = false;
    
    if(current != 0) {
        if(shorted || (brightness > CrackTheCircuit.MIN_CURRENT_CONNECTED && brightness < CrackTheCircuit.MIN_POWER_BULB_ON)) {
            isShorted = true;
            this.circuitComponents[colNum][rowNum].shortSymbol.visible = true;
            this.circuitComponents[colNum][rowNum].shortSymbol.angle = -this.circuitComponents[colNum][rowNum].angle; //so it always appears upright
            //console.log("BRIGHTNESS SHORTED: " + brightness);
            brightness = 0;
        }

        else if(brightness > CrackTheCircuit.MIN_POWER_BULB_ON) {
            isLit = true;
            this.circuitComponents[colNum][rowNum].glowSprite.visible = true;
            this.circuitComponents[colNum][rowNum].glowSprite.alpha = Math.max(Math.min(Math.pow(brightness,0.3),1)-0.1,0.1);
            //console.log(this.circuitComponents[colNum][rowNum].glowSprite.alpha);
            //console.log("BRIGHTNESS LIT: " + brightness);
        } else {
            brightness = 0;
        }
    }
    
    if(isLit && this.circuitComponents[colNum][rowNum].bulbBrightness == 0) { //if the bulb was off, and now it's on
        this.bulbOn.play();
    } else if(brightness == 0 && this.circuitComponents[colNum][rowNum].bulbBrightness != 0) { //if it was previously lit
        this.circuitComponents[colNum][rowNum].glowSprite.visible = false;
    }

    if(this.circuitComponents[colNum][rowNum].isShorted && !isShorted) { this.circuitComponents[colNum][rowNum].shortSymbol.visible = false; }
    
    this.circuitComponents[colNum][rowNum].bulbBrightness = brightness;
    this.circuitComponents[colNum][rowNum].isShorted = isShorted;
};

Blueprint.prototype.resetShorts = function() {
    
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {
            
            if(this.circuitComponents[i][j]) { //if existent 
                this.circuitComponents[i][j].heatingUp = false;
            }
            
            if(this.drawNodes[i][j]) { //if existent 
                this.drawNodes[i][j].heatingUp = false;
            }
        }
    }
};

Blueprint.prototype.setShortCircuitAtIndex = function(colNum, rowNum) {

    if(!this.circuitComponents[colNum][rowNum].heatingUp) {
        this.circuitComponents[colNum][rowNum].heatingUp = true;
        this.circuitComponentGroup.bringToTop(this.circuitComponents[colNum][rowNum]);
    }

    if(rowNum%2 == 0) { //component is positioned horizontally between draw nodes
        this.drawNodes[colNum-1][rowNum].heatingUp = true;
        this.drawNodes[colNum+1][rowNum].heatingUp = true;
    }

    else { //component is positioned vertically between draw nodes
        this.drawNodes[colNum][rowNum-1].heatingUp = true;
        this.drawNodes[colNum][rowNum+1].heatingUp = true;
    }
    
    if(!this.shortHelpBtnShowing) {
        this.gameState.menu.showShortHelpBtn();
        this.shortHelpBtnShowing = true;
    }
};

Blueprint.prototype.makeAllDrawNodesWhite = function() {

    for(var i = 0; i < this.drawNodes.length; i++) {
            this.drawNodes[i].forEach(function(drawNode) {
            drawNode.tint = 0xffffff;
        });
    }
}; 

Blueprint.prototype.clearBlueprint = function() {
    this.eraseDrawNodes();
    this.eraseSnapNodes();
    this.clearCircuitComponents();
    this.solveCircuitThisFrame = false;
    this.inWinScreen = false;
    this.active = false;
};

Blueprint.prototype.trashBtnPressed = function() {
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {
            if(i%2 == 0 && j%2 == 0) { //draw node
                if(this.isAttachedToAnything(this.drawNodes[i][j])) {
                    this.drawNodes[i][j].hasWireN = false;
                    this.drawNodes[i][j].hasWireS = false;
                    this.drawNodes[i][j].hasWireE = false;
                    this.drawNodes[i][j].hasWireW = false;

                    //components other than wires
                    this.drawNodes[i][j].hasComponentN = false;
                    this.drawNodes[i][j].hasComponentS = false;
                    this.drawNodes[i][j].hasComponentE = false;
                    this.drawNodes[i][j].hasComponentW = false;
                    
                    this.drawNodes[i][j].alpha = CrackTheCircuit.NODE_ALPHA_FADED_OUT;
                    
                    this.drawNodes[i][j].heatingUp = false;
                    this.drawNodes[i][j].heatIndex = 0;
                    this.drawNodes[i][j].tint = 0xffffff;
                }
            }
            else if(this.circuitComponents[i][j]) {
                this.circuitComponents[i][j].destroy();
                this.circuitComponents[i][j] = null;
            }
        }
    }
};

/////WHEN A COMPONENT IS TRASHED, TO PUT IT BACK IN THE STACK OF CARDS/////////

Blueprint.prototype.resetCoveringUpComponent = function() {
    this.isCoveringUpComponent = false;
    this.coveringUpComponentType = null;
};

Blueprint.prototype.allSwitchesClosed = function() { //only check the circuit when all switches are closed
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {
            if(this.circuitComponents[i][j] && this.circuitComponents[i][j].componentType == CrackTheCircuit.COMPONENT_SWITCH) {
                if(!this.circuitComponents[i][j].closed) { return false; }
            }
        }
    }
    
    return true;
};

Blueprint.prototype.makeDrawNodesVisibleAfterHint = function() {
    for(var i = 0; i < 2*this.numNodesX-1; i++) {
        for(var j = 0; j < 2*this.numNodesY-1; j++) {

            if(!this.drawNodes[i][j]) continue;

            if(this.isAttachedToAnything(this.drawNodes[i][j])){
                this.drawNodes[i][j].alpha = 1;
            }
        }
    }
};

///////// AFTER LEVEL WIN //////////

Blueprint.prototype.setWinMode = function() {
    this.inWinScreen = true;
    this.enableTouch();
};

///////// CHANGE DRAW SIZE IN GAME //////////

Blueprint.prototype.toggleDrawSize = function() {
    this.clearBlueprint();
    if(this.drawSize == CrackTheCircuit.DRAW_SIZE_SMALL) {
        this.drawSize = CrackTheCircuit.DRAW_SIZE_LARGE;
    } else this.drawSize = CrackTheCircuit.DRAW_SIZE_SMALL;
    this.constructForGame();
};

///////// FREE DRAW MODE ///////////

Blueprint.prototype.constructForFreeDrawSize = function(sizeIndex) { //1 thru 3
    this.paper.loadTexture('blueprintFreeDraw');
    this.setDimensionsForFreeDraw(sizeIndex);
    this.createDrawNodes();
    this.createSnapNodes();
    this.createCircuitComponents();
    this.active = true;
    this.solveCircuitInState(-1);
};

Blueprint.prototype.changeFreeDrawSizeTo = function(sizeIndex) {
    this.clearBlueprint();
    this.freeDrawScale = sizeIndex;
    this.constructForFreeDrawSize(sizeIndex);
};

//////// GHOST ///////

Blueprint.prototype.createGhost = function() {
    this.ghost = this.game.add.sprite(0,0,'spriteSheetGame','bulb');
    this.ghost.alpha = 0.25;
    this.ghost.anchor.setTo(0.5);
    this.ghost.visible = false;
    this.ghost.scale.setTo(this.nodeToNodeDistance/this.ghost.width);
};

///////// AUDIO ////////////

Blueprint.prototype.loadAudio = function() {
    this.startDraw = this.game.add.audio('startDraw');
    this.drawBlip = this.game.add.audio('drawBlip');
    this.componentClick = this.game.add.audio('componentClick');
    this.componentUnclick = this.game.add.audio('componentUnclick');
    this.componentBlip = this.game.add.audio('componentBlip');
    this.bulbOn = this.game.add.audio('bulbOn');
    this.switchClose = this.game.add.audio('switchClose');
    this.switchOpen = this.game.add.audio('switchOpen');
    this.shortSound = this.game.add.audio('shortCircuit');
    this.shortSound.volume = 0.15;
};