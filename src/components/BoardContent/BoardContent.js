import React, { useState, useEffect, useRef } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { Container as BootstrapContainer,
  Col, Row, Form, Button } from 'react-bootstrap'
import { isEmpty } from 'lodash'
import './BoardContent.scss'
import Column from 'components/Column/Column'
import { mapOrder } from 'utilities/sorts'
import { initialData } from 'actions/initialData'
import { applyDrag } from 'utilities/dragDrop'

function BoardContent() {
  const [board, setBoard] = useState({})
  const [columns, setColumns] = useState([])
  const [openNewColumnFrom, setOpenNewColumnFrom] = useState(false)

  const newColumnIputRef = useRef(null)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const onNewColumnTitleChange = (e) => setNewColumnTitle(e.target.value)


  useEffect(() => {
    const boardFromDB = initialData.boards.find(board => board.id === 'board-1')
    if (boardFromDB) {
      setBoard (boardFromDB)
      setColumns (mapOrder(boardFromDB.columns, boardFromDB.columnOrder, 'id'))
    }
  }, [])
  useEffect(() => {
    if (newColumnIputRef && newColumnIputRef.current) {
      newColumnIputRef.current.focus()
      newColumnIputRef.current.select()
    }
  }, [openNewColumnFrom])

  if (isEmpty(board)) {
    return <div className='not-found' style={{ 'padding': '10px', 'color': 'white' }}>Board  not found!</div>
  }

  const onColumnDrop = (dropResult) => {
    let newColumns = [...columns]
    newColumns = applyDrag(newColumns, dropResult)

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map(c => c.id)
    newBoard.columns = newColumns

    setColumns(newColumns)
    setBoard(newBoard)
  }

  const onCardDrop = (columnId, dropResult) => {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      let newColumns = [...columns]

      let currentColumn = newColumns.find(c => c.id === columnId)

      currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
      currentColumn.cardOrder = currentColumn.cards.map(c => c.id)

      setColumns(newColumns)
    }
  }

  const toggleOpenNewColumnFrom = () => {
    setOpenNewColumnFrom(!openNewColumnFrom)
  }

  const addNewColumn = () => {
    if (!newColumnTitle) {
      newColumnIputRef.current.focus()
      return
    }

    const newColumnToAdd = {
      id: Math.random().toString(36).substr(2, 5),
      boardId: board.id,
      title: newColumnTitle.trim(),
      cardOrder: [],
      cards: []
    }

    let newColumns = [...columns]
    newColumns.push(newColumnToAdd)

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map(c => c.id)
    newBoard.columns = newColumns

    setColumns(newColumns)
    setBoard(newBoard)

    setNewColumnTitle('')

    toggleOpenNewColumnFrom()
  }

  return (
    <div className='board-content'>

      <Container
        orientation='horizontal'
        onDrop={onColumnDrop}
        getChildPayload={index => columns[index]}
        dragHandleSelector='.column-drag-handle'
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'column-drop-preview'
        }}
      >
        {columns.map((column, index) => (
          <Draggable key={index}>
            <Column column={column} onCardDrop={onCardDrop} />
          </Draggable>
        ))}
      </Container>

      <BootstrapContainer className='trello-clone-container'>
        {!openNewColumnFrom &&
          <Row>
            <Col className='add-new-column' onClick={toggleOpenNewColumnFrom}>
              <i className='fa fa-plus icon'></i>  Add another column
            </Col>
          </Row>
        }
        {openNewColumnFrom &&
          <Row>
            <Col className='enter-new-column'>
              <Form.Control
                size="sm" type="text" placeholder="Enter column..."
                className='input-enter-new-column'
                ref={newColumnIputRef}
                value={newColumnTitle}
                onChange={onNewColumnTitleChange}
                onKeyDown={event => (event.key === 'Enter' && addNewColumn())}
              />
              <Button variant="success" size='sm' onClick={addNewColumn}>Add Column</Button>{' '}
              <span className='cancle-new-column' onClick={toggleOpenNewColumnFrom}>
                <i className='fa fa-trash-o icon'></i>
              </span>
            </Col>
          </Row>
        }
      </BootstrapContainer>
    </div>
  )
}

export default BoardContent
