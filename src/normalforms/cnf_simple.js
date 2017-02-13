const isInt = Number.isInteger
const isArray = Array.isArray

/**
 * Conjunction (a ∧ b)
 * @example
 *  and(1,2)        // [[1],[2]]
 *  and(1,or(2,3))  // [[1],[2,3]]
 *  and(1,and(2,3))  // [[1],[2],[3]]
 * @param {...int|int[][]} operands
 * @returns {int[][]}
 */
export function and(...operands) {
  let cnf = []
  for (let operand of operands) {
    if (isInt(operand)) {
      cnf.push([operand])
    } else if (isArray(operand)) {
      cnf.push(...operand)
    } else {
      throw "Invalid argument for and(): " + operand
    }
  }
  return cnf
}


/**
 * Disjunction (a ∨ b)
 * a ∨ (b ∧ c) ≡ (a ∨ b) ∧ (a ∨ c)
 * (a ∧ b) ∨ (c ∧ d) ≡ (a ∨ c) ∧ (a ∨ d) ∧ (b ∨ c) ∧ (b ∨ d)
 * @example
 *  or(1,2)         // [[1,2]]
 *  or(1,and(2,3))  // [[1,2],[1,3]]
 *  or(and(1,2), and(3,4), and(5,6,7))
 * @param {...int|int[][]} operands
 * @returns {int[][]}
 */
export function or(...operands) {
  let clause1 = [], remaining = []
  for (let operand of operands) {
    if (isInt(operand)) {
      clause1.push(operand)
    } else if (isArray(operand)) {
      if (operand.length === 1) {
        clause1.push(...operand[0])
      } else {
        remaining.push(...operand)
      }
    } else {
      throw "Invalid argument for or(): " + operand
    }
  }
  if (clause1.length === 0) {
    clause1 = remaining.shift()
  }
  if (remaining.length === 0) {
    return [clause1]
  }
  // (p1 ∧ p2) ∨ (q1 ∧ q2) ≡ (p1 ∨ q1) ∧ (p1 ∨ q2) ∧ (p2 ∨ q1) ∧ (p2 ∨ q2)
  let cnf = []
  for (let clause2 of remaining) {
    for (let atom1 of clause1) {
      for (let atom2 of clause2) {
        if (atom1 === atom2) cnf.push([atom1])
        else cnf.push([atom1, atom2])
      }
    }
  }
  return cnf
}

/**
 * Negation (¬a)
 * ¬(a ∨ b) ≡ ¬a ∧ ¬b
 * ¬(a ∧ b) ≡ ¬a ∨ ¬b
 * ¬((a ∨ b) ∧ (c ∧ d)) ≡ (¬a ∧ ¬b) ∨ (¬c ∧ ¬d)
 * @example
 *  not(1)          // [[-1]]
 *  not(or(1,2))    // [[-1],[-2]]
 *  not(and(1,2))   // [[-1,-2]]
 *  not(and(or(1,2),or(3,4)))
 * @param {int|int[][]} a
 * @returns {int[][]}
 */
export function not(a) {
  if (isInt(a)) return [[-a]]
  if (!isArray(a)) throw "Invalid argument for not(): " + a
  if (a.length > 1) return or(...a.map(clause => [clause.map(atom => -atom)]))
  if (a.length > 0) return and(...a[0].map(atom => -atom))
  return []
}

/**
 * Implication (a → b)
 * a → b ≡ ¬a ∨ b
 * @param {int|int[][]} a
 * @param {int|int[][]} b
 * @returns {int[][]}
 */
export function implies(a, b) {
  return or(not(a), b)
}

/**
 * Equivalence (a ↔ b)
 * a ↔ b ≡ (a → b) ∧ (b → a)
 * a ↔ b ≡ (¬a ∨ b) ∧ (¬b ∨ a)
 * a ↔ b ≡ (a ∧ b) ∨ (¬a ∧ ¬b) // ?
 * @param {int|int[][]} a
 * @param {int|int[][]} b
 * @returns {int[][]}
 */
export function eq(a, b) {
  return and(implies(a, b), implies(b, a))
}

/**
 * Exclusive Disjunction (a ⊕ b)
 * @param {int|int[][]} a
 * @param {int|int[][]} b
 * @returns {int[][]}
 */
export function xor(a, b) {
  return not(eq(a, b))
}

/**
 * Existential Quantification (∃x: P)
 * ∃x: P(x) means there is at least one x such that P(x) is true
 * @param {string} x (variable_name)
 * @param {int[][]} P
 * @returns {int[][]}
 */
export function exists(x, P) {
  // TODO
}

/**
 * Universal Quantification (∀x: P(x))
 * ∀x: P(x) means P(x) is true for all x
 * @param {string} x (variable_name)
 * @param {int[][]} P
 * @returns {int[][]}
 */
export function forAll(x, P) {
  // TODO
}
