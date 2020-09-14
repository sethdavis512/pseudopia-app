# Pseudopia App

> Write pseudo React, get components.

![Pseudopia App Screenshot](pseudopia.png)

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

```
npm i && npm start
```

## Customization

Pseudopia allows you to use your own Handlebar templates. (Docs coming soon)

## Contributing

Seeking code reviews, feedback, and open to contributions
