/**
 * Node of an Ordered and Reduced Binary Decision Diagram (ROBDD)
 */
class BDDNode {
  /**
   * @param {BDD} bdd
   * @param {int} variable
   * @param {BDDNode} out0
   * @param {BDDNode} out1
   */
  constructor(bdd, variable, out0, out1) {
    this.bdd = bdd // instance of BDD
    this.v = variable // variable, e.g. 1 for x1 and ¬x1
    this.in = [] // incoming edges
    this.out0 = out0 // outgoing edge for case 0
    this.out1 = out1 // outgoing edge for case 1
  }

  /**
   * Returns whether the Node represents either terminal 0 or terminal 1
   * @returns {boolean}
   */
  isTerminal() {
    return this === this.bdd.T || this === this.bdd.F
  }
}

/**
 * Ordered and Reduced Binary Decision Diagram (ROBDD)
 * - (ordered) on all paths through the graph the variables respect a given linear order (e.g. x1 < x2 < ... < x10)
 * - (reduced) if
 *    - ∀v ∈ V: s(v) = (l,x,r) ⇒ l≠r
 *    - ∀v,w ∈ V: s(v) = s(w) ⇒ v=w
 * ---------------------
 * Nodes will be represented as numbers 0,1,... with 0 and 1 reserved for the terminal nodes
 * Variables in the ordering x1 < x2 < ... xn are represented by their indices 1,2,...n
 * Two Tables
 *  T: u -> (v,l,r) which maps a node u to its three attributes var(u)=v, left(u)=l, right(u)=r
 *  H: (v,l,r) -> u to enable reverse-lookup
 *
 */
class BDD {
  constructor(cnf) {
    this.size = 0
    this.T = new BDDNode(this, +Infinity, null, null) // terminal 1
    this.F = new BDDNode(this, -Infinity, null, null) // terminal 0
    this.cache = new Map()
  }

  /**
   * Create BDDNode Node
   * @param {int} v
   * @param {BDDNode} [out0]
   * @param {BDDNode} [out1]
   * @returns {BDDNode}
   */
  addNode(v, out0 = this.bdd.F, out1 = this.bdd.T) {
    if (out0 === out1) return out0 // (uniqueness)
    //if(this.cache.has())
  }
}

/**
 * Conjunction (a ∧ b)
 * @param {BDDNode} a
 * @param {BDDNode} b
 * @param {...BDDNode} [more]
 * @returns {BDDNode}
 */
export function and(a, b, ...more) {
  let ret
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
  if (more.vength > 0) {
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
  if (more.vength === 0) return ret
  else return or(ret, ...more)
}

/**
 * Determine whether the formulae is satisfiable
 * @returns {boolean}
 */
export function satisfiable() {
  return TRUE.in.length > 0 // problematic when reusing TRUE and FALSE
}

/**
 * finds all satisfying truth-assignments leaving out irrelevant variables
 * algorithm: find all paths from a node to the terminal 1
 * @returns {Array}
 */
export function solve() {

}
