const path = require('path');

const RELATIVE_PATTERN = /\s*(\.{1,2})\/([^'"]*)/g;
const ABSOLUTE_PATTERN = /\s*(\/node_modules)\/([^'"`]*)/g;
const VUE_PATTER = /\s*(@)\/([^'"`]*)/g;

const replace = (baseURI, dirname = '', dotsReplacement = undefined) =>
  (match, dots, rest) => `${baseURI}${path.join(dirname, dotsReplacement === undefined ? dots : dotsReplacement, rest)}`;

module.exports = function ({ types: t }) {
  return {
    visitor: {
      StringLiteral(nodePath, stats) {
        const { baseURI, dirname } = stats.opts;
        const { value: modName } = nodePath.node;
        if (modName.trim().startsWith('http')) return;
        nodePath.node.value = modName
          .replace(ABSOLUTE_PATTERN, replace(baseURI))
          .replace(VUE_PATTER, replace(baseURI, '', '/'))
          .replace(RELATIVE_PATTERN, replace(baseURI, dirname));
      },
      TemplateLiteral(nodePath, stats) {
        const { baseURI, dirname } = stats.opts;
        const value = nodePath.node.quasis[0].value.raw;
        nodePath.node.quasis[0] = t.templateElement({
          raw: value
            .replace(ABSOLUTE_PATTERN, replace(baseURI))
            .replace(VUE_PATTER, replace(baseURI, '', '/'))
            .replace(RELATIVE_PATTERN, replace(baseURI, dirname)),
        });
      },
    },
  };
};
