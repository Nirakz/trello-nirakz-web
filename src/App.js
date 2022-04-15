import React from 'react'

import './App.scss'
//components
import AppBar from 'components/AppBar/AppBar'
import BoardBar from 'components/BoardBar/BoardBar'
import BoardContent from 'components/BoardContent/BoardContent'

function App() {
  return (
    <div className="trello-dori-master">
      <AppBar />
      <BoardBar />
      <BoardContent />
    </div>
  )
}

export default App
