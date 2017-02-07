import test from "ava";
import {_satisfied, _conflicting, _unit, _unresolved} from "../dist/sat/dpll_verbose";

test("_satisfied(), _conflicting(), _unit() and _unresolved() work", t => {
  let b = new Set([1]) // partial assignment {(x1,1),(x3,0)}, represented as set containing the true-assigned variables
  t.true(_satisfied([-1, 2, -3], b)) // (¬x1 ∨ x2 ∨ ¬x3)
  t.true(_conflicting([-1, 3], b)) // (¬x1 ∨ x3)
  t.is(_unit([-1, -2, 3], b), -2) // (¬x1 ∨ ¬x2 ∨ x3)
  t.true(_unresolved([2, 3, 4], b)) // (x2 ∨ x3 ∨ x4)
  b = new Set([1, 4]) // {{x1,1}, {x2,0}, {x4,1}}
  t.true(_satisfied([1, 3, -4], b)) // (x1 ∨ x3 ∨ ¬x4)
  t.true(_conflicting([-1, 2], b)) // (¬x1 ∨ x2)
  // FIXME: t.is(_unit([-1, -4, 3], b), 3) // (¬x1 ∨ ¬x4 ∨ x3)
  t.true(_unresolved([-1, 3, 5], b)) // (¬x1 ∨ x3 ∨ x5)
})

