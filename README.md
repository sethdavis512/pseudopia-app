# Pseudopia App

![Pseudopia App Screenshot](pseudopia.png)

> Write pseudo React, get components.

## Features

👍🏻 Built-in Templates: Get up and running fast, just write pseudo React - get components

🦑 Flexible: Write top level components or fine-grain ones.

🧩 Customizable: Edit Handlebar templates within Pseudopia

🎛 Prettier Config: Format your code, just the way you like

📺 [Watch a quick video](https://res.cloudinary.com/setholito/video/upload/v1600830474/pseudopia/pseudopia-video-v2.mp4)

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

Pseudopia allows you to customize the built-in Handlebar templates.
Navigate to the `Templates` tab, choose your template from the select field and customize!

### Variables for Base Component template

| Key       | Type                                                | Description                                           |
| --------- | --------------------------------------------------- | ----------------------------------------------------- |
| extension | `string`                                            | File extension type - `js`, `tsx`                     |
| imports   | `{ childName: string, componentDirName: string }[]` | Must have a key of `childName` and `componentDirName` |
| name      | `string`                                            | Name of base component                                |
| render    | `string`                                            | Content from the Pseudopia code editor                |

### Variables for Component template

| Key       | Type       | Description                       |
| --------- | ---------- | --------------------------------- |
| extension | `string`   | File extension type - `js`, `tsx` |
| name      | `string`   | Name of component                 |
| props     | `string[]` | Component props                   |

### Variables for Unit Test template

| Key  | Type     | Description       |
| ---- | -------- | ----------------- |
| name | `string` | Name of component |

## Roadmap

I really want to make this app stand out.  
Here are a few things that I plan on working on:

-   ~~Toggleable subfolder~~
-   ~~Toggleable unit tests~~
-   ~~Custom Prettier config~~
-   Downloadable app
-   Clear previous files before build

## Contributing

Seeking code reviews, feedback, and open to contributions
