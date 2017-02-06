import test from "ava"
import {equivalent, equisatisfiable} from "../dist/sat/truthtable"


test('equivalent() works correctly', t => {
  t.true(equivalent([[1, 2]], [[2, 1]]))
  t.false(equivalent([[1, 2, 3]], [[2, 1]]))
})

test('equisatisfiable() works correctly', t => {
  //t.true(equisatisfiable([[1, 2]], [[2, 1]]))
  t.false(equisatisfiable([[1, 2, 3]], [[2, 1]]))
})
