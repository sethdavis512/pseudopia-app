import React from 'react'

const Modal = ({ isActive, children }) => (
    <div className={`modal ${(isActive) && 'is-active'}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
            {children}
        </div>
    </div>
)

export default Modal
