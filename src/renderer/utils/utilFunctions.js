import {
    baseComponentTemplate,
    componentTemplate,
    prettierConfig,
    TabStates,
    TemplateNames,
    unitTestTemplate
} from '../constants'

export const getInitialState = () => ({
    baseComponentName: 'App',
    baseComponentTemplate,
    buildPath: '',
    componentTemplate,
    currentTab: TabStates.PSEUDO,
    currentTemplateName: TemplateNames.BASE_COMPONENT,
    fileExtension: 'tsx',
    hasSubfolder: true,
    hasUnitTests: true,
    prettierConfig,
    pseudo: '<Layout>\n    <Header />\n    <Main />\n    <Footer />\n</Layout>',
    subfolderName: 'components',
    unitTestTemplate,
})
