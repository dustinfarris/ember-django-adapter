/* eslint-env node */
module.exports = {
  useYarn: true,
  scenarios: [
    {
      name: 'ember-lts-2.12',
      npm: {
        dependencies: {
          'ember-data': '^2.12.0'
        }
      }
    },
    {
      name: 'ember-lts-2.16',
      npm: {
        dependencies: {
          'ember-data': '^2.16.0'
        }
      }
    },
    {
      name: 'ember-release',
      npm: {
        dependencies: {
          'ember-data': 'emberjs/data#release'
        }
      }
    },
    {
      name: 'ember-beta',
      npm: {
        dependencies: {
          'ember-data': 'emberjs/data#beta'
        }
      }
    },
    {
      name: 'ember-canary',
      npm: {
        dependencies: {
          'ember-data': 'emberjs/data#master'
        }
      }
    }
  ]
};
