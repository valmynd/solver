import * as simple from "./cnf_simple";

// Algorithm:
// - for every non-leaf T of the syntax-tree of formula F, introduce an additional variable n
//    - ∀b': val(n, b') = val(T, b)

const isInt = Number.isInteger
const isArray = Array.isArray
const abs = Math.abs
const str = json => JSON.stringify(json)
const map2obj = map => {
  let obj = {}
  for (let [k, v] of map) obj[k] = v
  return obj
}

export function and(...args) {
  //let ret = ["and", a, b]
  //if (more.length > 0) return and(ret, ...more)
  //return ret
  return ["and", ...args]
}

export function or(...args) {
  // let ret = ["or", a, b]
  // if (more.length > 0) return or(ret, ...more)
  ///return ret
  return ["or", ...args]
}

export function not(a) {
  if (isInt(a)) return -a
  return ["not", a]
}

export function implies(a, b) {
  return ["implies", a, b]
}

export function eq(a, b) {
  return ["eq", a, b]
}

export function _collect_variables(syntax_tree, variables = new Set()) {
  let [operator, ...operands] = syntax_tree
  for (let operand of operands) {
    if (isInt(operand)) variables.add(abs(operand))
    else _collect_variables(operand, variables)
  }
  return variables
}

export function _substitute(node, variables, replacements) {
  if (!isArray(node)) return node // leaf
  let [operator, ...operands] = node
  let new_operands = operands.map(operand => _substitute(operand, variables, replacements))
  variables.unshift(variables[0] + 1) // prepend
  replacements.set(variables[0], [operator, ...new_operands])
  return variables[0]
}

export function _cleanup(node) {
  if (!isArray(node)) return node // leaf
  let [operator, ...operands] = node
  let new_operands = operands.map(operand => _cleanup(operand))
  console.log("_cleanup", str(node), "old operands", str(operands), "new operands", str(new_operands))
  let op = simple[operator]
  if (!op) throw "unknown operator detected in _cleanup()"
  return op(...new_operands)
}

/**
 * @param {Array} syntax_tree (created via and(), or(), not(), implies() or eq()
 * @param {int[]} [variables] (variables used in the syntax tree, optional)
 * @returns {int[][]}
 */
export function cnf(syntax_tree, variables = Array.from(_collect_variables(syntax_tree))) {
  variables = variables.sort().reverse() // thus easy to get the highest number
  //let cnf = [], non_leaf_nodes = collect_non_leaf_nodes(syntax_tree)
  let replacements = new Map()
  let v0 = _substitute(syntax_tree, variables, replacements)
  let cnf = [[v0]]
  console.log("REPL", str(map2obj(replacements)))
  for (let [v, formula] of replacements) {
    //console.log("push", v, str(formula))
    console.log("PRE-CLEANUP", eq(v, formula))
    cnf = [...cnf, ..._cleanup(eq(v, formula))]
    //cnf.push(_cleanup(formula))
  }
  return cnf
}
let x = [[9], [-6, 5], [-6, -4], [-6, 4], [-6, -5], [6, -5], [6, -4], [6, -5], [6, 5], [6, 4], [6, -4], [6, 4], [6, 5],
  [-7, 6], [-7, -3], [-7, 3], [-7, -6], [7, -6], [7, -3], [7, -6], [7, 6], [7, 3], [7, -3], [7, 3], [7, 6], [-8, 7],
  [-8, -2], [-8, 2], [-8, -7], [8, -7], [8, -2], [8, -7], [8, 7], [8, 2], [8, -2], [8, 2], [8, 7], [-9, 8], [-9, -1],
  [-9, 1], [-9, -8], [9, -8], [9, -1], [9, -8], [9, 8], [9, 1], [9, -1], [9, 1], [9, 8]]
