import tailwindConfig from './tailwind.config.js';

export default {
  plugins: {
    autoprefixer: {},
    'postcss-preset-env': {},
    /*'postcss-parent-selector': {selector: '#aiinhbfoop'},*/
    /*"postcss-wrap-selector": WrapSelector({
            "selector": "#aiinhbfoop",
            "skipRootSelector": [":root", ":is"]
        }),*/
    /*"postcss-wrap-selector": {
            "selector": ".aiinhbfoop",
            "skipRootSelector": [":root", ":is", "#aiinhbfoop-popup", "#aiinhbfoop-sidepanel", "#aiinhbfoop-options", "html", "#aiinhbfoop",".v-toast"]
        },*/
    tailwindcss: tailwindConfig,
    'postcss-replace': {
      pattern: /(--tw|\*, ::before, ::after)/g,
      data: {
        '--tw': `--${tailwindConfig.prefix.replace('-', '')}`, // Prefixing
        '*, ::before, ::after': ':root' // So variables does not pollute every element
      }
    }
  }
};

export function WrapSelector(opts) {
  opts = opts || {};
  // Work with options here
  return function (root /* , result*/) {
    root.walkRules(rule => {
      if (
        rule.parent &&
        rule.parent.type === 'atrule' &&
        rule.parent.name.indexOf('keyframes') !== -1
      ) {
        return;
      }
      rule.selectors = rule.selectors.map(selectors => {
        return selectors.split(/,[\s]* /g).map(selector => {
          // don't add the parent class to a rule that is
          // exactly equal to the one defined by the user
          if (selector === opts.selector) {
            return selector;
          }

          // selector not added when rule starts with specified selector
          if (opts.skipRootSelector) {
            if (
              typeof opts.skipRootSelector === 'string' &&
              selector.indexOf(opts.skipRootSelector) === 0
            ) {
              return selector;
            }
            if (
              Array.isArray(opts.skipRootSelector) &&
              opts.skipRootSelector.some(item => selector.indexOf(item) === 0)
            ) {
              return selector;
            }
          }

          var newsSelector = `${opts.selector} ${selector}`;
          return newsSelector;
        });
      });
    });
  };
}
