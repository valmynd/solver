import test from "ava";
import {dpll as dpll1} from "../dist/dpll1";
import {dpll as dpll2} from "../dist/dpll2";


test('dpll works correctly', t => {
  t.is(dpll1([[1, 2, 3], [-2, 3], [1, -3]]), true)
  t.is(dpll1([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]), true)
  console.log(dpll2([[1, 2, 3], [-2, 3], [1, -3]]))
  console.log(dpll2([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]))
})
