/* based on ROBB introduction/assignment paper by H.R. Andersen and solution code written by C. Chedeau
 * http://blog.vjeux.com/2011/project/javascript-binary-decision-diagram.html */

let _cache = {} // FIXME memory-leak
let _and_cache = {} // FIXME memory-leak
let _constructor_calls = 0

// ideas: context with separate caches, in-edges for every nodes

/**
 * Instances of BDDNode are Nodes of an Ordered and
 * Reduced Binary Decision Diagram (ROBDD)
 */
class BDDNode {
  /**
   * @param {string} v
   * @param {BDDNode} out0
   * @param {BDDNode} out1
   */
  constructor(v, out0, out1) {
    this.v = v // label (e.g. "x1")
    this.in = [] // incoming edges
    this.out0 = out0 // outgoing edge for case 0
    this.out1 = out1 // outgoing edge for case 1
    this.n = _constructor_calls++
  }

  /**
   * Returns whether the Node represents either terminal 0 or terminal 1
   * @returns {boolean}
   */
  isFinal() {
    return this === TRUE || this === FALSE
  }
}

export const FALSE = new BDDNode('0', null, null) // terminal 0
export const TRUE = new BDDNode('1', null, null) // terminal 1

/**
 * Create BDDNode Node
 * @param {string} v
 * @param {BDDNode} [out0]
 * @param {BDDNode} [out1]
 * @returns {BDDNode}
 */
export function make(v, out0 = FALSE, out1 = TRUE) {
  if (out0 === out1) return out0
  let key = [out0.n, v, out1.n].join("|")
  let stored = _cache[key]
  if (stored !== undefined) return stored
  let bdd = new BDDNode(v, out0, out1)
  _cache[key] = bdd
  return bdd
}

/**
 * Conjunction (a ∧ b)
 * @param {BDDNode} a
 * @param {BDDNode} b
 * @param {...BDDNode} [more]
 * @returns {BDDNode}
 */
export function and(a, b, ...more) {
  let ret, key = [a.n, b.n].join("|")
  let stored = _and_cache[key]
  if (stored !== undefined && stored[0] === a && stored[1] === b) {
    return stored[2]
  }
  if (a === b) {
    ret = a
  } else if (a === FALSE || b === FALSE) {
    ret = FALSE
  } else if (a === TRUE) {
    ret = b
  } else if (b === TRUE) {
    ret = a
  } else if (a.v === b.v) {
    ret = make(a.v, and(a.out0, b.out0), and(a.out1, b.out1))
  } else if (a.v < b.v) {
    ret = make(a.v, and(a.out0, b), and(a.out1, b))
  } else { // a.v > b.v
    ret = make(b.v, and(a, b.out0), and(a, b.out1))
  }
  _and_cache[key] = [a, b, ret]
  if (more.length > 0) {
    return and(ret, more.shift(), ...more)
  }
  return ret
}


/**
 * Disjunction (a ∨ b)
 * @param {BDDNode} a
 * @param {BDDNode} b
 * @param {...BDDNode} [more]
 * @returns {BDDNode}
 */
export function or(a, b, ...more) {
  let ret
  if (a === b) {
    ret = a
  } else if (a === TRUE || b === TRUE) {
    ret = TRUE
  } else if (a === FALSE) {
    ret = b
  } else if (b === FALSE) {
    ret = a
  } else if (a.v === b.v) {
    ret = make(a.v, or(a.out0, b.out0), or(a.out1, b.out1))
  } else if (a.v < b.v) {
    ret = make(a.v, or(a.out0, b), or(a.out1, b))
  } else { // a.v > b.v
    ret = make(b.v, or(a, b.out0), or(a, b.out1))
  }
  if (more.length > 0) {
    return or(ret, more.shift(), ...more)
  }
  return ret
}

/**
 * Apply custom operator (given by a JS-Function)
 * @param {function} op
 * @param {BDDNode} a
 * @param {BDDNode} b
 * @param {...BDDNode} [more]
 * @returns {BDDNode}
 */
export function apply(op, a, b, ...more) {
  let ret
  if (a.isFinal() && b.isFinal()) {
    ret = op(a === TRUE, b === TRUE) ? TRUE : FALSE
  } else if (!a.isFinal() && b.isFinal()) {
    ret = make(a.v, apply(op, a.out0, b), apply(op, a.out1, b))
  } else if (a.isFinal() && !b.isFinal()) {
    ret = make(b.v, apply(op, a, b.out0), apply(op, a, b.out1))
  } else if (a.v === b.v) {
    ret = make(a.v, apply(op, a.out0, b.out0), apply(op, a.out1, b.out1))
  } else if (a.v < b.v) {
    ret = make(a.v, apply(op, a.out0, b), apply(op, a.out1, b))
  } else { // a.v > b.v
    ret = make(b.v, apply(op, a, b.out0), apply(op, a, b.out1))
  }
  if (more.length > 0) {
    return apply(op, ret, more.shift(), ...more)
  }
  return ret
}

/**
 * Exclusive Disjunction (a ⊕ b)
 * @param {BDDNode} a
 * @param {BDDNode} b
 * @param {...BDDNode} [more]
 * @returns {BDDNode}
 */
export function xor(a, b, ...more) {
  let op = (a, b) => a !== b
  return apply(op, a, b, ...more)
}

/**
 * Negation (¬a)
 * @param {BDDNode} a
 * @returns {BDDNode}
 */
export function not(a) {
  if (a.isFinal()) return a === TRUE ? FALSE : TRUE
  return make(a.v, not(a.out0), not(a.out1))
}

/**
 * Implication (a → b)
 * @param {BDDNode} a
 * @param {BDDNode} b
 * @returns {BDDNode}
 */
export function implies(a, b) {
  return or(not(a), b) // a→b ≡ a∨¬b
}

/**
 * Equivalence (a ↔ b)
 * @param {BDDNode} a
 * @param {BDDNode} b
 * @returns {BDDNode}
 */
export function eq(a, b) {
  return or(and(a, b), and(not(a), not(b))) // a↔b ≡ (a∧b)∨(¬a∧¬b)
}

let _assign = (a, values) => {
  if (a.isFinal()) return a
  if (a.v in values) {
    if (values[a.v] === TRUE) return a.out1
    else return a.out0
  }
  return make(a.v, _assign(a.out0, values), _assign(a.out1, values))
}

/**
 * Existential Quantification (∃x: P)
 * ∃x: P(x) means there is at least one x such that P(x) is true
 * @param {string} x (variable_name)
 * @param {BDDNode} P
 * @returns {BDDNode}
 */
export function exists(x, P) {
  let values_true = {[x]: TRUE}, values_false = {[x]: FALSE}
  return or(_assign(P, values_true), _assign(P, values_false))
}

/**
 * Universal Quantification (∀x: P(x))
 * ∀x: P(x) means P(x) is true for all x
 * @param {string} x (variable_name)
 * @param {BDDNode} P
 * @returns {BDDNode}
 */
export function forAll(x, P) {
  let values_true = {[x]: TRUE}, values_false = {[x]: FALSE}
  return and(_assign(P, values_true), _assign(P, values_false))
}


/**
 * Determine whether the formulae is satisfiable
 * @returns {boolean}
 */
export function satisfiable() {
  return TRUE.in.length > 0
}

/**
 * finds all satisfying truth-assignments leaving out irrelevant variables
 * algorithm: find all paths from a node to the terminal 1
 * @returns {Array}
 */
export function solve() {

}
