import {_collect_variables} from "./truthtable"
const abs = Math.abs

// Terminology
//- a Clause c is for a partial assignment b {(x1,1),(x3,0)} ...
//  ... satisfied, if ∃l ∈ c: b(l) = 1
//     - e.g. (¬x1 ∨ x2 ∨ ¬x3)
//  ... conflicting, if ∀l ∈ c: b(l) = 0
//     - e.g. (¬x1 ∨ x3)
//  ... unit, if ∃l ∈ c: b(l) = ⊥ ∧ ∀l' ∈ (c \ {l}) : b(l') = 0
//     - e.g. (¬x1 ∨ ¬x2 ∨ x3) in which l = ¬x2 is a unit-literal
//  ... unresolved otherwise
//      - e.g. (x2 ∨ x3 ∨ x4)
//- if ∃c ∈ F: conflicting(c,b), then ¬∃b' ⊇ b with b' |= F
//- if ∃c ∈ F: unit(c,b) with literal l, then ∀b' ⊇ b: b' |= F ⇒ b'(l) = 1

/**
 * Determine whether a clause is satisfied by an assignment
 * @param {int[]} clause
 * @param {Map} assignment
 * @returns {boolean}
 */
export function _satisfied(clause, assignment) {
  for (let atom of clause) {
    let value = assignment.get(abs(atom))
    if (atom > 0 && value === 1) return true
    if (atom < 0 && value === 0) return true
  }
  return false
}

/**
 * Determine whether a clause is conflicting, given an assignment
 * @param {int[]} clause
 * @param {Map} assignment
 * @returns {boolean}
 */
export function _conflicting(clause, assignment) {
  return _satisfied(clause, assignment) === false
}

/**
 * If the clause is a unit clause for a given assignment, return the unit literal, otherwise null
 * @param {int[]} clause
 * @param {Map} assignment
 * @returns {int|null}
 */
export function _unit(clause, assignment) {
  let unit_literal = null
  for (let atom of clause) {
    if (assignment.get(abs(atom)) === undefined) {
      if (unit_literal !== null) return null // more than one unassigned variable in this clause
      else unit_literal = atom
    }
  }
  return unit_literal
}

/**
 * Determine whether a clause is unresolved, given an assignment
 * @param {int[]} clause
 * @param {Map} assignment
 * @returns {boolean}
 */
export function _unresolved(clause, assignment) {
  return _unit(clause, assignment) === null
}

/**
 * Variant of the DPLL Algorithm without Variable-Elimination
 * Input: formula F in Conjunctive Normal Form (CNF)
 * Output: Assignment b with b |= F or null (UNSAT)
 * Algorithm:
 *  - (success) if b |= F return b (SAT)
 *  - (backtrack) if F contains a conflicting clause:
 *      - if stack empty, return null (UNSAT)
 *      - otherwise v := stack.pop() and DPLL(b ∪ {(v, 1)})
 *          - here, b is the assignment before decide(v)
 *  - if F contains a unit-clause with unit-literal l
 *     (propagate) DPLL(b ∪ {(variable(l), polarity(l))})
 *  - otherwise
 *     (decide) choose v ∉ dom(b), stack.push(v), then DPLL(b ∪ {(v, 0)})
 * Source: Lecture Notes by J. Waldmann, http://www.imn.htwk-leipzig.de/~waldmann/edu/ws16/skpp/folien/skript.pdf
 * @param {int[][]} cnf
 * @param {Map} [assignment] (internal)
 * @param {int[]} [stack]    (internal)
 * @returns {int[]|null}
 */
export function solve(cnf, assignment = new Map(), stack = _collect_variables(cnf)) {
  let conflict_clause = null, unit_clause = null, unit_literal = null
  for (let clause of cnf) {
    if (_conflicting(clause, assignment)) {
      conflict_clause = clause
      break
    } else if (unit_clause === null) {
      unit_literal = _unit(clause, assignment)
      if (unit_literal !== null) unit_clause = clause
    }
  }
  if (conflict_clause === null) { // (success)
    return [...assignment.keys()].filter(k => assignment.get(k) === 1) // SAT
  } else {
    if (unit_clause !== null) { // (propagate)
      return solve(cnf, assignment.set(unit_literal, 1), stack) // could also set it to 0
    } else if (stack.length !== 0) { // (decide)
      let variable = stack.pop()
      let solution = solve(cnf, assignment.set(variable, 0), stack)
      if (solution === null) { // (backtrack)
        solution = solve(cnf, assignment.set(variable, 1), stack)
      }
      return solution
    } else {
      return null // UNSAT
    }
  }
  // adjustments to be made:
  // - whether to set the propagated variable to 0 or 1 (hint: polarity)
  // - the order of the stack (which determines in which order decisions on variables are made)
  //   - a heuristic could be, to sort the variables by in how many clauses they appear?
  // - do multiple decisions at once
  //   - heuristic for that?
  // - skip decision-levels when backtracking (see backjump in CDCL)
}


export function satisfiable(cnf) {
  return solve(cnf) !== null
}
