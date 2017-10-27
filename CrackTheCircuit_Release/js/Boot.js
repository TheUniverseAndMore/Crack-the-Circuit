var CrackTheCircuit = {
    BG_COLOR: '0x122024',
    BLUEPRINT_COLOR: '0x0663ae',
    WIN_WIRE_COLOR: '0xc74b2f',
    WIN_WIRE_BORDER_COLOR: '0x440000',
    WIRE_WIDTH: 14,
    WIRE_WIDTH_FD_1: 22,
    WIRE_WIDTH_FD_2: 16,
    WIRE_WIDTH_FD_3: 14,
    
    STATE_MAIN_MENU: 0,
    STATE_TRANSITION: 1,
    STATE_GAME: 2,
    STATE_WIN: 3,
    STATE_FREE_DRAW: 4,
    
    MENU_STATE_MAIN: 0,
    MENU_STATE_LEVEL_SELECT: 1,
    MENU_STATE_SETTINGS: 2,
    MENU_STATE_ABOUT: 3,
    
    BTN_INDEX_PLAY: 0,
    BTN_INDEX_SELECT_LEVEL: 1,
    BTN_INDEX_FREE_DRAW: 2,
    BTN_INDEX_SETTINGS: 3,
    BTN_INDEX_ABOUT: 4,
    BTN_INDEX_BACK: 5,
    BTN_INDEX_TRASH: 6,
    BTN_INDEX_HINT: 7,
    BTN_INDEX_REPLAY: 8,
    BTN_INDEX_NEXT_LEVEL: 9,
    BTN_INDEX_MUSIC: 10,
    BTN_INDEX_SOUND: 11,
    BTN_INDEX_ELECTRONS: 12,
    BTN_INDEX_CLEAR_DATA: 13,
    BTN_INDEX_CLEAR_DATA_Y: 14,
    BTN_INDEX_CLEAR_DATA_N: 15,
    BTN_INDEX_LEVEL_SELECT_BOX: 16,
    BTN_INDEX_LEVEL_SELECT_NEXT: 17,
    BTN_INDEX_LEVEL_SELECT_PREV: 18,
    BTN_INDEX_FD_SIZE_1: 19,
    BTN_INDEX_FD_SIZE_2: 20,
    BTN_INDEX_FD_SIZE_3: 21,
    BTN_INDEX_LINK_1: 22,
    BTN_INDEX_LINK_2: 23,
    BTN_INDEX_SIZE:24,
    BTN_INDEX_FULL_SCREEN_X:25,
    BTN_INDEX_SHORT_HELP:26,
    
    DRAW_SIZE_SMALL:1,
    DRAW_SIZE_LARGE:2,
    
    FD_SIZE_BTN_ALPHA_OUT: 0.25,
    FD_SIZE_BTN_ALPHA_IN: 0.9,
    
    TITLE_BOX_MOVE_TIME: 950,
    
    TITLE_BOX_RAISE_TIME: 800,
    TITLE_BOX_LOWER_TIME: 650,
    BOX_RAISE_TIME: 800,
    BOX_LOWER_TIME: 650,
    
    PAGE_MOVE_DOWN_TIME: 200,
    
    NODE_SCALE_SMALL: 1,
    NODE_SCALE_MEDIUM: 1.3,
    NODE_SCALE_LARGE: 1.6,
    
    NODE_ALPHA_FADED_OUT: 0.2,
    
    CARD_SCALE: 0.7,
    CARD_SCALE_FREE_DRAW: 0.86,
    
    COMPONENT_ALPHA_UNSNAPPED: 0.7,
    COMPONENT_SCALE_UNHIGHLIGHTED: 1,
    COMPONENT_SCALE_HIGHLIGHTED: 1.08,
    
    COMPONENT_WIRE: 1,
    COMPONENT_BATTERY: 2,
    COMPONENT_BULB: 3,
    COMPONENT_SWITCH: 4,
    
    BATTERY_VOLTAGE: 120,
    WIRE_RESISTANCE: 0.001,
    BULB_RESISTANCE: 120,
    
    MIN_POWER_BULB_ON: 0.001,
    MIN_CURRENT_SHORT: 20,
    MIN_CURRENT_CONNECTED: 1e-20,
    
    NEON_HEAT_UP_CONSTANT: 0.07,
    NEON_COOL_DOWN_CONSTANT: 0.03,
    WIRE_HEAT_UP_CONSTANT: 0.04,
    WIRE_COOL_DOWN_CONSTANT: 0.07,
    FILAMENT_HEAT_UP_CONSTANT: 0.03,
    FILAMENT_COOL_DOWN_CONSTANT: 0.03,
    HALF_HEAT_UP_CONSTANT: 0.1,
    HALF_COOL_DOWN_CONSTANT: 0.05,
    ON_HEAT_UP_CONSTANT: 0.05,
    ON_COOL_DOWN_CONSTANT: 0.2,
    
    HINT_TIME: 20,
    
    HINT_BTN_SCALE_FACTOR_ACTIVE: 1.07,
    
    ITEM_INDEX_PENCIL: 0,
    ITEM_INDEX_PROTRACTOR: 1,
    ITEM_INDEX_SCREWDRIVER: 2,
    ITEM_INDEX_NUT_1: 3,
    ITEM_INDEX_NUT_2: 4,
    ITEM_INDEX_SCREW: 5,
    ITEM_INDEX_WIRE: 6,
    
    WIN_RAY_ROTATION_RATE: 0.6,
    WIN_RAY_MIN_SCALE: 0.75,
    WIN_RAY_MAX_SCALE: 0.95,
};

CrackTheCircuit.Boot = function(game) {};

CrackTheCircuit.Boot.prototype = {
    init: function() {
        this.input.maxPointers = 2;
        this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
        
        this.game.renderer.renderSession.roundPixels = true;
        
        var gameContainer = document.getElementById("gameContainer");
        
//        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
//            this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
//            this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
//            
//            gameContainer.style.width = window.innerWidth;
//            gameContainer.style.overflow = "hidden";
//            
//            //gameContainer.style.padding = "0 0 0 -200px";
//        } else {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    
            gameContainer.style.width = "90vw";
            gameContainer.style.height = "86vh";
            gameContainer.style.margin = "0 auto";
        //}

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        
        //Phaser.ScaleManager.SHOW_ALL = 0; //remove later
        
        this.scale.updateLayout(true);
        this.game.scale.refresh();
        
        this.game.input.touch.preventDefault = false;
    },
    
    preload: function() {
        this.game.load.image('blueprint', 'assets/images/blueprint.png');
        this.game.load.image('preloadCircuitOff', 'assets/images/preload/PreloadCircuitOff.png');
    },
    
    create: function() {
        //if(this.game.device.desktop) {
            this.state.start('Preloader');
        //} else {
            //this.game.stage.backgroundColor = CrackTheCircuit.BG_COLOR;
            //this.game.add.sprite(0,0,'mobileMessage');
        //}
    }
}