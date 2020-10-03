export const TabStates = {
    PSEUDO: 'PSEUDO',
    PRETTIER: 'PRETTIER',
    TEMPLATES: 'TEMPLATES'
}

export const TemplateNames = {
    BASE_COMPONENT: 'baseComponentTemplate',
    COMPONENT: 'componentTemplate',
    UNIT_TEST: 'unitTestTemplate'
}

export const TemplateOptions = [
    { label: 'Base Component', value: TemplateNames.BASE_COMPONENT },
    { label: 'Component', value: TemplateNames.COMPONENT },
    { label: 'Unit Test', value: TemplateNames.UNIT_TEST }
]

export const baseComponentTemplate = `import React from 'react'

{{#each imports}}
import {{childName}} from './{{#if componentDirName}}{{componentDirName}}/{{/if}}{{childName}}'
{{/each}}

const {{name}}{{#if (isTypescript extension)}}: React.FC{{/if}} = () => {
    return ({{render}})
}

export default {{name}}
`

export const componentTemplate = `import React {{#if (isTypescript extension)}}, { ReactNode } {{/if}}from 'react'

{{#if (isTypescript extension)}}
interface {{name}}Props {
    children: ReactNode;
    {{#each props}}
    {{this}}: any;
    {{/each}}
}
{{/if}}

const {{name}}
{{#if (isTypescript extension)}}: React.FC<{{name}}Props>{{/if}}
= ({ children,
{{#if props}}{{#each props}}{{this}},{{/each}}{{/if}}
}) => {
    return (
        <div>{children}</div>
    )
}

export default {{name}}
`

export const unitTestTemplate = `import React from 'react'
import { render } from '@testing-library/react'
import {{name}} from '../{{name}}'

describe('{{name}}', () => {
    it('should match default snapshot', () => {
        const { container } = render(<{{name}} />)
        expect(container).toMatchSnapshot()
    })
})
`

export const prettierConfig = `{
    "arrowParens": "avoid",
    "semi": false,
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "none",
    "useTabs": false
}`