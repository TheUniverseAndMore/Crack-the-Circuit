function nodeToStr(n) {
  return n[0] + ',' + n[1];
}

// Resistor -------------------------------------------------------------------
function Resistor(x1, y1, x2, y2, value) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.value = value;
}
function resistor_getType() {
  return 'resistor';
}
function resistor_getValue() {
  return this.value;
}
function resistor_getNodes() {
  return [[this.x1, this.y1], [this.x2, this.y2]];
}
Resistor.prototype.getType = resistor_getType;
Resistor.prototype.getValue = resistor_getValue;
Resistor.prototype.getNodes = resistor_getNodes;

// VoltageSource --------------------------------------------------------------
function VoltageSource(x1, y1, x2, y2, value) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.value = value;
}
function vs_getType() {
  return 'voltagesource';
}
function vs_getValue() {
  return this.value;
}
function vs_getNodes() {
  return [[this.x1, this.y1], [this.x2, this.y2]];
}
VoltageSource.prototype.getType = vs_getType;
VoltageSource.prototype.getValue = vs_getValue;
VoltageSource.prototype.getNodes = vs_getNodes;

// ----------------------------------------------------------------------------

// Return the name of the variable associated with the voltage at NODE.
function voltageVariable(node) {
  return 'v[' + nodeToStr(node) + ']';
}

function currentVariable(objIndex) {
  return 'i[' + objIndex + ']';
}

// Simulation-related logic ---------------------------------------------------

function simulateCircuit(objects) {
  // Process the drawing data to associate x-y coordinates with nodes of
  // circuit elements.

  // Determine which nodes are adjacent to which elements.

  // This will be an associative array mapping a node-string to an array of
  // elements that touch that node.
  var nodes = [];
  // We'll add all the real circuit elements to this array.
  for (var objIndex in objects) {
    var obj = objects[objIndex];
    for (var nodeIndex in obj.getNodes()) {
      var node = obj.getNodes()[nodeIndex];
      // Put all the distinct nodes in a hashtable.
      var nodeStr = nodeToStr(node);
      if (!nodes[nodeStr]) {
        nodes[nodeStr] = [];
      }
      nodes[nodeStr].push(obj);
    }
  }

  var system = [];

    // Write an equation for KCL on each node.
    for (var nstr in nodes) {
      var orientations = [];
      var currents = [];
      // Enumerate all placed objects that touch the node.
      for (var objIndex in nodes[nstr]) {
        var obj = nodes[nstr][objIndex];
        // Use the index of the object in objects to uniquely name the
        // associated current variable.
        var objectId = objects.indexOf(obj);
        if (objectId > -1) {
          // Determine the orientation of the current into this object.
          orientations.push((nstr == nodeToStr(obj.getNodes()[0])) ? 1 : -1);
          currents.push('i[' + objectId + ']');
        }
      }
      // sum_currents = 0 when orientations are respected
      system.push(new AffineExpression(orientations, currents, 0));
    }

    // Write a voltage equation on each element.
    for (var objectId in objects) {
      var obj = objects[objectId];
      nodes = obj.getNodes();
      var node1name = voltageVariable(nodes[0]);
      var node2name = voltageVariable(nodes[1]);
      if (obj.getType() == 'resistor') {
        var currentname = 'i[' + objectId + ']';
        // V1 - V2 - R i == 0
        system.push(
          new AffineExpression([1, -1, -obj.getValue()],
                               [node1name, node2name, currentname],
                               0));
      } 
//        else if (obj.getType() == 'wire') {
//        // V1 == V2
//        system.push(new AffineExpression([1, -1], [node1name, node2name], 0));
//      } 
        else if (obj.getType() == 'voltagesource') {
        // V1 - V2 == V_s
        system.push(new AffineExpression([1, -1],[node1name, node2name],obj.getValue()));
      }
    }

    // Ground the first node of the first element (arbitrary)
    var groundVoltageName = voltageVariable(objects[0].getNodes()[0]);
    system.push(new AffineExpression([1], [groundVoltageName], 0));
    
    return solveLinearSystem(system);
}

/********************* EQUATION SYSTEM SOLVER *************************/

var inconsistentSystemError = new Error('inconsistent');

function nearZero(a) {
  return Math.abs(a) < 1e-9;
}

// Represents a linear combination of a number of variables and a constant.
// coeffs: a list of coefficients for the variables in vars.
// vars: a list of strings naming variables.
// c: constant term
function AffineExpression(coeffs, vars, c) {
  this.coeffs = [];
  this.empty = true;
  for (var i in vars) {
    if (!nearZero(coeffs[i])) {
      this.coeffs[vars[i]] = coeffs[i];
      this.empty = false;
    }
  }
  this.constant = c;
}

// Return the coefficient associated with the variable v.
function AE_getCoefficient(v) {
  if (v in this.coeffs) {
    return this.coeffs[v];
  } else {
    return 0;
  }
}

// Return a variable we can pivot on. If this AffineExpression has no
// variables, then return null.
function AE_getLargestPivot() {
  // For numerical stability, choose the largest pivot.
  var maxPivot = 0;
  var pivotVar = null;
  for (var v in this.coeffs) {
    if (Math.abs(this.coeffs[v]) >= maxPivot) {
      maxPivot = Math.abs(this.coeffs[v]);
      pivotVar = v;
    }
  }
  return pivotVar;
}

function AE_getScalarValue() {
  return this.constant;
}

// Return true iff this expression consists of only a constant term (no
// variables).
function AE_isScalar() {
  return this.empty;
}

// Return a new AffineExpression containing the value of v in terms of the
// other variables. Assumes that v has a nonzero coefficient.
function AE_solveFor(v) {
  var newCoeffs = [];
  var newVars = [];
  var vCoeff = this.coeffs[v];
  for (var w in this.coeffs) {
    if (w != v) {
      newVars.push(w);
      newCoeffs.push(-this.coeffs[w] / vCoeff);
    }
  }
  return new AffineExpression(newCoeffs, newVars, -this.constant / vCoeff);
}

// Substitute, in the current expression, the variable V with the expression
// EXPR and return the resulting expression.
function AE_substitute(v, expr) {
  var newCoeffs = [];
  var newConstant = 0;
  var oldVCoeff = 0;
  // Copy the terms over from the existing expression, except for the one
  // we're substituting away.
  for (var w in this.coeffs) {
    if (w == v) {
      oldVCoeff = this.coeffs[w];
    } else {
      newCoeffs[w] = this.coeffs[w];
    }
  }
  newConstant = this.constant;
  // Add the expression to substitute, scaled appropriately.
  for (var x in expr.coeffs) {
    if (x in newCoeffs) {
      newCoeffs[x] += expr.coeffs[x] * oldVCoeff;
    } else {
      newCoeffs[x] = expr.coeffs[x] * oldVCoeff;
    }
  }
  newConstant += expr.constant * oldVCoeff;
  // Construct a new expression.
  var coeffs = [];
  var vars = [];
  for (var y in newCoeffs) {
    vars.push(y);
    coeffs.push(newCoeffs[y]);
  }
  return new AffineExpression(coeffs, vars, newConstant);
}

function AE_toString() {
  var s = '';
  for (var v in this.coeffs) {
    var coeff = this.coeffs[v];
    s += coeff + "*" + v + " + ";
  }
  s += this.constant;
  return s;
}

AffineExpression.prototype.getCoefficient = AE_getCoefficient;
AffineExpression.prototype.getLargestPivot = AE_getLargestPivot;
AffineExpression.prototype.getScalarValue = AE_getScalarValue;
AffineExpression.prototype.isScalar = AE_isScalar;
AffineExpression.prototype.solveFor = AE_solveFor;
AffineExpression.prototype.substitute = AE_substitute;
AffineExpression.prototype.toString = AE_toString;

// Solves a system of simultaneous linear equations. The equations are given by
// X == 0 for each X in SYSTEM (a list of AffineExpressions).
//
// Throw inconsistentSystemError if the system is inconsistent.
//
// Otherwise, return an array with a key for each variable. If the variable has
// a unique solution S, then the associated value is S. Otherwise, if the
// variable is underconstrained, then the associated value is NaN.
function solveLinearSystem(system) {
  var backVars = [];
  var backExprs = [];

  // Perform forward elimination.
  for (var i = 0; i < system.length; i++) {
    var e = system[i];
    var pivotVar = e.getLargestPivot();
    if (pivotVar !== null && !nearZero(e.getCoefficient(pivotVar))) {
      // Eliminate the pivot variable
      var subExpr = e.solveFor(pivotVar);
      // Remember the variable and an expression for it in terms of other
      // variables, for later substitution.
      backVars.push(pivotVar);
      backExprs.push(subExpr);
      // Substitute in all subsequent equations.
      for (var j = i + 1; j < system.length; j++) {
        system[j] = system[j].substitute(pivotVar, subExpr);
      }
    } else {
      // There's no pivot here. We have an equation of the form c == 0,
      // for some constant c. That equation is either a tautology or a
      // contradiction.
      if (nearZero(e.constant)) {
        // This equation is redundant, we'll just ignore it
      } else {
        // This equation yields an inconsistent system!
        throw inconsistentSystemError;
      }
    }
  }
  // Perform back substitution.
  for (var m = backVars.length - 1; m >= 0; m--) {
    for (var n = m + 1; n < backVars.length; n++) {
      backExprs[m] = backExprs[m].substitute(backVars[n], backExprs[n]);
    }
  }
  // Copy the output into a new array and return it.
  var soln = [];
  for (var v in backVars) {
    if (backExprs[v].isScalar()) {
      soln[backVars[v]] = backExprs[v].getScalarValue();
    } else {
      // We don't have an explicit expression that doesn't depend on
      // other variables. This variable is underconstrained.
      soln[backVars[v]] = NaN;
    }
  }

  return soln;
}