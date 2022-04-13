import React from 'react'

import './Column.scss'
import Task from 'components/Task/Task';

function Column(){
    return (
        <div className="column">
          <header>Brainstorm</header>
          <ul className="task-list">
            <Task />
            <li>Add what</li>
            <li>Add what</li>
            <li>Add what</li>
          </ul>
          <footer>Add another card</footer>
        </div>
        
    )
       
}

export default Column
