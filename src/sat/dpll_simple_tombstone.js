// bottom line: using tombstones instead of creating filtered copies is hardly worth the effort

export function _simplify(cnf, chosen) {
  // same as _simplify() from dpll_simple, this time putting tombstones where variables/clauses would be removed
  for (let c in cnf) {
    if (c === undefined) continue
    for (let a in cnf[c]) {
      if (cnf[c][a] === chosen) {
        delete cnf[c] // same as setting cnf[c] to undefined
        break
      } else if (cnf[c][a] !== -chosen) {
        delete cnf[c][a] // same as cnf[c][a] = undefined
      }
    }
  }
  return cnf
}

function _len(array) {
  let n = 0
  for (let i in array) if (array[i] !== undefined) n++
  return n
}

export function _deep_copy_cnf(cnf) {
  // sometimes we need deep-copy of cnf now, because it gets reused and is changed when backtracking
  return JSON.parse(JSON.stringify(cnf)) // cnf.map(clause => [...clause])
}

export function solve(cnf, assignment = []) { // FIXME: has bug
  if (_len(cnf) === 0) return assignment
  for (let clause of cnf) {
    let len = _len(clause)
    if (len === 0) return null
    if (len === 1) return solve(_simplify(cnf, clause[0]), [...assignment, clause[0]])
  }
  let clone = _deep_copy_cnf(cnf), atom = cnf[0][0] // need deep-copy of cnf now, because it gets reused
  return solve(_simplify(clone, atom), [...assignment, atom]) || solve(_simplify(cnf, -atom), [...assignment, -atom])
}

export function satisfiable(cnf) {
  return solve(cnf) !== null
}
