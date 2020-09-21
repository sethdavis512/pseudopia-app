import React from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-monokai'

const CodeEditor = ({ handleChange, id, value, height, mode = 'js' }) => {
    return (
        <AceEditor
            editorProps={{ $blockScrolling: true }}
            fontSize={18}
            mode={mode}
            name={id}
            onChange={handleChange}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            }}
            theme="monokai"
            value={value}
            width="100%"
            height={height}
        />
    )
}

export default CodeEditor
