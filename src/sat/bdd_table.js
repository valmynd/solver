import {_collect_variables} from "./truthtable"
const isTerminal = (n) => n === 0 || n === 1
const abs = Math.abs
const _and_op = (a, b) => a && b
const _or_op = (a, b) => a || b

/**
 * Ordered and Reduced Binary Decision Diagram (ROBDD)
 * - (ordered) on all paths through the graph the variables respect a given linear order (e.g. x1 < x2 < ... < x10)
 * - (reduced) if
 *    - ∀v ∈ V: s(v) = (l,x,r) ⇒ l≠r
 *    - ∀v,w ∈ V: s(v) = s(w) ⇒ v=w
 * ---------------------
 * Nodes are represented as numbers 0,1,... with 0 and 1 reserved for the terminal nodes
 * Variables in the ordering x1 < x2 < ... xk are represented by their indices 1,2,...,k
 * Two Tables
 *  M: n -> (v,l,r) maps a node n to its three attributes var(n)=v, left(n)=l, right(n)=r
 *  R: (v,l,r) -> n to enable reverse-lookup
 *  // idea: I: n_out -> n_in maps nodes to their respective predecessors
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
    return n
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
    let n, n1n = this.m[n1], n2n = this.m[n2]
    let cmp = this._compare(n1n[0], n2n[0])
    if (isTerminal(n1) && isTerminal(n2)) {
      n = op(n1, n2)
    } else if (!isTerminal(n1) && isTerminal(n2)) {
      n = this._mk(n1n[0],
        this._apply(op, n1n[1], n2),
        this._apply(op, n1n[2], n2))
    } else if (isTerminal(n1) && !isTerminal(n2)) {
      n = this._mk(n2n[0],
        this._apply(op, n1, n2n[1]),
        this._apply(op, n1, n2n[2]))
    } else if (cmp === 0 || n1n[0] === n2n[0]) { // cmp===0 // n1n[0] === n2n[0]
      n = this._mk(n1n[0],
        this._apply(op, n1n[1], n2n[1]),
        this._apply(op, n1n[2], n2n[2]))
    } else if (cmp === -1) { // n1n[0] < n2n[0]
      n = this._mk(n1n[0],
        this._apply(op, n1n[1], n2),
        this._apply(op, n1n[2], n2))
    } else { // cmp === 1 // n1n[0] > n2n[0]
      n = this._mk(n2n[0],
        this._apply(op, n1, n2n[1]),
        this._apply(op, n1, n2n[2]))
    }
    if (more.length === 0) return n
    return this._apply(op, n, more.shift(), ...more)
  }

  and(...operands) {
    let ret = this._apply(_and_op, ...operands)
    console.log("and called with", operands, "return", ret)
    return ret
  }

  or(...operands) {
    let ret = this._apply(_or_op, ...operands)
    console.log("or called with", operands, "return", ret)
    return ret
  }
}

export function cnf2bdd(cnf, order = _collect_variables(cnf)) {
  let bdd = new ROBDD(order)
  bdd.and(...cnf.map(clause => bdd.or(...clause.map(atom => bdd._mk(atom)))))
  return bdd
}

/**
 * Returns one model when the formula is satisfiable
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: model represented as an array of true-assigned variables or null if unsatisfiable
 * @param {int[][]} cnf
 * @returns {int[]}
 */
export function solve(cnf) {
  let bdd = cnf2bdd(cnf)
  let model = []
  let [v, l, r] = bdd.m[2]
  if (r === 1) {

  }
  //return
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

/**
 * Determine whether the formula is satisfiable
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function satisfiable(cnf) {
  return solve(cnf) !== null
}
