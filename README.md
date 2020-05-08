# coh2-tools

This is a set of scripts for downloading game data for Company of Heroes 2. There are 3 types of data that this tool enables you to get
- **Attributes** (contains all game data in the form of XML files)
  - Downloaded from the [Company of Heroes 2 Tools Content](https://steamdb.info/depot/313221/) depot
- **English Localization**
  - Downloaded from the [Company of Heroes 2 English Content](https://steamdb.info/depot/231432/) depot
- **Veterancy Descriptions**
  - Scraped from the [CoH2.org Veterancy Guide](https://www.coh2.org/guides/29892/the-company-of-heroes-2-veterancy-guide) page

## Requirements
- Node.js v13.0+
- .NET Core v2.1+


## Usage
### Compile
```
npm install
npm run build
```

### Download Attributes
```
npm run download:attributes
```

You will be prompted to login with a Steam account. The account must have [Company of Heroes 2 Tools](https://steamdb.info/app/313220/) in their Steam library.

---

### Download English Localization
```
npm run download:localization
```

You will be prompted to login with a Steam account. The account must have [Company of Heroes 2](https://steamdb.info/app/231430/) in their Steam library.

---

### Download Veterancy Descriptions
```
npm run download:veterancy
```