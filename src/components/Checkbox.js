import React from 'react';

const Checkbox = ({ handleChange, checked, label }) => {
    return (
        <label className="checkbox">
            <input type="checkbox" onChange={handleChange} checked={checked}/>
            {label}
        </label>
    );
};

export default Checkbox;
