const { ipcRenderer } = require('electron')

import React, { useEffect, useReducer, useState } from 'react'
import { render } from 'react-dom'

import Button from './components/Button'
import Checkbox from './components/Checkbox'
import CodeBlock from './components/CodeBlock'
import CodeEditor from './components/CodeEditor'
import FormField from './components/FormField'
import Logo from './components/Logo'
import Notification from './components/Notification'
import Radio from './components/Radio'
import Select from './components/Select'
import SelectOption from './components/SelectOption'
import Tab from './components/Tab'
import TabContent from './components/TabContent'
import Tabs from './components/Tabs'
import TextInput from './components/TextInput'
import useLocalStorage from './hooks/useLocalStorage'

import { getInitialState, getUniqueId } from './utils/utilFunctions'
import { TabStates, TemplateOptions } from './constants'

import './styles/App.scss'

const ActionTypes = {
    SET_TEXT: 'SET_TEXT',
    SET_TOGGLE: 'SET_TOGGLE',
    SET_DATA: 'SET_DATA'
}

const App = () => {
    const [localStorageState, setLocalStorageState] = useLocalStorage(
        'app',
        getInitialState()
    )
    const [state, dispatch] = useReducer((state, { payload, type }) => {
        switch (type) {
            case ActionTypes.SET_TEXT:
                return {
                    ...state,
                    [payload.targetKey]: payload.text
                }

            case ActionTypes.SET_TOGGLE:
                return {
                    ...state,
                    [payload.targetKey]: !state[payload.targetKey]
                }

            case ActionTypes.SET_DATA:
                return {
                    ...state,
                    [payload.targetKey]: payload.data
                }

            default:
                return state
        }
    }, localStorageState)
    const stringifiedState = JSON.stringify(state)

    useEffect(() => {
        setLocalStorageState(state)
    }, [stringifiedState])

    const {
        baseComponentName,
        baseComponentTemplate,
        buildPath,
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
        dispatch({
            type: ActionTypes.SET_TEXT,
            payload: {
                targetKey,
                text
            }
        })
    }

    const createHandleChange = targetKey => event => {
        dispatch({
            type: ActionTypes.SET_TEXT,
            payload: {
                targetKey,
                text: event.target.value
            }
        })
    }

    const createHandleTabChange = targetKey => event => {
        dispatch({
            type: ActionTypes.SET_TEXT,
            payload: {
                targetKey,
                text: event.currentTarget.id
            }
        })
    }

    const createHandleToggle = targetKey => () => {
        dispatch({
            type: ActionTypes.SET_TOGGLE,
            payload: {
                targetKey
            }
        })
    }

    const createHandleReset = (targetKey, resetData) => () => {
        dispatch({
            type: ActionTypes.SET_DATA,
            payload: {
                targetKey,
                data: resetData
            }
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
            baseComponentTemplate,
            buildPath,
            componentTemplate,
            fileExtension,
            hasSubfolder,
            hasUnitTests,
            prettierConfig,
            pseudo,
            subfolderName,
            unitTestTemplate
        })
    }

    const handleSubmit = event => {
        event.preventDefault()
        handleBuild()
    }

    const handleTemplateReset = createHandleReset(
        currentTemplateName,
        getInitialState()[currentTemplateName]
    )

    const fileExtensionHandleChange = createHandleChange('fileExtension')

    const pseudoTabCurrent = currentTab === TabStates.PSEUDO
    const prettierTabCurrent = currentTab === TabStates.PRETTIER
    const templateTabCurrent = currentTab === TabStates.TEMPLATES

    const tsxRadioSelected = fileExtension === 'tsx'
    const jsRadioSelected = fileExtension === 'js'
    const jsxRadioSelected = fileExtension === 'jsx'

    const swapRadioClassName = isSelected =>
        isSelected ? 'is-selected' : 'is-outlined'

    const disableBuildButton =
        !buildPath ||
        !baseComponentName ||
        !pseudo ||
        (hasSubfolder && !subfolderName)

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
                            Pseudo
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
                            <div className="space-between">
                                <Select
                                    handleChange={createHandleChange(
                                        'currentTemplateName'
                                    )}
                                    style={{ marginBottom: '1rem' }}
                                    value={currentTemplateName}
                                >
                                    {TemplateOptions.map(option => (
                                        <SelectOption
                                            value={option.value}
                                            key={getUniqueId(option.value)}
                                        >
                                            {option.label}
                                        </SelectOption>
                                    ))}
                                </Select>
                                <Button
                                    handleClick={handleTemplateReset}
                                    text="Reset Template"
                                />
                            </div>
                        </FormField>
                        <CodeEditor
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
                                className={swapRadioClassName(tsxRadioSelected)}
                                handleChange={fileExtensionHandleChange}
                                id="tsxExtension"
                                label=".tsx"
                                name="fileExtensionRadio"
                                value="tsx"
                            />
                            <Radio
                                checked={jsRadioSelected}
                                className={swapRadioClassName(jsRadioSelected)}
                                handleChange={fileExtensionHandleChange}
                                id="jsExtension"
                                label=".js"
                                name="fileExtensionRadio"
                                value="js"
                            />
                            <Radio
                                checked={jsxRadioSelected}
                                className={swapRadioClassName(jsxRadioSelected)}
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
