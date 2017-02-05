/*
 * Algorithm from 'A Simplex-Based Extension of Fourier-Motzkin for Solving Linear Integer Arithmetic'
 * Paper: http://hal.inria.fr/hal-00687640
 * global sols ← ∅
 * procedure lia(L = (L_i), Eq)
 *   remove trivial inequalities c ≤ 0 with c constant from L
 *   if some c was positive then return
 *   if L = ∅ then
 *    sols ← sols ∪ check_1(Eq)
 *    return
 *   call oracle(L)
 *   if there is no constant positive linear combination then
 *    sols ← sols ∪ check ∞ (Eq)
 *    return
 *   let sum(λ_i*L_i) = c the constant positive linear combination found by the oracle
 *   if c > 0 then return
 *   choose k such that λ_k != 0, and μ > 0 such that μL_k has integer coefficients only
 *   for all v from dμ ceil(μc/λ_k) to 0 do
 *     create a substitution σ from μL_k(x_1,...,x_n) = v
 *     if there is no possible substitution then continue to next iteration
 *     remove L_k from L
 *     apply σ to L
 *     call lia(L, Eq ∪ {σ})
 *   return
 */

const {floor, ceil} = Math

function some_c_positive(L) {
  // remove trivial inequalities c ≤ 0 with c constant from L
  // return true if some c was positive
  // TODO
  return false
}

function check1(Eq) {
  // TODO
  return []
}
function checkInfinity(Eq) {
  // TODO
  return []
}
function oracle(L) {
  // find constant positive linear combination
  // TODO
}
function no_constant_positive_linear_combination(L, Eq) {
  // TODO
}
function choose_k(L, Eq) {
  //choose k such that λ_k != 0, and μ > 0 such that μL_k has integer coefficients only
  // TODO
}

let sols = []
/**
 *
 * @param {Array} [L] set of inequalities
 * @param {Array} [Eq] set of equalities
 */
/*function lia(L = [], Eq = []) {
 if (some_c_positive(L)) return
 if (L.length == 0) {
 sols = [...sols, check1(Eq)]
 return
 }
 let c = oracle(L)
 if (no_constant_positive_linear_combination(L, Eq)) {
 sols = [...sols, checkInfinity(Eq)]
 return
 }
 let sum = c // ?
 if (c > 0) return
 let k = choose_k(L, Eq), m, d = [], s
 for (let v = ceil(m * c / d[k]); v <= 0; v++) {
 // create a substitution σ from μL_k(x_1,...,x_n) = v
 // if there is no possible substitution then continue to next iteration
 // remove L_k from L
 L.splice(k, 1)
 // apply σ to L
 // call lia(L, Eq ∪ {σ})
 lia(L, [...Eq, s])
 }
 }
 let a, b, c, x, y

 x = [
 [0 <= -b + x],
 [0 <= -c + x],
 [0 <= b - x, 0 <= c - x],
 [!0 <= a - x],
 [0 <= -a + y],
 [0 <= -c + y],
 [0 <= a - y, 0 <= c - y],
 [!0 <= b - y],
 [0 <= -a + z],
 [0 <= -b + z],
 [0 <= a - z, 0 <= b - z],
 [!0 <= c - z]
 ]*/

