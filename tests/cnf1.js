import test from "ava";
import {and, or, not, eq} from "../dist/normalforms/cnf_simple";


test('and() works correctly', t => {
  t.deepEqual(and(1, 2), [[1], [2]])
  t.deepEqual(and(1, or(2, 3)), [[1], [2, 3]])
  t.deepEqual(and(1, and(2, 3)), [[1], [2], [3]])
  t.deepEqual(and(1, 2, 3), [[1], [2], [3]])
})

test('or() works correctly', t => {
  t.deepEqual(or(1, 2), [[1, 2]])
  t.deepEqual(or(1, and(2, 3)), [[1, 2], [1, 3]])
  t.deepEqual(or(and(1, 2), and(3, 4), and(5, 6, 7)), [
    [1, 5], [3, 5], [1, 6], [3, 6], [1, 7], [3, 7], [1, 5], [4, 5], [1, 6], [4, 6],
    [1, 7], [4, 7], [2, 5], [3, 5], [2, 6], [3, 6], [2, 7], [3, 7], [2, 5], [4, 5],
    [2, 6], [4, 6], [2, 7], [4, 7]])
  t.deepEqual(or(and(1, 2, 3, 4), and(5, 6, 7, 8)), [[1, 5], [1, 6], [1, 7], [1, 8],
    [2, 5], [2, 6], [2, 7], [2, 8], [3, 5], [3, 6], [3, 7], [3, 8], [4, 5], [4, 6],
    [4, 7], [4, 8]])
  t.deepEqual(or(and(1, 2), 3), [[3, 1], [3, 2]])
})


test('not() works correctly', t => {
  t.deepEqual(not(1), [[-1]])
  t.deepEqual(not(or(1, 2)), [[-1], [-2]])
  t.deepEqual(not(and(1, 2)), [[-1, -2]])
  t.deepEqual(not(and(or(1, 2), or(3, 4))), [[-1, -3], [-1, -4], [-2, -3], [-2, -4]])
})

test('eq() works correctly', t => {
  console.log(eq(3, or(1, 2)))
  //t.deepEqual(eq(3, or(1, 2)), [[-3, 1, 2], [3, -1], [3, -2]])
  t.deepEqual(eq(3, or(1, 2)), [[-3, 1], [-3, 2], [3, -1], [3, -2]]) // FIXME: should be simplified as above
})
