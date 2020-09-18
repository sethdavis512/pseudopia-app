# Pseudopia App

![Pseudopia App Screenshot](pseudopia.png)

> Write pseudo React, get components.

## Features

⚡️ Fast - Quickly build out components for your app ideas 

👍🏻 Easy - Templates are built-in, just write pseudo React - get components

🦑 Flexible - Write starter components or deeply nested ones 

🧩 Customizable - Bring your own Handlebar templates for Pseudopia to use

🎛 Do you like Prettier? You can customize that too!

📺 [Watch a quick video](https://res.cloudinary.com/setholito/video/upload/v1600137138/pseudopia/pseudopia-intro-short.mp4)

## Example

Pseudo code:

```
<Layout>
    <Header />
    <Wrapper>
        <MainContent />
    </Wrapper>
    <Footer />
</Layout>
```

Generates:

```
./your-directory/
├── App.tsx
└── components
    ├── Footer.tsx
    ├── Header.tsx
    ├── Layout.tsx
    ├── MainContent.tsx
    ├── Wrapper.tsx
    └── __tests__
        ├── Footer.test.tsx
        ├── Header.test.tsx
        ├── Layout.test.tsx
        ├── MainContent.test.tsx
        └── Wrapper.test.tsx
```

## Getting Started

To develop:
```
yarn && yarn dev
```

To build app:
```
yarn dist
```

## Prettier Config

Pseudopia can be customized to use your own `prettier` config.

Default:
```
{
    "arrowParens": "avoid"
    "semi": false,
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "none",
    "useTabs": false
}
```

For further info on Prettier configs, [see here](https://prettier.io/docs/en/configuration.html).

## Handlebar Templates

Pseudopia allows you to use your own Handlebar templates.
Currently, templates require at least one piece/key of data to be handed off to Handlebars.

See tables below.

### Variables for Base Component Handlebar template ([Example](src/hbs-templates/base-component.hbs))

| Key       | Type                                                | Description                                           |
| --------- | --------------------------------------------------- | ----------------------------------------------------- |
| extension | `string`                                            | File extension type - `js`, `tsx`                     |
| imports   | `{ childName: string, componentDirName: string }[]` | Must have a key of `childName` and `componentDirName` |
| name      | `string`                                            | Name of base component                                |
| render    | `string`                                            | Content from the Pseudopia code editor                |

### Variables for Component Handlebar template ([Example](src/hbs-templates/component.hbs))

| Key       | Type       | Description                       |
| --------- | ---------- | --------------------------------- |
| extension | `string`   | File extension type - `js`, `tsx` |
| name      | `string`   | Name of component                 |
| props     | `string[]` | Component props                   |

### Variables for Unit Test Handlebar template ([Example](src/hbs-templates/unit-test.hbs))

| Key  | Type     | Description       |
| ---- | -------- | ----------------- |
| name | `string` | Name of component |

## Roadmap

I really want to make this app stand out.  
Here are a few things that I plan on working on:

- ~~Toggleable subfolder~~
- ~~Toggleable unit tests~~
- ~~Custom Prettier config~~
- Downloadable app
- Clear previous files before build

## Contributing

Seeking code reviews, feedback, and open to contributions
