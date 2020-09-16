const path = require('path')
const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const {
    getASTData,
    getConstants,
    handleAST,
    handleHandleBarCompileReturnContent,
    writeFile,
    readFile
} = require('./utils/utilFunctions')
const Handlebars = require('handlebars')
const isDev = require('electron-is-dev')

const getHBSTemplatePath = fileName => `${__dirname}/src/hbs-templates/${fileName}.hbs`
const getImagePath = fileNameWithExt => `${__dirname}/src/images/${fileNameWithExt}`

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit()
}

// Window
let mainWindow = null

const createWindow = () => {
    mainWindow = mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true
        },
        icon: getImagePath('pseudopia-app-icon-256.ico')
    })

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow()
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
    let hasError = false;

    const AST = getASTData(config.pseudo)
    const FileConstants = getConstants(config)

    const components = handleAST(AST.body)

    // Write base component ie App
    const baseComponentTemplateTarget =
        FileConstants.BASE_COMPONENT_TEMPLATE_PATH || getHBSTemplatePath('base-component')
    const baseComponentTemplateString = readFile(baseComponentTemplateTarget)
    const renderContent = new Handlebars.SafeString(config.pseudo)

    const handleHBSError = (error) => {
        mainWindow.webContents.send('compile-error', error)
        hasError = true
    };
    const appContent = handleHandleBarCompileReturnContent(baseComponentTemplateString, {
        render: renderContent,
        name: FileConstants.BASE_COMPONENT_NAME,
        extension: FileConstants.EXTENSION,
        imports: components.map(comp => ({
            childName: comp.name,
            componentDirName: FileConstants.SUBFOLDER_NAME
        }))
    }, handleHBSError)

    writeFile({
        directory: FileConstants.BUILD_PATH,
        fileName: FileConstants.BASE_COMPONENT_NAME,
        fileExtension: FileConstants.EXTENSION,
        content: appContent
    })

    // Write components
    const componentTemplateTarget =
        FileConstants.COMPONENT_TEMPLATE_PATH || getHBSTemplatePath('component')
    const componentTemplateString = readFile(componentTemplateTarget)

    const unitTestTemplateTarget =
        FileConstants.UNIT_TEST_TEMPLATE_PATH || getHBSTemplatePath('unit-test')
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
            directory: FileConstants.COMPONENT_PATH(config.hasSubfolder),
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
            directory: FileConstants.UNIT_TEST_PATH(config.hasSubfolder),
            fileName: `${component.name}.test`,
            fileExtension: FileConstants.EXTENSION,
            content: unitTestContent
        })
    })

    if (!hasError) {
        mainWindow.webContents.send('compile-success')
    }
})
