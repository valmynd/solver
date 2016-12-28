// variants of the Davis/Putnam/Logemann/Loveland (DPLL)-Algorithm
// current implementation is based on the algorithm from this lecture: https://www.youtube.com/watch?v=ENHKXZg-a4c
// TODO: different algorithms (backtracking/propagation/clause-learning(CDCL))
// TODO: DPLL(T)


/**
 * remove clauses in cnf where chosen is positive
 * remove -chosen from clauses where it appears
 * return new cnf
 * @param {int[][]} cnf
 * @param {int} chosen
 * @returns {int[][]}
 */
function _simplify(cnf, chosen) {
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
 * Input: Formula in Conjunctive Normal Form (CNF) with each Variable beeing represented as
 * an integer (e.g. x1 represented as 1, x2 represented as 2, negated x1 represented as -1)
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function dpll(cnf) {
  console.log(++step, cnf)
  if (cnf.length === 0) return true
  for (let clause of cnf) {
    if (clause.length === 0) return false
    if (clause.length === 1) return dpll(_simplify(cnf, clause[0]))
  }
  let atom = cnf[0][0]
  return dpll(cnf.concat([[atom]])) || dpll(cnf.concat([[[-atom]]]))
}
