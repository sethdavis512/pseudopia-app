import React from 'react'

const SelectOption = ({ children, value }) => {
    return <option value={value}>{children}</option>
}

export default SelectOption
