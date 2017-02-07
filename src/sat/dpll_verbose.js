import {_collect_variables} from "./truthtable"

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
//- if ∃c ∈ F: conflict(c,b), then ¬∃b' ⊇ b with b' |= F
//- if ∃c ∈ F: unit(c,b) with literal l, then ∀b' ⊇ b: b' |= F ⇒ b'(l) = 1

/**
 * Determine whether a clause is satisfied by an assignment
 * @param {int[]} clause
 * @param {Set} assignment
 * @returns {boolean}
 */
export function _satisfied(clause, assignment) {
  for (let atom of clause) {
    if (atom > 0 && assignment.has(atom)) return true
    if (atom < 0 && !assignment.has(Math.abs(atom))) return true
  }
  return false
}

/**
 * Determine whether a clause is conflicting, given an assignment
 * @param {int[]} clause
 * @param {Set} assignment
 * @returns {boolean}
 */
export function _conflicting(clause, assignment) {
  return _satisfied(clause, assignment) === false
}

/**
 * If the clause is a unit clause for a given assignment, return the unit literal, otherwise null
 * @param {int[]} clause
 * @param {Set} assignment
 * @returns {int|null}
 */
export function _unit(clause, assignment) {
  let unit_literal = null
  for (let atom of clause) {
    if ((atom > 0 && assignment.has(atom)) || (atom < 0 && !assignment.has(Math.abs(atom)))) {
      if (unit_literal !== null) return null // clause is satisfiable, bot not unit
      else unit_literal = atom
    }
  }
  return unit_literal
}

/**
 * Determine whether a clause is unresolved, given an assignment
 * @param {int[]} clause
 * @param {Set} assignment
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
 *  - (backtrack) if F contains a conflict-clause:
 *      - if stack empty, return null (UNSAT)
 *      - otherwise v := stack.pop() and DPLL(b ∪ {(v, 1)})
 *          - here, b is the assignment before decide(v)
 *  - if F contains a unit-clause with unit-literal l
 *     (propagate) DPLL(b ∪ {(variable(l), polarity(l))})
 *  - otherwise
 *     (decide) choose v ∉ dom(b), stack.push(v), then DPLL(b ∪ {(v, 0)}).
 * @param {int[][]} cnf
 * @param {Set} [assignment] (internal)
 * @param {int[]} [stack]    (internal)
 * @returns {int[]|null}
 */
export function solve(cnf, assignment = new Set(), stack = _collect_variables(cnf)) {
  let conflict_clause = null, unit_clause = null
  for (let clause of cnf) {
    if (_conflicting(clause, assignment)) {
      conflict_clause = clause
      break
    } else if (unit_clause === null && _unit(clause, assignment)) {
      unit_clause = clause
    }
  }
  if (conflict_clause === null) return [...assignment] // SAT
  if (stack.length === 0) return null // UNSAT
  return solve(cnf, assignment.add(stack.pop()), stack)
  // TODO: propagation, assumption (decide)
}
