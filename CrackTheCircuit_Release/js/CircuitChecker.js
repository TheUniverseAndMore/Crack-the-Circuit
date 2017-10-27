CircuitChecker = function (game) {
    Phaser.Group.call(this, game);
    
    this.levelNum;
    this.numSwitches;
    this.numBulbs;
    
    this.correctBehavior;
    
    this.switchStates = null;
    this.bulbStates = null;
    
    this.errorThreshold = 0.05; //how close can the power be to count as correct?
};

CircuitChecker.prototype = Object.create(Phaser.Group.prototype);
CircuitChecker.prototype.constructor = CircuitChecker;

CircuitChecker.prototype.updateWithGameData = function(gameData) {
    this.levelNum = gameData.levelNum;
    this.numSwitches = gameData.numSwitches;
    this.numBulbs = gameData.numBulbs;
    this.correctBehavior = gameData.correctBehavior.slice(this.numSwitches);
};

//////// CHECKING CIRCUIT /////////

//const permutator = (inputArr) => { //for permuting bulb arrays
//      let result = [];
//      const permute = (arr, m = []) => {
//        if (arr.length === 0) {
//          result.push(m)
//        } else {
//          for (let i = 0; i < arr.length; i++) {
//            let curr = arr.slice();
//            let next = curr.splice(i, 1);
//            permute(curr.slice(), m.concat(next))
//         }
//       }
//     }
//     permute(inputArr)
//     return result;
//}

var permutator = (function(inputArr){
    var result = [];
    var permute = (function(arr, m){
        if (m === undefined || m == null) m = [];
        //   var m = [];
        if (arr.length === 0){
            result.push(m)
        } else {
            for (var i = 0; i < arr.length; i++) {
                var curr = arr.slice();
                var next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    });
 
    permute(inputArr);
    return result;
});

CircuitChecker.prototype.isCorrect = function(allCircuits) {
    var actualPermutations = permutator(allCircuits);
    var areCircuitsAnalogous;
    for(var i = 0; i < actualPermutations.length; i++) {
       areCircuitsAnalogous = true;
       for(var j = 0; j < actualPermutations[i].length; j++) {
           if(areCircuitsAnalogous && this.areTwoArraysEqual(actualPermutations[i][j],this.correctBehavior[j])) {
                continue; }   
           else {
                areCircuitsAnalogous = false; }
       }
       if(areCircuitsAnalogous) {
           return true; }
        
       if(this.numSwitches == 2) { //reverse which switches it called '1' and '2' and  check again
           areCircuitsAnalogous = true;
           for(var j = 0; j < actualPermutations[i].length; j++) {
               if(areCircuitsAnalogous && this.areTwoArraysSwitchAnalogous(actualPermutations[i][j],this.correctBehavior[j])) {
                    continue; }
               else {
                    areCircuitsAnalogous = false; }
           }
           if(areCircuitsAnalogous) {
               return true; }
       }
    }
    return false;
};

CircuitChecker.prototype.areTwoArraysEqual = function(array1,array2) {
    for(var i = 0; i < array1.length; i++) {
        
        console.log("1: "+array1[i] +" 2: " +array2[i]);
        
        if((array1[i] == 0) != (array2[i] == 0) || Math.abs(array1[i] - array2[i]) > this.errorThreshold) {
            return false;
        }
    }

    return true;
};

CircuitChecker.prototype.areTwoArraysSwitchAnalogous = function(array1,array2) {
    for(var i = 0; i < array1.length; i++) {
        // default switch arrays are [0,1,0,1] and [0,0,1,1]
        if(i == 0 || i == 3) { //first index and last index are symmetrical - doesn't make a difference
            if((array1[i] == 0) != (array2[i] == 0) || Math.abs(array1[i] - array2[i]) > this.errorThreshold) {
                return false; }
        }
        else if(i == 1) {
            if((array1[1] == 0) != (array2[2] == 0) || Math.abs(array1[1] - array2[2]) > this.errorThreshold) {
                return false; }
        }
        else if(i == 2) {
            if((array1[2] == 0) != (array2[1] == 0) || Math.abs(array1[2] - array2[1]) > this.errorThreshold) {
                return false; }
        }
    }
    return true;
};

///////// RESET FOR NEW LEVEL //////////

CircuitChecker.prototype.resetWithLevelData = function(newLevelData) {
    this.levelNum = newLevelData.levelNum;
    this.numSwitches = newLevelData.numSwitches;
    this.numBulbs = newLevelData.numBulbs;
    this.correctBehavior = newLevelData.correctBehavior.slice(this.numSwitches);
};