const {
    app,
    BrowserWindow,
    Tray,
    dialog,
    Menu,
    MenuItem,
    ipcMain
} = require('electron')
const {
    getASTData,
    getConstants,
    handleAST,
    handleHandleBarCompileReturnContent,
    writeFile
} = require('./utils/utilFunctions')
const Handlebars = require('handlebars')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit()
}

// Window
let mainWindow = null

const createWindow = () => {
    mainWindow = mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        show: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    Menu.setApplicationMenu(applicationMenu)

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // mainWindow.on('blur', () => {
    //     if (!mainWindow.webContents.isDevToolsOpened()) {
    //         mainWindow.hide()
    //     }
    // })

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// Tray
let tray = null

const createTray = () => {
    tray = new Tray('')
    tray.on('right-click', toggleWindow)
    tray.on('double-click', toggleWindow)
    tray.on('click', function (event) {
        toggleWindow()

        // Show devtools when command clicked
        if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
            mainWindow.openDevTools({ mode: 'detach' })
        }
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow()
    // createTray()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

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
    const AST = getASTData(config.pseudo)
    const FileConstants = getConstants(config)

    const components = handleAST(AST.body)

    // Write base component ie App
    const appTemplateString = `import React from 'react'

{{#each imports }}
import {{ name }} from './{{ componentDirName }}/{{ name }}'
{{/each}}

const {{ baseComponentName }}{{#if (isTypescript extension)}}: React.FC{{/if}} = () => {
    return (
        {{ render }}
    )
}

export default {{ baseComponentName}}
`
    const renderContent = new Handlebars.SafeString(config.pseudo)
    const appContent = handleHandleBarCompileReturnContent(appTemplateString, {
        render: renderContent,
        baseComponentName: FileConstants.BASE_COMPONENT_NAME,
        extension: FileConstants.EXTENSION,
        imports: components.map(comp => ({
            name: comp.name,
            componentDirName: FileConstants.SUBFOLDER_NAME
        }))
    })

    writeFile({
        directory: FileConstants.APP_PATH,
        fileName: FileConstants.BASE_COMPONENT_NAME,
        fileExtension: FileConstants.EXTENSION,
        content: appContent
    })

    // Write components
    const componentTemplateString = `import React, { ReactNode } from 'react'

{{#if (isTypescript extension)}}
interface {{ name }}Props {
    children: ReactNode
    {{#each props }}
    {{ this }}: any
    {{/each}}
}
{{/if}}

const {{ name }}{{#if (isTypescript extension)}}: React.FC<{{ name }}Props>{{/if}} = ({ children, {{#each props }}{{ this }},{{/each}} }) => {
    return (
        <div>{children}</div>
    )
}

export default {{ name }}
`

    const unitTestTemplateString = `import React from 'react'
import { render } from 'react-testing-library'
import {{ name }} from '../{{ name }}'

describe('{{ name }}', () => {
    it('should match default snapshot', () => {
        const container = render(<{{ name }} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
`

    components.forEach(component => {
        const componentContent = handleHandleBarCompileReturnContent(
            componentTemplateString,
            {
                extension: FileConstants.EXTENSION,
                name: component.name,
                props: component.props
            }
        )
        writeFile({
            directory: FileConstants.COMPONENT_PATH,
            fileName: component.name,
            fileExtension: FileConstants.EXTENSION,
            content: componentContent
        })

        // Write unit tests
        const unitTestContent = handleHandleBarCompileReturnContent(
            unitTestTemplateString,
            {
                name: component.name
            }
        )
        writeFile({
            directory: FileConstants.UNIT_TEST_PATH,
            fileName: `${component.name}.test`,
            fileExtension: FileConstants.EXTENSION,
            content: unitTestContent
        })
    })
})

// Menu
const menuTemplate = [
    {
        label: 'File',
        click() {
            console.log('yoo file opened')
        }
    }
]

const applicationMenu = Menu.buildFromTemplate(menuTemplate)
