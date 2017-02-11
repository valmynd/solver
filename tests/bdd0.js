import test from "ava"
import {cnf2bdd} from "../dist/sat/bdd_table"

test('ROBDD', t => {
  let cnf = [[1, 2, 3], [-2, 3], [1, -3]] // model = [1,-2]
  let robdd = cnf2bdd([[1],[-1]], [1])
  console.log(robdd)
})
