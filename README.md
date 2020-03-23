# https://hqjs.org
Transform global and local paths to full path with server URL

# Installation
```sh
npm install hqjs@babel-plugin-transform-paths
```

# Usage
```json
{
  "plugins": [["hqjs@babel-plugin-transform-paths", {
    "basePath": "",
    "baseURI": "http://localhost:8080",
    "dirname": "/path/to/module",
    "removeNodeModules": false,
    "transformAbsolute": false
  }]]
}
```
where
* **basePath** - basic path to a module, `''` by default
* **baseURI** - server baseURI
* **dirname** - path to module relative to `basePath`, meant to resolve relative imports
* **removeNodeModules** - should `/node_modules` part of the path be removed
* **transformAbsolute** - should absolute path be transformed

URL will be constructed this way:
* `./rest` -> `${baseURI}${basePath}${dirname}${rest}`
* `@/rest` -> `${baseURI}${basePath}/${rest}`
* `/rest` -> `${baseURI}${basePath}/${rest}` or `/${rest}` depending on `transformAbsolute` option
* `/node-modules/rest` -> `${baseURI}${basePath}${rest}` or `${baseURI}${basePath}node_modules/${rest}` depending on `removeNodeModules` option

# Transformation
Plugin resolves relative paths `./...`, `../...`, node_modules paths `/node_modules/...` and vue absolute paths `@/...` to full URL.
