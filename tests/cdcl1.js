import test from "ava"
import {satisfiable, solve, _unit_prop, ImplicationGraph} from "../dist/sat/cdcl"
import {isModel} from "../dist/test_helpers"

test('solve() works correctly', t => {
  let cnf = [[1, 2, 3], [-2, 3], [1, -3]],
    assignment = new Map([[3, 1]]),
    g = new ImplicationGraph()
  console.log(_unit_prop(cnf, assignment, g, 0))
  console.log(g.nodes)
  console.log(g.edges.get(1))
  console.log(solve(cnf))
  t.true(satisfiable(cnf))
  t.true(isModel(solve(cnf), cnf))
  // (¬x1 ∨ x2)∧(¬x2 ∨ x3 ∨ x4)∧(¬x2 ∨ ¬x5)∧(¬x4 ∨ x5 ∨ x6)∧(¬x7 ∨ x8)∧(¬x8 ∨ ¬x9)∧(x9 ∨ ¬x10)∧(x3 ∨ ¬x8 ∨ x10)
  cnf = [[-1, 2], [-2, 3, 4], [-2, -5], [-4, 5, 6], [-7, 8], [-8, -9], [9, -10], [3, -8, 10]]
  t.true(satisfiable(cnf))
  //t.true(isModel(solve(cnf), cnf)) // FIXME
})
