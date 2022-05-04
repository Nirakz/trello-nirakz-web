import React, { useState, useEffect, useRef } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { Container as BootstrapContainer,
  Col, Row, Form, Button } from 'react-bootstrap'
import { isEmpty, cloneDeep } from 'lodash'
import './BoardContent.scss'
import Column from 'components/Column/Column'
import { mapOrder } from 'utilities/sorts'
import { applyDrag } from 'utilities/dragDrop'
import { fetchBoardDetails, createNewColumn,
  updateBoard, updateColumn, updateCard } from 'actions/ApiCall'

function BoardContent() {
  const [board, setBoard] = useState({})
  const [columns, setColumns] = useState([])
  const [openNewColumnFrom, setOpenNewColumnFrom] = useState(false)
  const toggleOpenNewColumnFrom = () => {setOpenNewColumnFrom(!openNewColumnFrom)}

  const newColumnInputRef = useRef(null)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const onNewColumnTitleChange = (e) => setNewColumnTitle(e.target.value)


  useEffect(() => {
    fetchBoardDetails('6268b46b410b960608db4581').then( board => {
      setBoard (board)
      setColumns (mapOrder(board.columns, board.columnOrder, '_id'))
    } )
  }, [])

  useEffect(() => {
    if (newColumnInputRef && newColumnInputRef.current) {
      newColumnInputRef.current.focus()
      newColumnInputRef.current.select()
    }
  }, [openNewColumnFrom])

  if (isEmpty(board)) {
    return <div className='not-found' style={{ 'padding': '10px', 'color': 'white' }}>Board  not found!</div>
  }

  const onColumnDrop = (dropResult) => {
    let newColumns = cloneDeep(columns)
    newColumns = applyDrag(newColumns, dropResult)

    let newBoard = cloneDeep(board)
    newBoard.columnOrder = newColumns.map(c => c._id)
    newBoard.columns = newColumns

    setColumns(newColumns)
    setBoard(newBoard)

    //Call API update columnOrder in boards.
    updateBoard(newBoard._id, newBoard).catch(() => {
      setColumns(columns)
      setBoard(board)
    })

  }

  const onCardDrop = (columnId, dropResult) => {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      let newColumns = cloneDeep(columns)

      let currentColumn = newColumns.find(c => c._id === columnId)

      currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
      currentColumn.cardOrder = currentColumn.cards.map(c => c._id)

      setColumns(newColumns)

      if (dropResult.removedIndex !== null && dropResult.addedIndex !== null) {
        // Call API update cardOrder in current column
        updateColumn(currentColumn._id, currentColumn).catch(() => setColumns(columns))
      } else {
        // Call API update cardOrder in current column
        updateColumn(currentColumn._id, currentColumn).catch(() => setColumns(columns))

        if (dropResult.addedIndex !== null) {
          let currentCard = cloneDeep(dropResult.payload)
          currentCard.columnId = currentColumn._id
          // Cal API update columnIn in current card
          updateCard(currentCard._id, currentCard)
        }
      }

    }
  }

  const addNewColumn = () => {
    if (!newColumnTitle) {
      newColumnInputRef.current.focus()
      return
    }

    const newColumnToAdd = {
      boardId: board._id,
      title: newColumnTitle.trim()
    }
    //Call API
    createNewColumn(newColumnToAdd).then(column => {
      let newColumns = cloneDeep(columns)
      newColumns.push(column)

      let newBoard = cloneDeep(board)
      newBoard.columnOrder = newColumns.map(c => c._id)
      newBoard.columns = newColumns

      setColumns(newColumns)
      setBoard(newBoard)
      setNewColumnTitle('')
      toggleOpenNewColumnFrom()
    })
  }

  const onUpdateColumnState = (newColumnToUpdate) => {
    const columnIdToUpdate = newColumnToUpdate._id

    let newColumns = [...columns]

    const columnIndexToUpdate = newColumns.findIndex(i => i._id === columnIdToUpdate)

    if (newColumnToUpdate._destroy) {
      //remove column
      newColumns.splice(columnIndexToUpdate, 1)
    } else {
      //update column
      newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate)
    }

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map(c => c._id)
    newBoard.columns = newColumns

    setColumns(newColumns)

    setBoard(newBoard)

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
            <Column
              column={column}
              onCardDrop={onCardDrop}
              onUpdateColumnState={onUpdateColumnState}
            />
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
                ref={newColumnInputRef}
                value={newColumnTitle}
                onChange={onNewColumnTitleChange}
                onKeyDown={event => (event.key === 'Enter' && addNewColumn())}
              />
              <Button variant="success" size='sm' onClick={addNewColumn}>Add Column</Button>{' '}
              <span className='cancle-icon' onClick={toggleOpenNewColumnFrom}>
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
