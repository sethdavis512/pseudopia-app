import React from 'react'

const Select = ({ children, handleChange, value, ...rest }) => {
    return (
        <div
            className="select pseudopia-select"
            onChange={handleChange}
            {...rest}
        >
            <select value={value}>{children}</select>
        </div>
    )
}

export default Select
