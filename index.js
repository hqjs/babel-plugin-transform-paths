const path = require('path');

// TODO: check if we need to use global flags and accept spaces /^(\.{1,2})\/([^'"]*)/ migt be more relevant
const RELATIVE_PATTERN = /^\s*(\.{1,2})\/([^'"]*)/g;
const VENDOR_PATTERN = /^\s*(\/node_modules)\/([^'"`]*)/g;
const ABSOLUTE_PATTERN = /^(\s*)\/([^'"`]*)/g;
const VUE_PATTER = /^\s*(@)\/([^'"`]*)/g;

const replace = (baseURI, dirname = '', dotsReplacement = undefined) =>
  (match, dots, rest) => `${baseURI}${path.posix.join(dirname, dotsReplacement === undefined ? dots : dotsReplacement, rest)}`;

module.exports = function ({ types: t }) {
  return {
    visitor: {
      StringLiteral(nodePath, stats) {
        const { basePath = '', baseURI, dirname, removeNodeModules, transformAbsolute } = stats.opts;
        const { value: modName } = nodePath.node;
        if (modName.trim().startsWith('http')) return;
        const uri = `${baseURI}${basePath}`;
        let updatedPath = modName
          .replace(VENDOR_PATTERN, replace(baseURI, '', removeNodeModules ? '/' : undefined))
          .replace(VUE_PATTER, replace(uri, '', '/'))
          .replace(RELATIVE_PATTERN, replace(uri, dirname));

        if (transformAbsolute) updatedPath = updatedPath.replace(ABSOLUTE_PATTERN, replace(uri, '', '/'));

        nodePath.node.value = updatedPath;
      },
      TemplateLiteral(nodePath, stats) {
        const { basePath = '', baseURI, dirname, removeNodeModules, transformAbsolute } = stats.opts;
        const uri = `${baseURI}${basePath}`;
        const value = nodePath.node.quasis[0].value.raw;
        let raw = value
            .replace(VENDOR_PATTERN, replace(baseURI, '', removeNodeModules ? '/' : undefined))
            .replace(VUE_PATTER, replace(uri, '', '/'))
            .replace(RELATIVE_PATTERN, replace(uri, dirname));
        if (transformAbsolute) raw = raw.replace(ABSOLUTE_PATTERN, replace(uri, '', '/'));
        nodePath.node.quasis[0] = t.templateElement({raw});
      },
    },
  };
};
