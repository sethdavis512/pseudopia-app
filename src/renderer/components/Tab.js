import React from 'react'

const Tab = ({ children, handleClick, id, isCurrent }) => {
    return (
        <li id={id} className={isCurrent ? 'is-active' : ''} onClick={handleClick}>
            <a>{children}</a>
        </li>
    )
}

export default Tab
