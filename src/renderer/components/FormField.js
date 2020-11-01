import React from 'react'

const FormField = ({ children, label, hasAddons = false }) => {
    return (
        <div className={"field pseudopia-field " + (hasAddons ? 'has-addons' : '')}>
            {label && <label className="label">{label}</label>}
            {hasAddons
                ? React.Children.map(children, child => (
                    <div className="control">{child}</div>
                ))
                : <div className="control">{children}</div>
            }
        </div>
    )
}

export default FormField
