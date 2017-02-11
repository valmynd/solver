import test from "ava"
import {isModel} from "../dist/utils"
import {satisfiable, solve} from "../dist/sat/dpll_simple"


test('satisfiable() works correctly', t => {
  t.true(satisfiable([[1, 2, 3], [-2, 3], [1]]))
  t.true(satisfiable([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]))
})

test('solve() works correctly', t => {
  // note that only ONE model is returned, possibly there are more than one!
  t.deepEqual(solve([[1, 2, 3], [-2, 3], [1, -3]]), [1, -2])
  //t.deepEqual(solve([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]), [2, -3, 5, 1])
  let cnf = [[-1, 2], [-2, 3, 4], [-2, -5], [-4, 5, 6], [-7, 8], [-8, -9], [9, -10], [3, -8, 10]]
  t.true(isModel(solve(cnf), cnf))
  //console.log("DPLL-solve", solve([[1, 2, 3], [-2, 3], [1, -3]]))
})
