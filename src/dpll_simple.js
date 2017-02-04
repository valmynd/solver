// Terminology
// - two types of assignments
//    1. propagation: when the algorithm can detect that a certain variable must be set to a certain value
//    2. assumption: variable must be set to a certain value to be able to compute further (synonym: decide)
// DPLL divides the problem into sub-problems, one where the latest assumption holds and one where it does not

/**
 * remove clauses in cnf where chosen is positive
 * remove -chosen from clauses where it appears
 * return new cnf
 * @param {int[][]} cnf
 * @param {int} chosen
 * @returns {int[][]}
 */
export function _simplify(cnf, chosen) {
  let new_cnf = []
  for (let clause of cnf) {
    let new_clause = []
    let skip = false
    for (let atom of clause) {
      if (atom === chosen) {
        skip = true
        break
      } else if (atom !== -chosen) {
        new_clause.push(atom)
      }
    }
    if (!skip) new_cnf.push(new_clause)
  }
  return new_cnf
}

export function _simplify2(cnf, chosen) {
  for (let c in cnf) {
    for (let a in cnf[c]) {
      if (cnf[c][a] === chosen) {
        cnf[c] = undefined
      } else if (cnf[c][a] !== -chosen) {
        cnf[c][a] = undefined
      }
    }
  }
  return cnf
}


let step = 0
/**
 * Simple Variant of DPLL that uses variable-elimination to determine whether the formula is satisfiable
 * Algorithm:
 *  if cnf has no clauses, return true
 *  if cnf has an empty clause, return false
 *  if cnf contains a unit clause, return sat(simplify(cnf, literal))
 *  v <- choose a variable in cnf
 *  if sat(simplify(cnf, v)) is true, return true
 *  else return sat(simplify(cnf, -v)
 * Source and Explanation:
 *  https://www.youtube.com/watch?v=ENHKXZg-a4c (Lecture by Wheeler Ruml, English)
 *  https://www.youtube.com/watch?v=keILzTb0Soo (Tutorial by Morpheus Tutorials, German)
 * Input: Formula in Conjunctive Normal Form (CNF) with each Variable being represented as
 * an integer (e.g. x1 represented as 1, x2 represented as 2, negated x1 represented as -1)
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function satisfiable(cnf) {
  console.log(++step, cnf)
  if (cnf.length === 0) return true
  for (let clause of cnf) {
    if (clause.length === 0) return false
    if (clause.length === 1) return satisfiable(_simplify(cnf, clause[0]))
  }
  let atom = cnf[0][0]
  return satisfiable(_simplify(cnf, atom)) || satisfiable(_simplify(cnf, -atom))
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
export function solve(cnf, assignment = []) {
  if (cnf.length === 0) return assignment
  for (let clause of cnf) {
    if (clause.length === 0) return null
    if (clause.length === 1) return solve(_simplify(cnf, clause[0]), [...assignment, clause[0]])
  }
  let atom = cnf[0][0]
  return solve(_simplify(cnf, atom), [...assignment, atom]) || solve(_simplify(cnf, -atom), [...assignment, -atom])
}
