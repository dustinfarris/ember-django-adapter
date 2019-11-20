'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-lts-2.12',
          npm: {
            dependencies: {
              'ember-data': '^2.12.0'
            },
            devDependencies: {
              'ember-source': '^2.12.0'
            }
          }
        },
        {
          name: 'ember-lts-2.16',
          npm: {
            dependencies: {
              'ember-data': '^2.16.0'
            },
            devDependencies: {
              'ember-source': '^2.16.0'
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-data': 'latest',
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            devDependencies: {
              'ember-data': 'beta',
              'ember-source': urls[1]
            }
          },
          allowedToFail: true
        },
        {
          name: 'ember-canary',
          npm: {
            devDependencies: {
              'ember-data': 'canary',
              'ember-source': urls[2]
            }
          },
          allowedToFail: true
        }
      ]
    }
  });
};
