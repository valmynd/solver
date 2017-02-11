import test from "ava"
import {cnf2bdd, satisfiable, } from "../dist/sat/bdd_table"

test('ROBDD', t => {
  //let cnf = [[1, 2, 3], [-2, 3], [1, -3]] // model = [1,-2]
  let tautology = [[1],[1]]
  let contradiction = [[1],[-1]]
  let robdd = cnf2bdd(contradiction, [1])
  console.log(robdd)
  //t.false(satisfiable(contradiction))
  //t.true(satisfiable(tautology))
})
