function dpllT() {
  while (true) {
    let conflict = false
    if (unit_propagation()) {
      let res = T.check(!all_assigned())
      if (res === false) conflict = true
      else if (res === True) conflict = theory_propagation()
      else if (learn_T_lemmas()) continue
      else if (!all_assigned()) decide()
      else {
        build_model()
        return true
      }
    } else {
      conflict = true
    }
    if (conflict) {
      let [lvl, cls] = conflict_analysis()
      if (lvl < 0) return false
      backtrack(lvl)
      learn(cls)
    }
  }
}
