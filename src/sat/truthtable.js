// TODO: read Towards Next Generation Sequential and Parallel SAT Solvers
// TODO: read Equisatisfiable SAT Encodings of Arithmetical Operations

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
 * Generate Combinations (usually the first Columns of a Truth Table)
 * @example
 * _generate_combinations([1,2]) // [[0,0],[0,1],[1,0],[1,1]]
 * @param {int[]} variables
 * @returns {int[][]}
 */
function _generate_combinations(variables) {
  let pad = (new Array(variables.length + 1).join("0")),
    combinations = new Array(Math.pow(2, variables.length))
  for (let i = 0; i < combinations.length; i++) {
    let b = i.toString(2), s = pad.substring(0, pad.length - b.length) + b
    combinations[i] = [...s].map(char => parseInt(char))
  }
  return combinations
}

/**
 * Apply an Assignment to a Formula, Return whether it is a Model of the Formula
 * val(F,a) // returns Value of Formula F when an Assignment a is given
 * val(F,a) = 1 ≡ a |= F // Value is 1 iff a is a Model of F
 * val(F,a) = 0 ≡ a |≠ F // Value is 0 iff a is not a Model of F
 * @param {int[][]} cnf
 * @param {int[]} variables
 * @param {int[]} values
 * @returns {int}
 */
function _val(cnf, variables, values) {
  for (let clause of cnf) {
    let v = false
    for (let atom of clause) {
      let i = variables.indexOf(Math.abs(atom))
      if (atom > 0) v = v || Boolean(values[i])
      if (atom < 0) v = v || Boolean(!values[i])
    }
    if (!v) return 0
  }
  return 1
}

/**
 * Generate the Rows of a Truth table
 * @param {int[][]} cnf
 * @param {int[]} [variables]
 * @returns {int[][]}
 */
export function _rows(cnf, variables = _collect_variables(cnf)) {
  return _generate_combinations(variables).map(combination => [...combination, _val(cnf, variables, combination)])
}

/**
 * Checks two formulas for Equivalence
 * Two formulas are equivalent iff their sets of models are equal, e.g. Mod(F) = Mod(G)
 * @param {int[][]} cnf1
 * @param {int[][]} cnf2
 * @returns {boolean}
 */
export function equivalent(cnf1, cnf2) {
  let variables1 = _collect_variables(cnf1), variables2 = _collect_variables(cnf2)
  if (variables1.toString() !== variables2.toString()) return false
  let combinations = _generate_combinations(variables1)
  let values1 = combinations.map(combination => _val(cnf1, variables1, combination))
  let values2 = combinations.map(combination => _val(cnf2, variables1, combination))
  return values1.toString() === values2.toString()
}

/**
 * Returns one model when the formula is satisfiable
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: model represented as an array of true-assigned variables or null if unsatisfiable
 * @param {int[][]} cnf
 * @returns {int[]}
 */
export function solve(cnf) {
  let variables = _collect_variables(cnf), rows = _rows(cnf, variables)
  for (let row of rows) // if model, return array of true-assigned variables
    if (row.pop() === 1) return variables.filter((_, i) => row[i] === 1)
  return null
}

/**
 * Returns all models when the formula is satisfiable
 * Input: formula in Conjunctive Normal Form (CNF) with each variable being represented as an integer
 * Output: array of models represented as arrays of true-assigned variables (empty if unsatisfiable)
 * @param {int[][]} cnf
 * @returns {int[][]}
 */
export function solveAll(cnf) {
  let variables = _collect_variables(cnf), rows = _rows(cnf, variables)
  return rows.filter(row => row.pop() === 1).map(row => variables.filter((_, i) => row[i] === 1))
}

/**
 * Determine whether the formula is satisfiable
 * @param {int[][]} cnf
 * @returns {boolean}
 */
export function satisfiable(cnf) {
  return solve(cnf) !== null
}

/**
 * Checks two formulas for Equisatisfiability
 * Two Formulas F and G are equisatisfiable when ...
 *   ... either (1) Mod(F) = Ø ⇔ Mod(G) = Ø
 *   ... or     (2) Mod(F) ≠ Ø ⇔ Mod(G) ≠ Ø
 * @param {int[][]} cnf1
 * @param {int[][]} cnf2
 * @returns {boolean}
 */
export function equisatisfiable(cnf1, cnf2) {
  return satisfiable(cnf1) === satisfiable(cnf2)
}
