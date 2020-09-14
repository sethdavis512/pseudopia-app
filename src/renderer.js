const { ipcRenderer } = require('electron')

import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'

import Button from './components/Button'
import CodeBlock from './components/CodeBlock'
import CodeEditor from './components/CodeEditor'
import FormField from './components/FormField'
import Logo from './components/Logo'
import Notification from './components/Notification'
import PathButton from './components/PathButton'
import TextInput from './components/TextInput'
import useLocalStorage from './hooks/useLocalStorage'

import './styles/App.scss'

const App = () => {
    // State
    const [pseudo, setPseudo] = useLocalStorage(
        'pseudo',
        '<Layout>\n    <Header />\n    <Main />\n    <Footer />\n</Layout>'
    )
    const handleTextChange = text => setPseudo(text)

    const [baseComponentName, setBaseComponentName] = useLocalStorage(
        'baseComponentName',
        'App'
    )
    const handleBaseComponentNameChange = event =>
        setBaseComponentName(event.target.value)

    const [subfolderName, setSubfolderName] = useLocalStorage(
        'subfolderName',
        'components'
    )
    const handleSubfolderNameChange = event =>
        setSubfolderName(event.target.value)

    const [fileExtension, setFileExtension] = useLocalStorage(
        'fileExtension',
        'tsx'
    )
    const handleFileExtensionClick = event =>
        setFileExtension(event.target.value)

    const [buildPath, setBuildPath] = useLocalStorage('buildPath', '')
    const clearBuildPath = () => setBuildPath('')

    const [
        baseComponentTemplatePath,
        setBaseComponentTemplatePath
    ] = useLocalStorage('baseComponentTemplatePath', '')
    const clearAppTemplatePath = () => setBaseComponentTemplatePath('')

    const [componentTemplatePath, setComponentTemplatePath] = useLocalStorage('componentTemplatePath', '')
    const clearComponentTemplatePath = () => setComponentTemplatePath('')

    const [unitTestTemplatePath, setUnitTestTemplatePath] = useLocalStorage('unitTestTemplatePath', '')
    const clearUnitTestTemplatePath = () => setUnitTestTemplatePath('')

    const [errorMessage, setErrorMessage] = useState('')
    const handleErrorMessage = error =>
        setErrorMessage(`ERROR: ${error.message}`)

    const [successMessage, setSuccessMessage] = useState('')
    const handleSuccessMessage = () =>
        setSuccessMessage('Successfully compiled!')

    useEffect(() => {
        ipcRenderer.on('hbs-compile-error', (event, error) => {
            handleErrorMessage(error)
        })

        ipcRenderer.on('compile-success', (event, error) => {
            handleSuccessMessage()
        })
    }, [])

    useEffect(() => {
        const successTimeout = setTimeout(() => {
            setSuccessMessage('')
        }, 3000)

        return () => {
            clearTimeout(successTimeout)
        }
    }, [successMessage])

    useEffect(() => {
        const errorTimeout = setTimeout(() => {
            setErrorMessage('')
        }, 3000)

        return () => {
            clearTimeout(errorTimeout)
        }
    }, [errorMessage])

    // Functionality
    const createHandleDialogOpen = (setFn, isFile = false) => async () => {
        const filePath = await ipcRenderer.invoke('open-file', isFile)
        setFn(filePath)
    }

    const handleBuild = () => {
        ipcRenderer.send('write-files', {
            baseComponentTemplatePath,
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
        <div className="app">
            <div className="logo-container">
                <Logo />
            </div>
            <div className="columns reverse-columns">
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
                        <FormField label="Build Path">
                            {buildPath && (
                                <FormField>
                                    <CodeBlock code={buildPath} />
                                </FormField>
                            )}
                            <PathButton
                                clearFn={clearBuildPath}
                                setFn={createHandleDialogOpen(setBuildPath)}
                                text="Build Path"
                                toggleCondition={buildPath}
                            />
                        </FormField>
                        <FormField label="Custom Templates (Optional)">
                            <div className="box">
                                <FormField>
                                    {baseComponentTemplatePath && (
                                        <FormField>
                                            <CodeBlock
                                                code={baseComponentTemplatePath}
                                            />
                                        </FormField>
                                    )}
                                    <PathButton
                                        clearFn={clearAppTemplatePath}
                                        setFn={createHandleDialogOpen(
                                            setBaseComponentTemplatePath,
                                            true
                                        )}
                                        text="Base Component Path"
                                        toggleCondition={
                                            baseComponentTemplatePath
                                        }
                                    />
                                </FormField>
                                <FormField>
                                    {componentTemplatePath && (
                                        <FormField>
                                            <CodeBlock
                                                code={componentTemplatePath}
                                            />
                                        </FormField>
                                    )}
                                    <PathButton
                                        clearFn={clearComponentTemplatePath}
                                        setFn={createHandleDialogOpen(
                                            setComponentTemplatePath,
                                            true
                                        )}
                                        text="Component Path"
                                        toggleCondition={componentTemplatePath}
                                    />
                                </FormField>
                                <FormField>
                                    {unitTestTemplatePath && (
                                        <FormField>
                                            <CodeBlock
                                                code={unitTestTemplatePath}
                                            />
                                        </FormField>
                                    )}
                                    <PathButton
                                        clearFn={clearUnitTestTemplatePath}
                                        setFn={createHandleDialogOpen(
                                            setUnitTestTemplatePath,
                                            true
                                        )}
                                        text="Unit Test Path"
                                        toggleCondition={unitTestTemplatePath}
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
                <div className="column is-8">
                    <FormField label="Pseudo Code">
                        <CodeEditor
                            id="pseudoCode"
                            handleChange={handleTextChange}
                            value={pseudo}
                        />
                    </FormField>
                </div>
            </div>
            <div className="notification-bar">
                {errorMessage && <Notification>{errorMessage}</Notification>}
                {successMessage && (
                    <Notification className="is-primary">
                        {successMessage}
                    </Notification>
                )}
            </div>
        </div>
    )
}

render(<App />, document.getElementById('app'))
