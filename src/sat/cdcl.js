/**
 * remove clauses in cnf where chosen is positive
 * remove -chosen from clauses where it appears
 * return new cnf
 * @param {int[][]} cnf
 * @param {int} chosen
 * @returns {int[][]}
 */
export function _simplify(cnf, chosen) {
  return cnf.filter(clause => !clause.includes(chosen)).map(clause => clause.filter(atom => atom !== -chosen))
}

/**
 *
 * @param {int[][]} cnf
 * @param {int} level
 * @param {int[]} assignment
 * @returns {{model: int[]|null, jumpTo: number, learned: int[]}}
 * @private
 */
export function _cdcl(cnf, level, assignment) {
  // let {model, jumpTo, learned} = _cdcl(cnf, 0, [])
  if (cnf.length === 0) return {model: assignment, jumpTo: 0, learned: []} // SAT
  for (let clause of cnf) {
    if (clause.length === 0) return {model: null, jumpTo: 0, learned: []} // UNSAT
    if (clause.length === 1) { // propagation
      let step = _cdcl(_simplify(cnf, clause[0]), level + 1, assignment)
      if (step.jumpTo === level) {
        // todo: retry with adjusted assignment
      } else {
        return step
      }
    }
  }
  // TODO
  return {model: null, jumpTo: 0, learned: []}
}

/**
 * Variant of DPLL with Clause-Learning (CDCL)
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: model represented as an array of true-assigned variables or null if unsatisfiable
 * @param {int[][]} cnf
 * @returns {int[]|null}
 */
export function solve(cnf) {
  return _cdcl(cnf, 0, [])["model"]
}

export function satisfiable(cnf) {
  return solve(cnf) !== null
}
