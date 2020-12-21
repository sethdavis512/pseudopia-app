const fs = require('fs')
const espree = require('espree')
const Handlebars = require('handlebars')
const prettier = require('prettier')

exports.getConstants = ({
    baseComponentName,
    buildPath,
    fileExtension,
    subfolderName
}) => {
    return {
        // Paths
        BUILD_PATH: buildPath,
        COMPONENT_PATH: hasSubfolder =>
            hasSubfolder ? `${buildPath}/${subfolderName}` : `${buildPath}`,
        UNIT_TEST_PATH: hasSubfolder =>
            hasSubfolder
                ? `${buildPath}/${subfolderName}/__test__`
                : `${buildPath}/__test__`,
        // Aux
        BASE_COMPONENT_NAME: baseComponentName,
        EXTENSION: fileExtension,
        SUBFOLDER_NAME: subfolderName
    }
}

const exclusionList = [
    'button',
    'div',
    'footer',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'input',
    'p',
    'section',
    'span'
]

const isExcluded = ({ openingElement }) =>
    exclusionList.indexOf(openingElement.name.name) > -1

exports.getASTData = (data, errorCallback) => {
    try {
        return espree.parse(data, {
            ecmaVersion: 6,
            ecmaFeatures: {
                jsx: true
            }
        })
    } catch (error) {
        errorCallback(error)
    }
}

const dirExists = path => fs.existsSync(path)

const toJson = str => {
    try {
        return JSON.parse(str)
    } catch (error) {
        return undefined
    }
}

exports.formatCode = (code, userConfigString, errorCallback) => {
    const userConfig = toJson(userConfigString)

    if (userConfig && userConfig.parser === undefined) {
        userConfig.parser = 'typescript'
    }

    const config = userConfig || {
        singleQuote: true,
        parser: 'typescript',
        tabWidth: 4,
        trailingComma: 'none',
        semi: false
    }

    try {
        return prettier.format(code, config)
    } catch (e) {
        errorCallback(e)
    }
}

exports.writeFile = ({ directory, fileName, fileExtension, content }) => {
    if (!fileName || !content) return

    if (!dirExists(directory)) {
        fs.mkdirSync(directory, { recursive: true })
    }

    fs.writeFileSync(`${directory}/${fileName}.${fileExtension}`, content)
}

exports.compileContent = (template, data, errorCallback) => {
    try {
        const compiled = Handlebars.compile(template, { strict: true })
        return compiled(data)
    } catch (error) {
        errorCallback(error)
    }
}

exports.handleAST = body => {
    const output = []
    const getChildren = component => {
        if (component.type === 'JSXElement' && !isExcluded(component)) {
            const {
                name: componentName,
                attributes: propsArr
            } = component.openingElement

            output.push({
                name: componentName.name,
                props: propsArr.map(p => p.name.name)
            })

            component.children
                .filter(({ type }) => type === 'JSXElement')
                .forEach(getChildren)
        }
    }

    body.forEach(top => getChildren(top.expression))

    return output
}
