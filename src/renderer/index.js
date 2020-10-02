const { ipcRenderer } = require('electron')

import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'

import Button from './components/Button'
import CodeBlock from './components/CodeBlock'
import CodeEditor from './components/CodeEditor'
import FormField from './components/FormField'
import Logo from './components/Logo'
import Notification from './components/Notification'
import TextInput from './components/TextInput'
import useLocalStorage from './hooks/useLocalStorage'
import Checkbox from './components/Checkbox'
import Tabs from './components/Tabs'
import Tab from './components/Tab'
import TabContent from './components/TabContent'
import Select from './components/Select'
import SelectOption from './components/SelectOption'
import Radio from './components/Radio'

import { TabStates, TemplateOptions } from './constants'
import { getInitialState } from './utils/utilFunctions'

import './styles/App.scss'

const App = () => {
    const [state, setState] = useLocalStorage('app', getInitialState())
    const {
        baseComponentName,
        buildPath,
        baseComponentTemplate,
        componentTemplate,
        currentTab,
        currentTemplateName,
        fileExtension,
        hasSubfolder,
        hasUnitTests,
        prettierConfig,
        pseudo,
        subfolderName,
        unitTestTemplate
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

    const createHandleTabChange = targetKey => event => {
        setState({
            ...state,
            [targetKey]: event.currentTarget.id
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
            buildPath,
            fileExtension,
            hasSubfolder,
            hasUnitTests,
            prettierConfig,
            pseudo,
            subfolderName,
            baseComponentTemplate,
            componentTemplate,
            unitTestTemplate
        })
    }

    const handleSubmit = event => {
        event.preventDefault()
        handleBuild()
    }

    const disableBuildButton =
        !buildPath || !baseComponentName || !pseudo || !subfolderName

    const pseudoTabCurrent = currentTab === TabStates.PSEUDO
    const prettierTabCurrent = currentTab === TabStates.PRETTIER
    const templateTabCurrent = currentTab === TabStates.TEMPLATES

    const fileExtensionHandleChange = createHandleChange('fileExtension')

    const tsxRadioSelected = fileExtension === 'tsx'
    const tsxRadioClassName = tsxRadioSelected ? 'is-selected' : 'is-outlined'

    const jsRadioSelected = fileExtension === 'js'
    const jsRadioClassName = jsRadioSelected ? 'is-selected' : 'is-outlined'

    const jsxRadioSelected = fileExtension === 'jsx'
    const jsxRadioClassName = jsxRadioSelected ? 'is-selected' : 'is-outlined'

    return (
        <div className="wrapper">
            <div className="logo-container">
                <Logo />
            </div>
            <div className="columns">
                <div className="column is-8">
                    <Tabs>
                        <Tab
                            handleClick={createHandleTabChange('currentTab')}
                            id={TabStates.PSEUDO}
                            isCurrent={pseudoTabCurrent}
                        >
                            Psuedo
                        </Tab>
                        <Tab
                            handleClick={createHandleTabChange('currentTab')}
                            id={TabStates.PRETTIER}
                            isCurrent={prettierTabCurrent}
                        >
                            Prettier
                        </Tab>
                        <Tab
                            handleClick={createHandleTabChange('currentTab')}
                            id={TabStates.TEMPLATES}
                            isCurrent={templateTabCurrent}
                        >
                            Templates
                        </Tab>
                    </Tabs>
                    <TabContent show={pseudoTabCurrent}>
                        <FormField label="Pseudo Code (Required)">
                            <CodeEditor
                                mode="javascript"
                                height="500px"
                                handleChange={createHandleTextChange('pseudo')}
                                id="pseudoCode"
                                value={pseudo}
                            />
                        </FormField>
                    </TabContent>
                    <TabContent show={prettierTabCurrent}>
                        <FormField label="Prettier Config">
                            <CodeEditor
                                mode="json"
                                height="500px"
                                handleChange={createHandleTextChange(
                                    'prettierConfig'
                                )}
                                id="prettierConfigCode"
                                mode="json"
                                value={prettierConfig}
                            />
                        </FormField>
                    </TabContent>
                    <TabContent show={templateTabCurrent}>
                        <FormField label="Choose Template">
                            <Select
                                handleChange={createHandleChange(
                                    'currentTemplateName'
                                )}
                                value={currentTemplateName}
                                style={{ marginBottom: '1rem' }}
                            >
                                {TemplateOptions.map(option => (
                                    <SelectOption value={option.value}>
                                        {option.label}
                                    </SelectOption>
                                ))}
                            </Select>
                        </FormField>
                        <CodeEditor
                            height="500px"
                            handleChange={createHandleTextChange(
                                currentTemplateName
                            )}
                            id="templateEditor"
                            mode="handlebars"
                            value={state[currentTemplateName]}
                        />
                    </TabContent>
                </div>
                <div className="column is-4">
                    <form onSubmit={handleSubmit}>
                        <FormField label="Base Component Name (Required)">
                            <TextInput
                                handleChange={createHandleChange(
                                    'baseComponentName'
                                )}
                                value={baseComponentName}
                            />
                        </FormField>
                        <FormField>
                            <Checkbox
                                id="hasSubfolderCheckbox"
                                checked={hasSubfolder}
                                handleChange={createHandleToggle(
                                    'hasSubfolder'
                                )}
                                label="Include subfolder"
                            />
                        </FormField>
                        {hasSubfolder && (
                            <FormField label="Subfolder Name (Required)">
                                <TextInput
                                    handleChange={createHandleChange(
                                        'subfolderName'
                                    )}
                                    value={subfolderName}
                                />
                            </FormField>
                        )}
                        <FormField>
                            <Checkbox
                                id="unitTestCheckbox"
                                checked={hasUnitTests}
                                handleChange={createHandleToggle(
                                    'hasUnitTests'
                                )}
                                label="Include unit tests"
                            />
                        </FormField>
                        <FormField label="File Type">
                            <Radio
                                checked={tsxRadioSelected}
                                className={tsxRadioClassName}
                                handleChange={fileExtensionHandleChange}
                                id="tsxExtension"
                                label=".tsx"
                                name="fileExtensionRadio"
                                value="tsx"
                            />
                            <Radio
                                checked={jsRadioSelected}
                                className={jsRadioClassName}
                                handleChange={fileExtensionHandleChange}
                                id="jsExtension"
                                label=".js"
                                name="fileExtensionRadio"
                                value="js"
                            />
                            <Radio
                                checked={jsxRadioSelected}
                                className={jsxRadioClassName}
                                handleChange={fileExtensionHandleChange}
                                id="jsxExtension"
                                label=".jsx"
                                name="fileExtensionRadio"
                                value="jsx"
                            />
                        </FormField>
                        <FormField label="Build Path (Required)">
                            {buildPath && (
                                <FormField>
                                    <CodeBlock code={buildPath} />
                                </FormField>
                            )}
                            <Button
                                handleClick={createHandleDialogOpen(
                                    createHandleTextChange('buildPath')
                                )}
                                text={`${
                                    buildPath ? 'Change' : 'Set'
                                } Build Path`}
                            />
                        </FormField>
                        <FormField label="Actions">
                            <div className="buttons">
                                <Button
                                    text="Build"
                                    type="submit"
                                    disabled={disableBuildButton}
                                />
                            </div>
                        </FormField>
                    </form>
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
