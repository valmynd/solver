import test from "ava";
import {_satisfied, _conflicting, _unit, _unresolved, satisfiable, solve} from "../dist/sat/dpll_verbose";

test("_satisfied(), _conflicting(), _unit() and _unresolved() work", t => {
  let b = new Map([[1, 1], [3, 0]]) // partial assignment {(x1,1),(x3,0)}
  t.true(_satisfied([-1, 2, -3], b)) // (¬x1 ∨ x2 ∨ ¬x3)
  t.false(_satisfied([-5, 6, 7], b)) // (¬x5 ∨ x6 ∨ x7)
  t.true(_conflicting([-1, 3], b)) // (¬x1 ∨ x3)
  t.is(_unit([-1, -2, 3], b), -2) // (¬x1 ∨ ¬x2 ∨ x3)
  t.true(_unresolved([2, 3, 4], b)) // (x2 ∨ x3 ∨ x4)
  b = new Map([[1, 1], [2, 0], [4, 1]]) // {{x1,1}, {x2,0}, {x4,1}}
  t.true(_satisfied([1, 3, -4], b)) // (x1 ∨ x3 ∨ ¬x4)
  t.true(_conflicting([-1, 2], b)) // (¬x1 ∨ x2)
  t.is(_unit([-1, -4, 3], b), 3) // (¬x1 ∨ ¬x4 ∨ x3)
  t.true(_unresolved([-1, 3, 5], b)) // (¬x1 ∨ x3 ∨ x5)
})

test('satisfiable() works correctly', t => {
  t.true(satisfiable([[1, 2, 3], [-2, 3], [1]]))
  //console.log(solve([[1, 2, 3], [-2, 3], [1, -3]]))
  //t.true(satisfiable([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]])) // FIXME
})

test('solve() works correctly', t => {
  t.deepEqual(solve([[1, 2, 3], [-2, 3], [1, -3]]), [1]) // TODO: check if [1] is actually a model
})
