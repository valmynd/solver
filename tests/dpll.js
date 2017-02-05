import test from "ava";
import {satisfiable, solve} from "../dist/sat/dpll_simple";


test('satisfiable(1) works correctly', t => {
  t.is(satisfiable([[1, 2, 3], [-2, 3], [1]]), true)
  t.is(satisfiable([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]), true)
  t.is(true, true)
})

test('satisfiable(2) works correctly', t => {
  // note that only ONE model is returned, possibly there are more than one!
  t.deepEqual(solve([[1, 2, 3], [-2, 3], [1, -3]]), [1, -2])
  //t.deepEqual(solve([[2, 3], [3, 5], [-3, -4], [2, -3, -4], [-3, 4], [1, -2, -4, -5], [1, -2, 4, -5]]), [2, -3, 5, 1])
  /*console.log("YOO", solve([[1, 2]
   , [-1, -2, 6]
   , [2, 3]
   , [3, -5, -6]
   , [-2, 4, 5]
   , [-3, -6]
   , [-2, 3, 5]
   , [1, -2, -4]
   , [2, -3, 6]
   , [2, -5, 6]
   , [-2, -5, -6]
   , [4, -5]
   , [2, 6]
   , [-1, 5, 6]
   , [1, -2, -5]
   ]), "YO2")
   t.is(true, true)*/
})
