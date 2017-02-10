import {_simplify} from "./sat/dpll_simple"

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
