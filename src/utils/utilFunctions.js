const fs = require('fs')
const espree = require('espree')
const rimraf = require('rimraf')
const Handlebars = require('handlebars')
// const prettier = require('prettier')

Handlebars.registerHelper('isTypescript', value => value === 'tsx')

exports.getConstants = ({
    baseComponentName,
    buildPath,
    baseComponentTemplatePath,
    componentTemplatePath,
    unitTestTemplatePath,
    subfolderName,
    fileExtension
}) => {
    return {
        // Paths
        BUILD_PATH: buildPath,
        COMPONENT_PATH: `${buildPath}/${subfolderName}`,
        UNIT_TEST_PATH: `${buildPath}/${subfolderName}/__test__`,
        // Templates
        BASE_COMPONENT_TEMPLATE_PATH: baseComponentTemplatePath,
        COMPONENT_TEMPLATE_PATH: componentTemplatePath,
        UNIT_TEST_TEMPLATE_PATH: unitTestTemplatePath,
        // Aux
        BASE_COMPONENT_NAME: baseComponentName,
        EXTENSION: fileExtension || 'tsx',
        JSX_ELEMENT: 'JSXElement',
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

exports.getASTData = data =>
    espree.parse(data, {
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true
        }
    })

exports.cleanUp = path => rimraf.sync(path, {}, err => console.log(err))

const dirExists = path => fs.existsSync(path)

// exports.formatCode = code => {
//     return prettier.format(code, {
//         singleQuote: true,
//         parser: 'typescript',
//         tabWidth: 4,
//         trailingComma: 'none',
//         semi: false
//     })
// }

exports.readFile = filePath => fs.readFileSync(filePath, 'utf-8')

exports.writeFile = ({ directory, fileName, fileExtension, content }) => {
    if (!fileName || !content) return

    if (!dirExists(directory)) {
        fs.mkdirSync(directory, { recursive: true })
    }

    fs.writeFileSync(`${directory}/${fileName}.${fileExtension}`, content)
}

exports.handleHandleBarCompileReturnContent = (template, data, errorCallback) => {
    try {
        const compiled = Handlebars.compile(template, { strict: true })
        return compiled(data)
    } catch(error) {
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
