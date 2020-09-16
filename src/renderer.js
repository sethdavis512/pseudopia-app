const { ipcRenderer } = require('electron')

import React, { useEffect, useState } from 'react'
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
import Checkbox from './components/Checkbox'

const App = () => {
    const [state, setState] = useLocalStorage('app', {
        baseComponentName: 'App',
        baseComponentTemplatePath: '',
        buildPath: '',
        componentTemplatePath: '',
        fileExtension: 'tsx',
        hasSubfolder: true,
        pseudo:
            '<Layout>\n    <Header />\n    <Main />\n    <Footer />\n</Layout>',
        subfolderName: 'components',
        unitTestTemplatePath: ''
    })

    const {
        baseComponentName,
        baseComponentTemplatePath,
        buildPath,
        componentTemplatePath,
        fileExtension,
        hasSubfolder,
        pseudo,
        subfolderName,
        unitTestTemplatePath
    } = state

    const createHandleTextChange = targetKey => text => {
        setState({
            ...state,
            [targetKey]: text
        })
    }

    const createHandleChange = targetKey => event => {
        setState({
            ...state,
            [targetKey]: event.target.value
        })
    }

    const createHandleClear = targetKey => () => {
        setState({
            ...state,
            [targetKey]: ''
        })
    }

    const createHandleToggle = targetKey => () => {
        setState({
            ...state,
            [targetKey]: !state[targetKey]
        })
    }

    const createHandleDialogOpen = (setFn, isFile = false) => async () => {
        const filePath = await ipcRenderer.invoke('open-file', isFile)
        setFn(filePath)
    }

    const [errorMessage, setErrorMessage] = useState('')
    const handleErrorMessage = error =>
        setErrorMessage(`ERROR: ${error.message}`)

    const [successMessage, setSuccessMessage] = useState('')
    const handleSuccessMessage = () =>
        setSuccessMessage('Successfully compiled!')

    useEffect(() => {
        ipcRenderer.on('compile-error', (event, error) => {
            handleErrorMessage(error)
        })

        ipcRenderer.on('compile-success', () => {
            handleSuccessMessage()
        })

        return () => {
            ipcRenderer.removeAllListeners('compile-success')
            ipcRenderer.removeAllListeners('compile-error')
        }
    }, [])

    useEffect(() => {
        const successTimeout = setTimeout(() => {
            setSuccessMessage('')
        }, 3000)

        const errorTimeout = setTimeout(() => {
            setErrorMessage('')
        }, 3000)

        return () => {
            clearTimeout(successTimeout)
            clearTimeout(errorTimeout)
        }
    }, [successMessage, errorMessage])

    const handleBuild = () => {
        ipcRenderer.send('write-files', {
            baseComponentName,
            baseComponentTemplatePath,
            buildPath,
            componentTemplatePath,
            fileExtension,
            hasSubfolder,
            pseudo,
            subfolderName,
            unitTestTemplatePath
        })
    }

    const handleSubmit = event => {
        event.preventDefault()
        handleBuild()
    }

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
                                handleChange={createHandleChange(
                                    'baseComponentName'
                                )}
                                value={baseComponentName}
                            />
                        </FormField>
                        <Checkbox
                            label="Subfolder?"
                            handleChange={createHandleToggle('hasSubfolder')}
                            checked={hasSubfolder}
                        />
                        {hasSubfolder && (
                            <FormField label="Subfolder Name">
                                <TextInput
                                    handleChange={createHandleChange(
                                        'subfolderName'
                                    )}
                                    value={subfolderName}
                                />
                            </FormField>
                        )}
                        <FormField label="File Type">
                            <div className="buttons has-addons">
                                <Button
                                    className={`button is-primary ${
                                        fileExtension === 'tsx'
                                            ? 'is-selected'
                                            : 'is-outlined'
                                    }`}
                                    handleClick={createHandleChange(
                                        'fileExtension'
                                    )}
                                    value="tsx"
                                    text=".tsx"
                                />
                                <Button
                                    className={`button is-primary ${
                                        fileExtension === 'js'
                                            ? 'is-selected'
                                            : 'is-outlined'
                                    }`}
                                    handleClick={createHandleChange(
                                        'fileExtension'
                                    )}
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
                                clearFn={createHandleClear('buildPath')}
                                setFn={createHandleDialogOpen(
                                    createHandleTextChange('buildPath')
                                )}
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
                                        clearFn={createHandleClear(
                                            'baseComponentTemplatePath'
                                        )}
                                        setFn={createHandleDialogOpen(
                                            createHandleTextChange(
                                                'baseComponentTemplatePath'
                                            ),
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
                                        clearFn={createHandleClear(
                                            'componentTemplatePath'
                                        )}
                                        setFn={createHandleDialogOpen(
                                            createHandleTextChange(
                                                'componentTemplatePath'
                                            ),
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
                                        clearFn={createHandleClear(
                                            'unitTestTemplatePath'
                                        )}
                                        setFn={createHandleDialogOpen(
                                            createHandleTextChange(
                                                'unitTestTemplatePath'
                                            ),
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
                            handleChange={createHandleTextChange('pseudo')}
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
