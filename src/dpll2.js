/**
 * @param {int[][]} cnf
 * @param {int[]} assignment
 * @returns {int[][]}
 */
function _apply(cnf, assignment) {
  let new_cnf = []
  for (let clause of cnf) {
    let new_clause = []
    let skip = false
    for (let atom of clause) {
      if (assignment.includes(atom)) {
        skip = true
        break
      } else if (!assignment.includes(-atom)) {
        new_clause.push(atom)
      }
    }
    if (!skip) new_cnf.push(new_clause)
  }
  return new_cnf
}

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
    cnf = _apply(cnf, assignment)
  if (cnf.length === 0) return assignment
  for (let clause of cnf) {
    if (clause.length === 0) return null
    if (clause.length === 1) return dpll(cnf, assignment.concat([clause[0]]))
  }
  let atom = cnf[0][0]
  return dpll(cnf, assignment.concat([atom])) || dpll(cnf, assignment.concat([-atom]))
}/**/
