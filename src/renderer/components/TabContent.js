import React from 'react';

const TabContent = ({ children, show }) => {
    return show ? <div className="tab-content">{children}</div> : null;
}

export default TabContent;
