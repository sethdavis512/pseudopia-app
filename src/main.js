const path = require('path')
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
    writeFile,
    readFile
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
        resizable: false,
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

    mainWindow.on('blur', () => {
        if (!mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.hide()
        }
    })

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
        tray = null
    })
}

// Tray
let tray = null

const createTray = () => {
    tray = new Tray(path.resolve('src/images/pseudopia-icon.png'))
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

const toggleWindow = () => {
    if (mainWindow.isVisible()) {
        mainWindow.hide()
    } else {
        showWindow()
    }
}

const showWindow = () => {
    const position = getWindowPosition()
    mainWindow.setPosition(position.x, position.y, false)
    mainWindow.show()
    mainWindow.focus()
}

const getWindowPosition = () => {
    const windowBounds = mainWindow.getBounds()
    const trayBounds = tray.getBounds()

    // Center window horizontally below the tray icon
    const x = Math.round(
        trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
    )

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)

    return { x: x, y: y }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow()
    createTray()
})

// Don't show in dock
app.dock.hide()

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on('show-window', () => {
    showWindow()
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

const getHBSTemplatePath = (fileName) => path.resolve(`src/hbs-templates/${fileName}.hbs`)

ipcMain.on('write-files', (event, config) => {
    const AST = getASTData(config.pseudo)
    const FileConstants = getConstants(config)

    const components = handleAST(AST.body)

    // Write base component ie App
    const appTemplateTarget = FileConstants.APP_TEMPLATE_PATH || getHBSTemplatePath('app');
    const appTemplateString = readFile(appTemplateTarget)
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
    const componentTemplateTarget = FileConstants.COMPONENT_TEMPLATE_PATH || getHBSTemplatePath('component');
    const componentTemplateString = readFile(componentTemplateTarget)

    const unitTestTemplateTarget = FileConstants.UNIT_TEST_TEMPLATE_PATH || getHBSTemplatePath('unit-test');
    const unitTestTemplateString = readFile(unitTestTemplateTarget)

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

const isMac = process.platform === 'darwin'

const template = [
    {
        label: 'File',
        submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
    }
]

const applicationMenu = Menu.buildFromTemplate(template)
