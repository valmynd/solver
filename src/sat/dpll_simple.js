// Terminology
// - two types of assignments
//    1. propagation: when the algorithm can detect that a certain variable must be set to a certain value
//    2. assumption: variable must be set to a certain value to be able to compute further (synonym: decide)
// - mathematical notation:
//   - b : V → {0,1}             // b...Assignment, V... Variable, {0,1}... Value Range (true, false)
//   - b |= F ≡ val(F, b) = 1    // b|=F... is a Model of F, F... Formula, val(F,b)... Value of F when b is given
//   - Mod(F) = {b | b |= F}     // Mod(F)... Collection of Models of the Formula
// - a formula is satisfiable iff Mod(F) ≠ Ø  // Ø... empty set
// - two formulas F and G are equivalent iff Mod(F) = Mod(G) // iff... if and only if
//    - for every formula F there is an equivalent formula G in Conjunctive Normal Form (CNF)
//    - for every formula F there is an equivalent formula G' in Disjunctive Normal Form (DNF)
// - F and G are equisatisfiable iff ( Mod(F) ≠ Ø iff Mod(G) ≠ Ø )
//    - via Tseitin-Transformation, every formula F can be transformed into an equisatisfiable formula G
// - DPLL divides the problem into sub-problems, one where the latest assumption holds and one where it does not

/**
 * remove clauses that contain chosen
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
 * Simple Variant of DPLL that uses variable-elimination to determine whether the formula is satisfiable
 * Algorithm:
 *  if cnf has no clauses, return true
 *  if cnf has an empty clause, return false
 *  if cnf contains a unit clause, return sat(simplify(cnf, literal))
 *  v <- choose a variable in cnf
 *  if sat(simplify(cnf, v)) is true, return true
 *  else return sat(simplify(cnf, -v))
 * Source and Explanation:
 *  https://www.youtube.com/watch?v=ENHKXZg-a4c (Lecture by Wheeler Ruml, English)
 *  https://www.youtube.com/watch?v=keILzTb0Soo (Tutorial by Morpheus Tutorials, German)
 * Input: Formula in Conjunctive Normal Form (CNF) with each Variable being represented as
 * an integer (e.g. x1 represented as 1, x2 represented as 2, negated x1 represented as -1)
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function satisfiable(cnf) {
  if (cnf.length === 0) return true // SAT
  for (let clause of cnf) {
    if (clause.length === 0) return false // UNSAT
    if (clause.length === 1) return satisfiable(_simplify(cnf, clause[0])) // propagation
  }
  return satisfiable(_simplify(cnf, cnf[0][0])) || satisfiable(_simplify(cnf, -cnf[0][0])) // decide || backtrack
}

/**
 * Simple Variant of DPLL that returns a model when the formula is satisfiable
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: model represented as an array of true-assigned variables or null if unsatisfiable
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
