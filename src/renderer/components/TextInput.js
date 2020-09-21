import React from 'react'

const TextInput = ({ handleChange, id, value }) => (
    <input
        id={id}
        className="input"
        type="text"
        value={value}
        onChange={handleChange}
    />
)

export default TextInput
