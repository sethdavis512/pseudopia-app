import {
    TabStates,
    TemplateNames,
    baseComponentTemplate,
    componentTemplate,
    unitTestTemplate,
    prettierConfig
} from '../constants'

export const getInitialState = () => ({
    baseComponentTemplate,
    componentTemplate,
    unitTestTemplate,
    baseComponentName: 'App',
    buildPath: '',
    currentTab: TabStates.PSEUDO,
    currentTemplateName: TemplateNames.BASE_COMPONENT,
    fileExtension: 'tsx',
    hasSubfolder: true,
    hasUnitTests: true,
    prettierConfig,
    pseudo: '<Layout>\n    <Header />\n    <Main />\n    <Footer />\n</Layout>',
    subfolderName: 'components'
})
