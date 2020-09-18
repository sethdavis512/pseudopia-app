import React from 'react'

const Notification = ({ className = 'is-danger', children, showDelete }) => {
    return (
        <div className={`notification ${className}`}>
            {showDelete && <button className="delete"></button>}
            {children}
        </div>
    )
}

export default Notification
