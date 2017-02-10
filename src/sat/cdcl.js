import {_simplify} from "./dpll_simple"
import {_unit, _conflicting} from "./dpll_verbose"
import {_collect_variables} from "./truthtable"
const abs = Math.abs
const max = Math.max
const min = Math.min

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
 * @returns {int[]}
 */
function _find_conflict(cnf, assignment) {
  for (let clause of cnf) {
    if (_conflicting(clause, assignment)) return clause
  }
  return null
}

class ImplicationGraph {
  constructor() {
    this.nodes = new Map() // mapping of nodes to the level they where set
    this.edges = new Map() // map nodes to their predecessors
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

  getPredecessors(variable, value) {
    let key = (value === 0) ? -variable : variable, predecessors = this.edges.get(key)
    return (predecessors === undefined) ? [] : predecessors
  }

  cut(variable) {
    // maybe navigating back to a node that is common on both paths is necessary?
    // e.g. conflict-node -5 has one incoming edge from -4, but -4 is no predecessors of +5
    return [...new Set([...this.getPredecessors(variable, 0), ...this.getPredecessors(variable, 1)])]
  }
}

/**
 * If there is a Unit Clause, propagate it's literal and check if that leads to a conflict
 * If propagation leads to a conflict, return the conflicting variable, otherwise return null
 * Algorithm:
 * UnitPropagation(Formula φ, Assignment θ, implication-graph G, level d)
 *  while φ[θ] contains unit-clauses do
 *    let K = (l) the first unit-clause in φ[θ]                                      // K... unit clause containing l
 *    is l = ¬x, then set a := 0, otherwise a := 1                                   // l... unit literal
 *    θ := θ ∪ {x = a}
 *    let K = (l ∨ l_1 ∨ ... ∨ l_k) the clause in φ (without applied assignment)    // (K without variable-elimination)
 *    add node (x=a) to G and set mark(x=a) = d
 *    add vertices (u,(x=a)) to G, provided that u falsifies l_i, 1 ≤ i ≤ k
 *  if θ |≠ φ return CONFLICT
 * @param {int[][]} cnf
 * @param {Map} assignment
 * @param {ImplicationGraph} implication_graph
 * @param {int} level
 * @returns {int|null}
 */
export function _unit_prop(cnf, assignment, implication_graph, level) {
  let unit, conflict_clause
  while (unit = _find_unit(cnf)) {
    let l = unit.literal, v = abs(l), a = (l < 0) ? 0 : 1
    assignment.set(v, a)
    implication_graph.addNode(v, a, level)
    for (let atom of unit.clause) {
      if (atom !== l) implication_graph.addEdge(abs(atom), assignment.get(abs(atom)), v, a)
    }
    if (conflict_clause = _find_conflict(cnf, assignment)) {
      implication_graph.addNode(v, -a, level)
      for (let atom of conflict_clause) {
        if (atom !== l) implication_graph.addEdge(abs(atom), assignment.get(abs(atom)), v, -a)
      }
      return v // CONFLICT
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
 *        while UnitPropagation(φ,θ,G,d) returns CONFLICT do          // _unit_prop() returns conflicting variable
 *            determine cut in G and conflict clause K                // better call it to-be-learned clause or sth.
 *            let {u_1...u_k} = nodes that cause the conflict
 *            b = max{mark(u_i) | 1 ≤ i ≤ k}                          // determine max level of conflict-causing nodes
 *            if b == 0 return UNSAT
 *            else
 *                remove all u from V and θ with mark(u) ≥ b          // delete nodes with level >= b
 *                set φ := φ ∪ {K}, d--                               // add learned clause to cnf; level--
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
      // determine cut in G and conflict clause K (terminology is a bit misleading here, K != conflict.clause)
      let new_clause = implication_graph.cut(conflict)
      let max_level = max(...new_clause.map(node => implication_graph.nodes.get(node)))
      if (max_level === 0) return null // UNSAT
      // remove all u from V and θ with mark(u) ≥ b
      for (let [node, level] of implication_graph.nodes) {
        if (level >= max_level) {
          implication_graph.nodes.delete(node)
          for (let [from, to] of implication_graph.edges) {
            if (node === from || node === to) implication_graph.edges.delete(from)
          }
        }
      }
      cnf.push(new_clause) // learn as new clause
      level--
    }
    level++
  }
}

export function satisfiable(cnf) {
  return solve(cnf) !== null
}
