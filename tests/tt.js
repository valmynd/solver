import test from "ava"
import {equivalent, equisatisfiable, solveAll} from "../dist/sat/truthtable"


test('equivalent() works correctly', t => {
  t.true(equivalent([[1, 2]], [[2, 1]]))
  t.false(equivalent([[1, 2, 3]], [[2, 1]]))
  t.is(
    equivalent([[1, 2]], [[2, 1]]),
    (solveAll([[1, 2]]).toString() === solveAll([[2, 1]]).toString())
  )
})

test('equisatisfiable() works correctly', t => {
  t.true(equisatisfiable([[1, 2]], [[2, 1]]))
  t.true(equisatisfiable([[1, 2, 3]], [[2, 1]]))
  t.true(equisatisfiable([[1, 2]], [[3, 4]])) // ?
})
