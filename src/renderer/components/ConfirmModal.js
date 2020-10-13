import React from 'react'
import Modal from './Modal'
import Button from './Button'

const ConfirmModal = ({ isActive, title, body, acceptLabel, cancelLabel, handleAccept, handleCancel }) => (
    <Modal isActive={isActive}>
        <article className="message is-warning">
            <div className="message-header">
                <p>{title}</p>
            </div>
            <div className="message-body">
                {body}
            </div>
            <footer className="message-footer">
                <Button handleClick={handleAccept} text={acceptLabel} className='has-background-primary-dark has-text-primary-light mr-3' />
                <Button handleClick={handleCancel} text={cancelLabel} />
            </footer>
        </article>
    </Modal>
)

export default ConfirmModal
