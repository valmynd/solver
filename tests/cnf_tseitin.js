import test from "ava";
import {cnf, and, eq} from "../dist/normalforms/cnf_tseitin";


test.skip('and() works correctly', t => {
  console.log(cnf(
    //x1 <-> (x2 <-> (x3 <-> (x4 <-> x5)))
    eq(1, eq(2, eq(3, eq(4, 5))))
  ))
  t.deepEqual(cnf(and(1, 2)), [[1], [2]])
})
