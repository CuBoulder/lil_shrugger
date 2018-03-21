// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  // add your custom rules here
  'rules': {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-useless-concat': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': 0,
    // Remove error for data coming from Atlas.
    'no-underscore-dangle': 0,
    'array-callback-return': 0,
    'no-param-reassign': 0,
    'prefer-template': 0,
    'no-nested-ternary': 0,
    'no-mixed-operators': 0,
    'no-shadow': 0,
    'quotes': ['error', 'single'],
    'max-len': ['error', { 'code': 150 }],
    'prefer-arrow-callback': [ "error", { "allowNamedFunctions": true } ],
  }
};
