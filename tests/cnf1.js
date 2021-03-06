import test from "ava"
import {equivalent} from "../dist/utils"
import {and, or, not, eq, implies} from "../dist/normalforms/cnf_simple";

const P = 1, Q = 2, R = 3

test('Commutativity', t => {
  // (P ∨ Q) ↔ (Q ∨ P)
  t.true(equivalent(
    or(P, Q),
    or(Q, P)
  ))
  // (P ∧ Q) ↔ (Q ∧ P)
  t.true(equivalent(
    and(P, Q),
    and(Q, P)
  ))
  // (P ↔ Q) ↔ (Q ↔ P)
  t.true(equivalent(
    eq(P, Q),
    eq(Q, P)
  ))
  // (P→(Q→R))↔(Q→(P→R))
  t.true(equivalent(
    implies(P, implies(Q, R)),
    implies(Q, implies(P, R))
  ))
})

test('Associativity', t => {
  // ((P ∨ Q) ∨ R) ↔ (P ∨ (Q ∨ R))
  t.true(equivalent(
    or(or(P, Q), R),
    or(P, or(Q, R))
  ))
  // ((P ∧ Q) ∧ R) ↔ (P ∧ (Q ∧ R))
  t.true(equivalent(
    and(and(P, Q), R),
    and(P, and(Q, R))
  ))
  // ((P ↔ Q) ↔ R) ↔ (P ↔ (Q ↔ R))
  /*t.true(equivalent(
   eq(eq(P, Q), R),
   eq(P, eq(Q, R))
   ))*/ // FIXME
  //console.log("eq(P, eq(Q, R))", eq(P, eq(Q, R)))
  //console.log("eq(eq(P, Q), R)", eq(eq(P, Q), R))
})

test('Distributivity', t => {
  // (P ∨ (Q ∧ R)) ⇔ ((P ∨ Q) ∧ (P ∨ R))
  t.true(equivalent(
    or(P, and(Q, R)),
    and(or(P, Q), or(P, R))
  ))
  // (P ∧ (Q ∨ R)) ↔ ((P ∧ Q) ∨ (P ∧ R))
  t.true(equivalent(
    and(P, or(Q, R)),
    or(and(P, Q), and(P, R))
  ))
})


test('Other', t => {
  // a1 ∨ (b1 ∧ b2) ∨ (c1 ∧ c2)  ≡  (a1 ∨ b1 ∨ c1) ∧ (a1 ∨ b1 ∨ c2) ∧ (a1 ∨ b2 ∨ c1) ∧ (a1 ∨ b2 ∨ c2)
  // a1 ∨ (a2 ∧ a3) ∨ (a4 ∧ a5)  ≡  (a1 ∨ a2 ∨ a4) ∧ (a1 ∨ a2 ∨ a5) ∧ (a1 ∨ a3 ∨ a4) ∧ (a1 ∨ a3 ∨ a5)
  t.deepEqual(or(1, and(2, 3), and(4, 5)), [[1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5]])
  // a1 ∨ (b1 ∧ (c1 ∨ c2))  ≡  (a1 ∨ b1) ∧ (a1 ∨ c1 ∨ c2)
})
