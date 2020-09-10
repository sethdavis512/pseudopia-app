import React from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-monokai'

const CodeEditor = ({ handleChange, value }) => {
    return (
        <AceEditor
            editorProps={{ $blockScrolling: true }}
            fontSize={18}
            height="250px"
            mode="jsx"
            name="codeEditor"
            onChange={handleChange}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            }}
            theme="monokai"
            value={value}
            width="100%"
        />
    )
}

export default CodeEditor
