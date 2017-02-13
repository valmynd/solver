import {_simplify} from "./sat/dpll_simple"
import {solveAll} from "./sat/truthtable"
export const str = json => JSON.stringify(json)

export function assignment2array(assignment_as_map) {
  return [...assignment_as_map.keys()].map(k => (assignment_as_map.get(k) === 1) ? k : -k)
}

export function assignment2map(assignment_as_array) {
  let map = new Map()
  assignment_as_array.forEach(l => map.set(Math.abs(l), ((l > 0) ? 1 : 0)))
  return map
}

/**
 * @param {int[][]} cnf
 * @returns {int[]}
 */
export function _collect_variables(cnf) {
  let variables = new Set()
  cnf.forEach(clause => clause.forEach(atom => variables.add(Math.abs(atom))))
  return [...variables].sort()
}

/**
 * Check if an assignment is a valid model for a formula
 * @param {int[]} assignment
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function isModel(assignment, cnf) {
  for (let i in assignment) {
    cnf = _simplify(cnf, assignment[i])
  }
  return cnf.length === 0
}

/**
 * Checks two formulas for Equivalence
 * Two formulas are equivalent iff their sets of models are equal, e.g. Mod(F) = Mod(G)
 * @param {int[][]} cnf1
 * @param {int[][]} cnf2
 * @returns {boolean}
 */
export function equivalent(cnf1, cnf2) {
  return str(solveAll(cnf1)) === str(solveAll(cnf2))
}
