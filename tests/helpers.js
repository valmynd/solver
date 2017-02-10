import test from "ava"
import {isModel} from "../dist/test_helpers"
import {_find_conflict} from "../dist/sat/cdcl"

test('isModel() works correctly', t => {
  let cnf = [[1, 2, 3], [-2, 3], [1, -3]]
  let model = [-3, -2, 1]
  let model_as_map = new Map()
  model.forEach(l => model_as_map.set(Math.abs(l), ((l > 0) ? 1 : 0)))
  t.true(isModel(model, cnf))
  t.true(_find_conflict(cnf, model_as_map) === null)
})
