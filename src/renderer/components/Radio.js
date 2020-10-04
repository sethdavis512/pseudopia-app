import React from 'react'

const Radio = ({ checked, handleChange, label, name, id, value }) => {
    return (
        <>
            <input
                checked={checked}
                className="is-checkradio"
                id={id}
                name={name}
                onChange={handleChange}
                type="radio"
                value={value}
            />
            <label className="pseudopia-radio" htmlFor={id}>{label}</label>
        </>
    )
}

export default Radio
