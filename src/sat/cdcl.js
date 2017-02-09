import {_simplify} from "./dpll_simple"
import {_unit, _conflicting} from "./dpll_verbose"
import {_collect_variables} from "./truthtable"
const abs = Math.abs
const max = Math.max


/**
 * @param {int[][]} cnf
 * @param {Map} assignment
 * @returns {{clause:int[],literal:int}|null}
 */
function _find_unit(cnf, assignment) {
  for (let clause of cnf) {
    let literal = _unit(clause, assignment)
    if (literal !== null) return {clause, literal}
  }
  return null
}

/**
 * @param {int[][]} cnf
 * @param {Map} assignment
 * @returns {{clause:int[],literal:int}|null}
 */
function _find_conflict(cnf, assignment) {
  for (let clause of cnf) {
    let literal = _conflicting(clause, assignment)
    if (literal !== null) return {clause, literal}
  }
  return null
}

class ImplicationGraph {
  constructor() {
    this.nodes = new Map() // mapping of nodes to the level they where set
    this.edges = new Map() // map nodes to their incoming nodes
  }

  addNode(variable, value, level) {
    let key = (value === 0) ? -variable : variable
    this.nodes.set(key, level)
  }

  addEdge(variableFrom, valueFrom, variableTo, valueTo) {
    let key1 = (valueFrom === 0) ? -variableFrom : variableFrom
    let key2 = (valueTo === 0) ? -variableTo : variableTo
    if (this.edges.has(key2)) this.edges.get(key2).push(key1)
    else this.edges.set(key2, [key1])
  }

  cut(variable) {
    let incomingByLevel = new Map()
    if (this.edges.has(variable)) {
      for (let incoming of this.edges.get(variable)) {
        let level = this.nodes.get(incoming)
        if (incomingByLevel.has(level)) incomingByLevel.get(level).add(incoming)
        else incomingByLevel.set(level, new Set())
      }
    }
    if (this.edges.has(-variable)) {
      for (let v of this.edges.get(-variable)) {
        let level = this.nodes.get(v)
        if (incomingByLevel.has(level)) incomingByLevel.get(level).add(v)
        else incomingByLevel.set(level, new Set())
      }
    }
    if (incomingByLevel.size === 0) return null
    let maxLevel = max(...incomingByLevel.keys())
    return incomingByLevel.get(maxLevel)
  }
}

/**
 * If there is a Unit Clause, propagate it's literal and check if that leads to a conflict
 * If propagation leads to a conflict, return the literal of the Unit Clause, otherwise return null
 * Algorithm:
 * UnitPropagation(Formula φ, Assignment θ, implication-graph G, level d)
 *  while φ[θ] contains unit-clauses do
 *    let K = (l) the first unit-clause in φ[θ]                                      // K... unit clause containing l
 *    is l = ¬x, then set a := 0, otherwise a := 1                                   // l... unit literal
 *    θ := θ ∪ {x = a}
 *    let K = (l ∨ l_1 ∨ ... ∨ l_k) the clause in φ (without applied assignment)    // K from above but without l
 *    add node (x=a) to G and set mark(x=a) = d
 *    add vertices (u,(x=a)) to G, provided that u falsifies l_i, 1 ≤ i ≤ k
 *  if θ |≠ φ return CONFLICT
 * @param {int[][]} cnf
 * @param {Map} assignment
 * @param {ImplicationGraph} implication_graph
 * @param {int} level
 * @returns {{clause:int[],literal:int}|null}
 */
export function _unit_prop(cnf, assignment, implication_graph, level) {
  let unit, conflict
  while (unit = _find_unit(cnf)) {
    let l = unit.literal, v = abs(l), a = (l < 0) ? 0 : 1
    assignment.set(v, a)
    implication_graph.addNode(v, a, level)
    for (let atom of unit.clause) {
      if (atom !== l) implication_graph.addEdge(abs(atom), assignment.get(abs(atom)), v, a)
    }
    if (conflict = _find_conflict(cnf, assignment)) {
      implication_graph.addNode(v, -a, level)
      for (let atom of conflict.clause) {
        if (atom !== conflict.literal) implication_graph.addEdge(abs(atom), assignment.get(abs(atom)), v, -a)
      }
      return conflict // CONFLICT
    }
  }
  return null // NO CONFLICT
}

/**
 * Variant of DPLL with Conflict-Driven Clause-Learning (CDCL)
 * Algorithm:
 * Input: Formula φ
 * set implication-graph G = (Ø,Ø), level d = 0, assignment θ = Ø
 * if UnitPropagation(φ,θ,G,d) = CONFLICT return UNSAT
 * else
 *    while φ[θ] ≠ Ø do
 *        d++
 *        set next Variable v to Value a (decide between 0 and 1) and update θ
 *        add node (v=a) to G and set mark(v=a) = d
 *        while UnitPropagation(φ,θ,G,d) returns CONFLICT do
 *            determine cut in G and conflict clause K
 *            {u_1...u_n} ... vertices that falsify l_i, 1 ≤ i ≤ k
 *            b = max{mark(u_i) | 1 ≤ i ≤ k}
 *            if b == 0 return UNSAT
 *            else
 *                remove all u from V and θ with mark(u) ≥ b
 *                set φ := φ ∪ {K}, d--
 *        d++
 *    return SAT
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: model represented as an array of true-assigned variables or null if unsatisfiable
 * @param {int[][]} cnf
 * @returns {int[]|null}
 */
export function solve(cnf) {
  let implication_graph = new ImplicationGraph(), level = 0, assignment = new Map(), conflict
  if (_unit_prop(cnf, assignment, implication_graph, level)) return null // UNSAT
  let unassigned_variables = _collect_variables(cnf)
  while (unassigned_variables.length > 0 /*φ[θ] ≠ Ø*/) {
    level++
    let v = unassigned_variables.shift(), a = 1 // a could also set it to 0
    assignment.set(v, a)
    implication_graph.addNode(v, a, level)
    while (conflict = _unit_prop(cnf, assignment, implication_graph, level)) {
      // determine cut in G and conflict clause K
      let cut = implication_graph.cut(conflict.literal)
      // todo: {u_1...u_n} ... vertices that falsify l_i, 1 ≤ i ≤ k
      let b = undefined // todo: b = max{mark(u_i) | 1 ≤ i ≤ k}
      if (b === 0) return null // UNSAT
      // todo: remove all u from V and θ with mark(u) ≥ b
      cnf.push(conflict_clause)
      level--
    }
    level++
  }
}

export function satisfiable(cnf) {
  return solve(cnf) !== null
}
