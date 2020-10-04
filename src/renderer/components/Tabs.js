import React from 'react'

const Tabs = ({ children }) => {
    return (
        <div className="tabs is-boxed">
            <ul>{children}</ul>
        </div>
    )
}

export default Tabs
