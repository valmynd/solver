import test from "ava"
import {satisfiable as satS, solve as solveS} from "../dist/sat/dpll_simple"
import {satisfiable as satT, solve as solveT, _deep_copy_cnf} from "../dist/sat/dpll_simple_tombstone"


test.skip('dpll_simple and dpll_simple_tombstone work similarly', t => {
  let cnf1 = [[1, 2, 3], [-2, 3], [1, -2]],
    cnf2 = [[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]
  t.is(satT(_deep_copy_cnf(cnf1)), satS(cnf1))
  t.is(satT(_deep_copy_cnf(cnf2)), satS(cnf2))
  t.is(solveT(_deep_copy_cnf(cnf1)), solveS(cnf1))
  t.is(solveT(_deep_copy_cnf(cnf2)), solveS(cnf2))
})
