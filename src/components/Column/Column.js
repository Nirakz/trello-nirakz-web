import React, { useEffect, useRef, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { cloneDeep } from 'lodash'
import './Column.scss'
import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import { mapOrder } from 'utilities/sorts'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { MODAL_ACTION_CONFIRM } from 'utilities/constants'
import { saveContentAfterEnter, selectAllInLineText } from 'utilities/contentEditable'
import { createNewCard, updateColumn } from 'actions/ApiCall'

function Column(props) {
  const { column, onCardDrop, onUpdateColumnState } = props
  const cards = mapOrder(column.cards, column.cardOrder, '_id')

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal)

  const [columnTitle, setColumnTitle] = useState('')
  const handleColumnTitleChange = (e) => setColumnTitle(e.target.value)

  const [openNewCardFrom, setOpenNewCardFrom] = useState(false)
  const toggleOpenNewCardFrom = () => {setOpenNewCardFrom(!openNewCardFrom)}

  const newCardTextareaRef = useRef(null)

  const [newCardTitle, setNewCardTitle] = useState('')
  const onNewCardTitleChange = (e) => setNewCardTitle(e.target.value)

  useEffect(() => {
    setColumnTitle(column.title)
  }, [column.title])

  useEffect(() => {
    if (newCardTextareaRef && newCardTextareaRef.current) {
      newCardTextareaRef.current.focus()
      newCardTextareaRef.current.select()
    }
  }, [openNewCardFrom])

  //Remove column
  const onConfirmModalAction = (type) => {
    if (type === MODAL_ACTION_CONFIRM) {
      const newColumn = {
        ...column,
        _destroy: true
      }

      //Call API update column
      updateColumn(newColumn._id, newColumn).then(updatedColumn => {
        onUpdateColumnState(updatedColumn)
      })
    }
    toggleShowConfirmModal()
  }

  //Update column
  const handleColumnTitleBlur = () => {
    if (columnTitle !== column.title) {
      const newColumn = {
        ...column,
        title: columnTitle
      }

      //Call API update column
      updateColumn(newColumn._id, newColumn).then(updatedColumn => {
        updatedColumn.cards = newColumn.cards
        onUpdateColumnState(updatedColumn)
      })
    }
  }

  const addNewCard = () => {
    if (!newCardTitle) {
      newCardTextareaRef.current.focus()
      return
    }
    const newCardToAdd = {
      boardId: column.boardId,
      columnId: column._id,
      title: newCardTitle.trim()
    }
    //Call API
    createNewCard(newCardToAdd).then( card => {
      let newColumn = cloneDeep(column)

      newColumn.cards.push(card)
      newColumn.cardOrder.push(card._id)

      onUpdateColumnState(newColumn)
      setNewCardTitle('')
      toggleOpenNewCardFrom()
    })
  }


  return (
    <div className='column'>
      <header className='column-drag-handle'>
        <div className='column-title'>
          <Form.Control
            size='sm'
            type='text'
            className='dori-content-editable'
            value={columnTitle}
            onChange={handleColumnTitleChange}
            onBlur={handleColumnTitleBlur}
            onKeyDown={saveContentAfterEnter}
            onClick={selectAllInLineText}
            onMouseDown={e => e.preventDefault()}
            spellCheck={false}
          />
        </div>
        <div className='column-dropdown-actions'>
          <Dropdown>
            <Dropdown.Toggle id='dropdown-basic' size='sm' className='dropdown-btn'/>

            <Dropdown.Menu>
              <Dropdown.Item>Add card...</Dropdown.Item>
              <Dropdown.Item onClick={toggleShowConfirmModal}>Remove column...</Dropdown.Item>
              <Dropdown.Item>Move all cards in this column(beta)...</Dropdown.Item>
              <Dropdown.Item>Archive all cards in this column(beta)...</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
      <div className='card-list'>
        <Container
          groupName='dori-columns'
          onDrop={dropResult => onCardDrop(column._id, dropResult)}
          getChildPayload={index => cards[index]}
          dragClass='card-ghost'
          dropClass='card-ghost-drop'
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'card-drop-preview'
          }}
          dropPlaceholderAnimationDuration={200}
        >
          {cards.map((card, index) =>
            <Draggable key={index}>
              <Card card={card} />
            </Draggable>
          )}
        </Container>
        { openNewCardFrom &&
          <div className='add-new-card'>
            <Form.Control
              size='sm'
              as='textarea'
              rows='3'
              placeholder='Enter a title...'
              className='textarea-enter-new-card'
              ref={newCardTextareaRef}
              value={newCardTitle}
              onChange={onNewCardTitleChange}
              onKeyDown={event => (event.key === 'Enter' && addNewCard())}
            />
          </div>
        }
      </div>
      <footer>
        { openNewCardFrom &&
          <div className='add-new-card-actions'>
            <Button variant='success' size='sm' onClick={addNewCard}>Add Card</Button>{' '}
            <span className='cancle-icon' onClick={toggleOpenNewCardFrom}>
              <i className='fa fa-trash-o icon'></i>
            </span>
          </div>
        }
        {!openNewCardFrom &&
          <div className='footer-actions' onClick={toggleOpenNewCardFrom}>
            <i className='fa fa-plus icon'></i>  Add another card
          </div>
        }
      </footer>
      <ConfirmModal
        show={showConfirmModal}
        onAction={onConfirmModalAction}
        title='Remove Column'
        content={`Are you sure remove <strong>${column.title}</strong> ? <br /> All related card will aslo be removed!`}
      />
    </div>
  )
}

export default Column
