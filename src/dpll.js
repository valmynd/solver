// current implementation is based on the algorithm from this lecture: https://www.youtube.com/watch?v=ENHKXZg-a4c
// TODO: different algorithms (backtracking/propagation/clause-learning(CDCL))
// TODO: DPLL(T)

/**
 * remove clauses in cnf where chosen is positive
 * remove -chosen from clauses where it appears
 * return new cnf
 * @param {int[][]} cnf cnv
 * @param {int} chosen
 * @returns {int[][]}
 */
function _simplify(cnf, chosen) {
  let ret = []
  for (let clause of cnf) {
    let replacement = []
    let skip = false
    for (let atom of clause) {
      if (atom === chosen) {
        skip = true
        break
      } else if (atom !== -chosen) {
        replacement.push(atom)
      }
    }
    if (!skip) ret.push(replacement)
  }
  return ret
}

let step = 0
/**
 * if cnf has no clauses, return true
 * if cnf has an empty clause, return false
 * if cnf contains a unit clause, return dpll(simplify(cnf, literal))
 * v <- choose a variable in cnf
 * if dpll(simplify(cnf, v)) is true, return true
 * else return dpll(simplify(cnf, -v)
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function dpll(cnf) {
  console.log(++step, cnf)
  let len = cnf.length
  if (len === 0) return true
  for (let i = 0; i < len; i++) {
    let innerLen = cnf[i].length
    if (innerLen === 0) return false
    if (innerLen === 1) return dpll(_simplify(cnf, cnf[i][0]))
  }
  let atom = cnf[0][0]
  return dpll(cnf.concat([[atom]])) || dpll(cnf.concat([[[-atom]]]))
}
