//onKeyDown
export const saveContentAfterEnter = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.target.blur()
  }
}

// Select all input value when onClick
export const selectAllInLineText = (e) => {
  e.target.focus()
  e.target.select()
}