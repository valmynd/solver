import test from "ava"
import {isModel} from "../dist/utils"
import {ROBDD, satisfiable, solve} from "../dist/sat/bdd"

test('ROBDD: and(or(a,b)) should return the same as or(a,b)', t => {
  let bdd1 = new ROBDD([1]), bdd2 = new ROBDD([1])
  t.true(bdd1.or(bdd1._mk(1), bdd1._mk(-1)) === bdd2.and(bdd2.or(bdd2._mk(1), bdd2._mk(-1))))
})

test('ROBDD: (x1 ∨ x2 ∨ x3) ∧ (¬x2 ∨ x3) ∧ (x1 ∨ ¬x3), ordering x1 < x2 < x3', t => {
  let cnf = [[1, 2, 3], [-2, 3], [1, -3]]
  let model = solve(cnf)
  let robdd = new ROBDD([1, 2, 3])
  //console.log(robdd.cnf(cnf), robdd)
  //console.log(model)
  t.true(satisfiable(cnf))
  //t.true(isModel(model, cnf)) // FIXME
})

test('ROBDD: tautology a ∨ ¬a', t => {
  let tautology = [[1, -1]]
  t.true(satisfiable(tautology))
})

test('ROBDD: contradiction a ∧ ¬a', t => {
  let contradiction = [[1], [-1]]
  t.false(satisfiable(contradiction))
})


test('ROBDD: (x1 ↔ y1) ∧ (x2 ↔ y2), ordering x1 < x2 < y1 < y2', t => {
  let order = [1, 2, 3, 4] // x1 := 1, x2 := 2, y1 := 3, y2 := 4
  let bdd = new ROBDD(order)
  let x1 = bdd._mk(1), x2 = bdd._mk(2), y1 = bdd._mk(3), y2 = bdd._mk(4)
  t.true(bdd.and(
      bdd.eq(x1, y1),
      bdd.eq(x2, y2)
    ) !== 0)
  t.true(bdd.size === 21)
  //console.log(bdd)
})
