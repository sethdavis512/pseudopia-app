'use strict'

const { app, BrowserWindow, dialog, ipcMain } = require('electron')
import * as path from 'path'
import { format as formatUrl } from 'url'
const {
    compileContent,
    formatCode,
    getASTData,
    getConstants,
    handleAST,
    writeFile
} = require('./utils/utilFunctions')
const Handlebars = require('handlebars')

Handlebars.registerHelper('isTypescript', value => value === 'tsx')

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
    const window = new BrowserWindow({
        fullscreenable: false,
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        },
        title: 'Pseudopia'
    })

    if (isDevelopment) {
        window.webContents.openDevTools()
    }

    if (isDevelopment) {
        window.loadURL(
            `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
        )
    } else {
        window.loadURL(
            formatUrl({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file',
                slashes: true
            })
        )
    }

    window.on('closed', () => {
        mainWindow = null
    })

    window.webContents.on('devtools-opened', () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })

    return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow()
    }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    mainWindow = createMainWindow()
})

// ========================

const getHBSTemplatePath = fileName =>
    `${__dirname}/hbs-templates/${fileName}.hbs`

ipcMain.handle('open-file', async (event, isFile) => {
    const properties = isFile
        ? ['openFile']
        : ['openDirectory', 'createDirectory']

    const response = await dialog.showOpenDialog({
        buttonLabel: 'Open',
        properties,
        filters: []
    })

    return response.filePaths[0]
})

ipcMain.on('write-files', (event, config) => {
    let hasError = false

    const handleASTError = error => {
        mainWindow.webContents.send('compile-error', error)
        hasError = true
    }
    const AST = getASTData(config.pseudo, handleASTError)

    if (!AST) return

    const FileConstants = getConstants(config)
    const components = handleAST(AST.body)

    // Write base component ie App
    const renderContent = new Handlebars.SafeString(config.pseudo)

    const handleHBSError = error => {
        mainWindow.webContents.send('compile-error', error)
        hasError = true
    }

    const deDupedImports = components.reduce(
        (uniqueImports, currentComponent) => {
            const isUnique =
                uniqueImports.findIndex(
                    component => component.childName === currentComponent.name
                ) === -1

            if (isUnique) {
                uniqueImports.push({
                    childName: currentComponent.name,
                    componentDirName: config.hasSubfolder
                        ? FileConstants.SUBFOLDER_NAME
                        : null
                })
            }

            return uniqueImports
        },
        []
    )

    const appContent = compileContent(
        config.baseComponentTemplate,
        {
            render: renderContent,
            name: FileConstants.BASE_COMPONENT_NAME,
            extension: FileConstants.EXTENSION,
            imports: deDupedImports
        },
        handleHBSError
    )
    const prettyAppContent = formatCode(appContent, config.prettierConfig)

    writeFile({
        directory: FileConstants.BUILD_PATH,
        fileName: FileConstants.BASE_COMPONENT_NAME,
        fileExtension: FileConstants.EXTENSION,
        content: prettyAppContent
    })

    // Write components
    components.forEach(component => {
        const componentContent = compileContent(
            config.componentTemplate,
            {
                extension: FileConstants.EXTENSION,
                name: component.name,
                props: component.props
            },
            handleHBSError
        )
        const prettyComponentContent = formatCode(
            componentContent,
            config.prettierConfig
        )

        writeFile({
            directory: FileConstants.COMPONENT_PATH(config.hasSubfolder),
            fileName: component.name,
            fileExtension: FileConstants.EXTENSION,
            content: prettyComponentContent
        })

        if (config.hasUnitTests) {
            // Write unit tests
            const unitTestContent = compileContent(config.unitTestTemplate, {
                name: component.name
            })
            const prettyUnitTestContent = formatCode(
                unitTestContent,
                config.prettierConfig
            )

            writeFile({
                directory: FileConstants.UNIT_TEST_PATH(config.hasSubfolder),
                fileName: `${component.name}.test`,
                fileExtension: FileConstants.EXTENSION,
                content: prettyUnitTestContent
            })
        }
    })

    if (!hasError) {
        mainWindow.webContents.send('compile-success')
    }
})
