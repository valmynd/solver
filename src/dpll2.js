import {_simplify} from "./dpll1";

/**
 * Simple Variant of DPLL that returns a model when the formula is satisfiable
 * Input:
 *  - formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 *  - (internally/optionally) array of true-assigned variables
 * Output:
 *  - model represented as an array of true-assigned variables or null if unsatisfiable
 * @param {int[][]} cnf
 * @param {int[]} [assignment]
 * @returns {int[]|null}
 */
export function dpll(cnf, assignment = []) {
  if (assignment.length > 0)
    cnf = _simplify(cnf, assignment[assignment.length - 1])
  if (cnf.length === 0) return assignment
  for (let clause of cnf) {
    if (clause.length === 0) return null
    if (clause.length === 1) return dpll(cnf, assignment.concat([clause[0]]))
  }
  let atom = cnf[0][0]
  return dpll(cnf, assignment.concat([atom])) || dpll(cnf, assignment.concat([-atom]))
}
