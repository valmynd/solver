import test from "ava";
import {cnf, eq} from "../dist/normalforms/cnf_tseitin";


test('and() works correctly', t => {
  console.log(cnf(
    //x1 <-> (x2 <-> (x3 <-> (x4 <-> x5)))
    eq(1, eq(2, eq(3, eq(4, 5))))
  ))
  // t.deepEqual(cnf(and(1, 2)), [[1], [2]])
  //t.deepEqual(cnf(or(and(1, 2), 3)), [[-4, 1], [-4.2], [4, 3]])
  //console.log(cnf(or(and(1, 2), 3)), [[-4, 1], [-4.2], [4, 3]])
  //console.log("TEST_AND_1_2", cnf(and(1, 2)))
})
