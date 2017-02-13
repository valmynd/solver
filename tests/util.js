import test from "ava"
import {isModel, assignment2map, equivalent} from "../dist/utils"
import {_find_conflict} from "../dist/sat/cdcl"

test('isModel() works correctly', t => {
  let cnf = [[1, 2, 3], [-2, 3], [1, -3]]
  let model = [-3, -2, 1]
  let model_as_map = assignment2map(model)
  t.true(isModel(model, cnf))
  t.true(_find_conflict(cnf, model_as_map) === null)
  cnf = [[-1, 2], [-2, 3, 4], [-2, -5], [-4, 5, 6], [-7, 8], [-8, -9], [9, -10], [3, -8, 10]]
  model = [-1, -2, -4, -7, -8, 9]
  model_as_map = assignment2map(model)
  t.true(_find_conflict(cnf, model_as_map) === null)
})

test.skip('equivalent() works correctly', t => {
  t.true(equivalent([[1, 2]], [[2, 1]]))
  t.false(equivalent([[1, 2, 3]], [[2, 1]]))
  t.is(
    equivalent([[1, 2]], [[2, 1]]),
    (solveAll([[1, 2]]).toString() === solveAll([[2, 1]]).toString())
  )
})
