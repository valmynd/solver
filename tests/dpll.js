import test from "ava";
import {dpll} from "../dist/dpll";


test('dpll works correctly', t => {
  t.is(dpll([[1, 2, 3], [-2, 3], [1, -3]]), true)
  t.is(dpll([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]), true)
})
