import React, { useState } from 'react'
import { render } from 'react-dom'
const { ipcRenderer } = require('electron')

import Button from './components/Button'
import CodeBlock from './components/CodeBlock'
import CodeEditor from './components/CodeEditor'
import FormField from './components/FormField'
import TextInput from './components/TextInput'
import logo from './images/pseudopia-logo.svg'

import './styles/App.scss'

const App = () => {
    // State
    const [pseudo, setPseudo] = useState(
        '<Wrapper>\n    <Pseudopia />\n</Wrapper>'
    )
    const handleTextChange = text => setPseudo(text)

    const [baseComponentName, setBaseComponentName] = useState('App')
    const handleBaseComponentNameChange = event =>
        setBaseComponentName(event.target.value)

    const [subfolderName, setSubfolderName] = useState('components')
    const handleSubfolderNameChange = event =>
        setSubfolderName(event.target.value)

    const [fileExtension, setFileExtension] = useState('tsx')
    const handleFileExtensionClick = event =>
        setFileExtension(event.target.value)

    const [buildPath, setBuildPath] = useState('')
    const [appTemplatePath, setAppTemplatePath] = useState('')
    const [componentTemplatePath, setComponentTemplatePath] = useState('')
    const [unitTestTemplatePath, setUnitTestTemplatePath] = useState('')

    // Functionality
    const createHandleDialogOpen = (setFn, isFile = false) => async () => {
        const filePath = await ipcRenderer.invoke('open-file', isFile)
        setFn(filePath)
    }

    const handleBuild = () => {
        ipcRenderer.send('write-files', {
            appTemplatePath,
            baseComponentName,
            buildPath,
            componentTemplatePath,
            fileExtension,
            pseudo,
            subfolderName,
            unitTestTemplatePath
        })
    }

    const handleSubmit = event => {
        event.preventDefault()
        handleBuild()
    }

    // Render logic
    const disableBuildButton = !buildPath || !baseComponentName || !pseudo

    return (
        <div style={{ padding: '1rem' }}>
            <img
                src={logo}
                style={{ padding: '1.5rem 0' }}
                alt="Pseudopia Logo"
            />
            <div className="columns">
                <div className="column is-8">
                    <FormField label="Pseudo Code">
                        <CodeEditor
                            id="pseudoCode"
                            handleChange={handleTextChange}
                            value={pseudo}
                        />
                    </FormField>
                </div>
                <div className="column is-4">
                    <form onSubmit={handleSubmit}>
                        <FormField label="Base Component Name">
                            <TextInput
                                handleChange={handleBaseComponentNameChange}
                                value={baseComponentName}
                            />
                        </FormField>
                        <FormField label="Subfolder Name">
                            <TextInput
                                handleChange={handleSubfolderNameChange}
                                value={subfolderName}
                            />
                        </FormField>
                        <FormField label="File Type">
                            <div className="buttons has-addons">
                                <Button
                                    className={`button is-primary ${
                                        fileExtension === 'tsx'
                                            ? 'is-selected'
                                            : 'is-outlined'
                                    }`}
                                    handleClick={handleFileExtensionClick}
                                    value="tsx"
                                    text=".tsx"
                                />
                                <Button
                                    className={`button is-primary ${
                                        fileExtension === 'js'
                                            ? 'is-selected'
                                            : 'is-outlined'
                                    }`}
                                    handleClick={handleFileExtensionClick}
                                    value="js"
                                    text=".js"
                                />
                            </div>
                        </FormField>
                        <FormField label="Build Directory">
                            {buildPath && (
                                <FormField>
                                    <CodeBlock code={buildPath} />
                                </FormField>
                            )}
                            <Button
                                fullwidth
                                className="is-primary is-outlined"
                                text="Set Build Directory"
                                handleClick={createHandleDialogOpen(
                                    setBuildPath
                                )}
                            />
                        </FormField>
                        <FormField label="Custom Templates (Optional)">
                            <div className="box">
                                <FormField label="App Template Path">
                                    {appTemplatePath && (
                                        <FormField>
                                            <CodeBlock code={appTemplatePath} />
                                        </FormField>
                                    )}
                                    <Button
                                        fullwidth
                                        className="is-primary is-outlined"
                                        text="Set App Template Path"
                                        handleClick={createHandleDialogOpen(
                                            setAppTemplatePath,
                                            true
                                        )}
                                    />
                                </FormField>
                                <FormField label="Component Template Path">
                                    {componentTemplatePath && (
                                        <FormField>
                                            <CodeBlock
                                                code={componentTemplatePath}
                                            />
                                        </FormField>
                                    )}
                                    <Button
                                        fullwidth
                                        className="is-primary is-outlined"
                                        text="Set Component Template Path"
                                        handleClick={createHandleDialogOpen(
                                            setComponentTemplatePath,
                                            true
                                        )}
                                    />
                                </FormField>
                                <FormField label="Unit Test Template Path">
                                    {unitTestTemplatePath && (
                                        <FormField>
                                            <CodeBlock
                                                code={unitTestTemplatePath}
                                            />
                                        </FormField>
                                    )}
                                    <Button
                                        fullwidth
                                        className="is-primary is-outlined"
                                        text="Set Unit Test Template Path"
                                        handleClick={createHandleDialogOpen(
                                            setUnitTestTemplatePath,
                                            true
                                        )}
                                    />
                                </FormField>
                            </div>
                        </FormField>
                        <FormField label="Actions">
                            <Button
                                fullwidth
                                className="is-primary"
                                text="Build"
                                type="submit"
                                disabled={disableBuildButton}
                            />
                        </FormField>
                    </form>
                </div>
            </div>
        </div>
    )
}

render(<App />, document.getElementById('app'))
