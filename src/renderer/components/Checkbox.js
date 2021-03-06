import React from 'react'

const Checkbox = ({ id, handleChange, checked, label }) => {
    return (
        <>
            <input
                id={id}
                className="switch pseudopia-switch"
                type="checkbox"
                onChange={handleChange}
                checked={checked}
            />
            <label for={id}>{label}</label>
        </>
    )
}

export default Checkbox
