const isInt = Number.isInteger
const isArray = Array.isArray
const str = json => JSON.stringify(json)

/**
 * Conjunction (a ∧ b)
 * @example
 *  and(1,2)        // [[1],[2]]
 *  and(1,or(2,3))  // [[1],[2,3]]
 *  and(1,and(2,3))  // [[1],[2],[3]]
 * @param {...int|int[][]} args
 * @returns {int[][]}
 */
export function and(...args) {
  let cnf = []
  for (let arg of args) {
    if (isInt(arg)) {
      cnf.push([arg])
    } else if (isArray(arg)) {
      cnf = [...cnf, ...arg]
    } else {
      throw "Invalid argument for and(): " + arg
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
 * @param {...int|int[][]} args
 * @returns {int[][]}
 */
export function or(...args) {
  let integers = [], arrays = []
  for (let arg of args) {
    if (isInt(arg)) {
      integers.push(arg)
    } else if (isArray(arg)) {
      arrays.push(arg)
    } else {
      throw "Invalid argument for or(): " + arg
    }
  }
  if (integers.length > 0)
    arrays = [integers, ...arrays]
  if (arrays.length < 2)
    return arrays
  let [a, b, ...more] = arrays
  console.log("args", str(args), "arrays", str(arrays), "abmore", str(a), str(b), str(more))
  let cnf = []
  for (let clause_a of a) {
    for (let clause_b of b) {
      for (let atom_a of clause_a) {
        for (let atom_b of clause_b) {
          cnf.push([atom_a, atom_b])
        }
      }
    }
  }
  if (more.length === 0) return cnf
  else return or(cnf, ...more)
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
