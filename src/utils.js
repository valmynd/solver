import {_simplify} from "./sat/dpll_simple"

export function assignment2array(assignment_as_map) {
  return [...assignment_as_map.keys()].map(k => (assignment_as_map.get(k) === 1) ? k : -k)
}

export function assignment2map(assignment_as_array) {
  let map = new Map()
  assignment_as_array.forEach(l => map.set(Math.abs(l), ((l > 0) ? 1 : 0)))
  return map
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
