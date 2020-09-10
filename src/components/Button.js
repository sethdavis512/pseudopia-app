import React from 'react'

const Button = ({
    handleClick,
    text = 'Add',
    type = 'button',
    className,
    fullwidth,
    ...rest
}) => (
    <button
        className={`button ${className} ${fullwidth && 'is-fullwidth'}`}
        onClick={handleClick}
        type={type}
        {...rest}
    >
        {text}
    </button>
)

export default Button
