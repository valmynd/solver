import {_collect_variables} from "./truthtable"
const isTerminal = (n) => n === 0 || n === 1
const abs = Math.abs
const _and_op = (a, b) => a && b
const _or_op = (a, b) => a || b
const _xor_op = (a, b) => a !== b
const _eq_op = (a, b) => a === b

/**
 * Ordered and Reduced Binary Decision Diagram (ROBDD)
 * - (ordered) on all paths through the graph the variables respect a given linear order (e.g. x1 < x2 < ... < x10)
 * - (reduced) if
 *    - ∀v ∈ V: s(v) = (l,x,r) ⇒ l≠r
 *    - ∀v,w ∈ V: s(v) = s(w) ⇒ v=w
 * ---------------------
 * Nodes are represented as numbers 0,1,... with 0 and 1 reserved for the terminal nodes
 * Variables in the ordering x1 < x2 < ... xk are represented by their indices 1,2,...,k
 * Three Tables
 *  M: n -> (v,l,r) maps a node n to its three attributes var(n)=v, left(n)=l, right(n)=r
 *  R: (v,l,r) -> n to enable reverse-lookup
 *  P: n_out -> [n_in] maps nodes to their respective predecessors
 */
export class ROBDD {
  /**
   * @param {int[]} variables_in_order
   */
  constructor(variables_in_order) {
    this.order = variables_in_order
    this.m = { // n -> (v,l,r)
      0: ["F", "F", "F"], // terminal 0
      1: ["T", "T", "T"]  // terminal 1
    }
    this.r = { // (v,l,r) -> n
      "F|F|F": 0, // terminal 0
      "T|T|T": 1  // terminal 1
    }
    this.p = {} // n_out -> [n_in] (enable reconstruction of paths from terminal 1 to solutions)
    this.size = 0 // gets incremented for every created node; for now we have two terminal nodes (+2 in _mk())
  }

  /**
   * Create a BDD Node
   * @param {int} v
   * @param {int} l
   * @param {int} r
   * @returns {int}
   */
  _mk(v, l = 0, r = 1) {
    if (l === r) return l
    if (v < 0) {
      v = abs(v)
      let tmp = l
      l = r
      r = tmp
    }
    let key = v + "|" + l + "|" + r, existing = this.r[key]
    if (existing !== undefined) return existing
    let n = 2 + this.size++
    this.m[n] = [v, l, r]
    this.r[key] = n
    this._store_predecessor(l, v, n)
    this._store_predecessor(r, v, n)
    return n
  }

  /**
   * store predecessor if it actually is a predecessor
   * @param {int} lr (either l or r in M: n -> (v,l,r))
   * @param {int} v (v in M: n -> (v,l,r))
   * @param {int} n (n in M: n -> (v,l,r))
   */
  _store_predecessor(lr, v, n) {
    let doStore = false, o = this.order
    if (lr === 1) doStore = (v === o[o.length - 1]) // variable is the last one in the list of ordered variables
    else if (lr !== 0) doStore = (o.indexOf(this.m[lr][0]) === o.indexOf(v) + 1) // the variable is the previous one
    if (doStore) {
      let predecessors = this.p[lr]
      if (predecessors === undefined) this.p[lr] = [n]
      else predecessors.push(n)
    }
  }

  /**
   * returns -1 if the first variable comes before the second variable
   * returns +1 if the second variable comes before the first variable
   * returns 0 if both variables are equivalent (or not variables at all)
   * @param {int} v1
   * @param {int} v2
   * @returns {int}
   */
  _compare(v1, v2) {
    let i1 = this.order.indexOf(v1)
    let i2 = this.order.indexOf(v2)
    if (i1 < i2) return -1
    if (i1 > i2) return 1
    else return 0
  }

  /**
   * Apply custom operator (given by a JS-Function)
   * Based on Shannon Expansion
   * @param {function} op
   * @param {int} n1
   * @param {int} n2
   * @param {...int} [more]
   * @returns {int}
   */
  _apply(op, n1 = 0, n2 = 0, ...more) {
    let n, [v1, l1, r1] = this.m[n1], [v2, l2, r2] = this.m[n2]
    let cmp = this._compare(v1, v2)
    if (isTerminal(n1) && isTerminal(n2)) {
      n = op(n1, n2)
    } else if (!isTerminal(n1) && isTerminal(n2)) {
      n = this._mk(v1,
        this._apply(op, l1, n2),
        this._apply(op, r1, n2))
    } else if (isTerminal(n1) && !isTerminal(n2)) {
      n = this._mk(v2,
        this._apply(op, n1, l2),
        this._apply(op, n1, r2))
    } else if (cmp === 0 || v1 === v2) { // cmp===0 // v1 === v2
      n = this._mk(v1,
        this._apply(op, l1, l2),
        this._apply(op, r1, r2))
    } else if (cmp === -1) { // v1 < v2
      n = this._mk(v1,
        this._apply(op, l1, n2),
        this._apply(op, r1, n2))
    } else { // cmp === 1 // v1 > v2
      n = this._mk(v2,
        this._apply(op, n1, l2),
        this._apply(op, n1, r2))
    }
    if (more.length === 0) return n
    return this._apply(op, n, more.shift(), ...more)
  }

  and(...operands) { // a ∧ b
    if (operands.length === 1) operands[1] = 1 // thus and(or(1,-1)) should compute the same as or(1,-1)
    return this._apply(_and_op, ...operands)
  }

  or(...operands) { // a ∨ b
    return this._apply(_or_op, ...operands)
  }

  xor(...operands) { // a ⊕ b
    return this._apply(_xor_op, ...operands)
  }

  not(a) { // ¬a
    if (a === 0) return 1
    if (a === 1) return 0
    let [v, l, r] = this.m[a]
    return this._mk(v, this.not(l), this.not(r))
  }

  implies(a, b) { // (a → b)
    return this.or(this.not(a), b) // a → b ≡ ¬a ∨ b
  }

  eq(a, b) { // a ↔ b
    return this.and(this.implies(a, b), this.implies(b, a))
    //return this._apply(_eq_op, a, b)
  }

  /**
   * insert formula in Conjunctive Normal Form (CNF) into the BDD
   * @param {int[][]} cnf
   * @returns {int}
   */
  cnf(cnf) {
    return this.and(...cnf.map(clause => this.or(...clause.map(atom => this._mk(atom)))))
  }
}

/**
 * Determine whether the formula is satisfiable
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function satisfiable(cnf) {
  let bdd = new ROBDD(_collect_variables(cnf))
  return bdd.cnf(cnf) !== 0
}

/**
 * Returns one model when the formula is satisfiable
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: model represented as an array of true-assigned variables or null if unsatisfiable
 * @param {int[][]} cnf
 * @returns {int[]}
 */
export function solve(cnf) {
  let bdd = new ROBDD(_collect_variables(cnf))
  bdd.cnf(cnf)
  if (bdd.p[1] === undefined) return null
  let model = [], n = 1, predecessors
  while (predecessors = bdd.p[n]) {
    let [v, l, r] = bdd.m[predecessors[0]]
    if (n === r) model.push(v)
    if (n === l) model.push(-v)
    n = predecessors[0]
  }
  return model
}

/**
 * Returns all models when the formula is satisfiable
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: array of models represented as arrays of true-assigned variables (empty if unsatisfiable)
 * @param {int[][]} cnf
 * @returns {int[][]}
 */
export function solveAll(cnf) {
}
