import {and as simple_and, or as simple_or, not as simple_not} from "./cnf_simple";

// Algorithm:
// - for every non-leaf T of the syntax-tree of formula F, introduce an additional variable n
//    - ∀b': val(n, b') = val(T, b)

const isInt = Number.isInteger
const isArray = Array.isArray
const abs = Math.abs
const str = json => JSON.stringify(json)

export function and(a, b, ...more) {
  let ret = ["and", a, b]
  if (more.length > 0) return and(ret, ...more)
  return ret
}

export function or(a, b, ...more) {
  let ret = ["or", a, b]
  if (more.length > 0) return or(ret, ...more)
  return ret
}

export function not(a) {
  if (isInt(a)) return -a
  return ["not", a]
}

export function implies(a, b) {
  return or(not(a), b)
}

export function eq(a, b) {
  return and(implies(a, b), implies(b, a))
}

export function _collect_variables(syntax_tree, variables = new Set()) {
  let [operator, operand1, operand2] = syntax_tree
  if (isInt(operand1)) variables.add(abs(operand1))
  else _collect_variables(operand1, variables)
  if (operator === "not") return variables
  if (isInt(operand2)) variables.add(abs(operand2))
  else _collect_variables(operand2, variables)
  return variables
}

export function _substitute(node, variables, replacements) {
  // postorder-traversal: if(node) { postorder(node.left); postorder(node.right); visit(node) }
  if (!isArray(node)) return node // leaf
  let [operator, operand1, operand2] = node
  let new1 = _substitute(operand1, variables, replacements)
  let new2 = _substitute(operand2, variables, replacements)
  variables.unshift(variables[0] + 1) // prepend
  replacements.set(variables[0], [operator, new1, new2])
  return variables[0]
}

export function _cleanup(node) {
  if (!isArray(node)) return node // leaf
  let [operator, operand1, operand2] = node
  let new1 = _cleanup(operand1)
  let new2 = _cleanup(operand2)
  console.log(str(node), str({new1, new2}))
  switch (operator) {
    case "and":
      return simple_and(new1, new2)
    case "or":
      return simple_or(new1, new2)
    case "not":
      return simple_not(new1)
    default:
      throw "unknown operator"
  }
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
  console.log(replacements)
  for (let [v, formula] of replacements.entries()) {
    console.log("push", v, str(formula))
    cnf.push(_cleanup(eq(v, formula)))
  }
  return cnf
}

let x = [
  "or",
  ["not", ["or", 1, 2]],
  4
]
