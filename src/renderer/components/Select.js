import React from 'react'

const Select = ({ children, handleChange, ...rest }) => {
    return (
        <div className="select pseudopia-select" onChange={handleChange} {...rest}>
            <select>{children}</select>
        </div>
    )
}

export default Select
