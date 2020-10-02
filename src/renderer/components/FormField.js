import React from 'react'

const FormField = ({ children, label }) => {
    return (
        <div className="field pseudopia-field">
            {label && <label className="label">{label}</label>}
            <div className="control">{children}</div>
        </div>
    )
}

export default FormField
