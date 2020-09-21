import React from 'react'
import Button from './Button'

const PathButton = ({ toggleCondition, text, clearFn, setFn }) => {
    return (
        <Button
            fullwidth
            className={`${
                toggleCondition ? 'is-danger' : 'is-primary'
            } is-outlined`}
            text={`${toggleCondition ? 'Clear' : 'Set'} ${text}`}
            handleClick={toggleCondition ? clearFn : setFn}
        />
    )
}

export default PathButton
