#!/bin/bash -x

# Go to project directory
pushd $(dirname $0)/..

# The directory name is used for the virtualenv prompt.
BASEPATH=$(basename $PWD)

# Settings
VIRTUALENV_VERSION=1.11.6
VIRTUALENV_OPTS="--no-site-packages --prompt=($BASEPATH)"
NODE_VERSION=0.10.32
ENVDIR=env
REQUIREMENTS_FILE=tests/dummy/backend/requirements.txt

# Commands
PIP="$ENVDIR/bin/pip --timeout 30"
MANAGE_PY="$ENVDIR/bin/python ./manage.py"

# Setup a virtualenv with bootstrapping to avoid the system installed virtualenv.
# http://stackoverflow.com/questions/4324558/whats-the-proper-way-to-install-pip-virtualenv-and-distribute-for-python
if [ ! -d $ENVDIR ]; then
  echo "Preparing virtualenv environment in $ENVDIR directory"

  VIRTUALENV_FILE=virtualenv-$VIRTUALENV_VERSION.tar.gz
  curl -O https://pypi.python.org/packages/source/v/virtualenv/virtualenv-$VIRTUALENV_VERSION.tar.gz

  tar xzf $VIRTUALENV_FILE
  python virtualenv-$VIRTUALENV_VERSION/virtualenv.py $VIRTUALENV_OPTS $ENVDIR
  rm -rf virtualenv-$VIRTUALENV_VERSION
  $PIP install -q $VIRTUALENV_FILE
  rm -f $VIRTUALENV_FILE
fi

if [ ! -L $ENVDIR/bin/node ]; then
  echo "Installing node.js into virtualenv"

  NODE_FILE=node-v$NODE_VERSION-linux-x64.tar.gz
  curl -O http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz

  # Unpack node and install symlinks.
  pushd $ENVDIR
    tar xzf ../$NODE_FILE
  popd
  rm -f $NODE_FILE

  ln -s $(realpath $ENVDIR/node-v$NODE_VERSION-linux-x64/bin/node) $ENVDIR/bin/node
  ln -s $(realpath $ENVDIR/node-v$NODE_VERSION-linux-x64/bin/npm) $ENVDIR/bin/npm

  # Install npm modules.
  echo "Installing npm and bower requirements ..."
  $ENVDIR/bin/npm install -g --production bower@">=1.3.12 <1.4.0"
  $ENVDIR/bin/npm install
  EMBER_CLI_VERSION=$(grep \"ember-cli\": package.json | sed -e "s/.*:.*\"\(.*\..*\..*\)\",/\1/")
  $ENVDIR/bin/npm install -g --production ember-cli@$EMBER_CLI_VERSION
  $ENVDIR/bin/npm install -g --production phantomjs@">=1.9.7-1 <2.0.0"
  source $ENVDIR/bin/activate
    $ENVDIR/bin/bower install
  deactivate
fi

echo "Installing Python requirements ..."

$PIP install -q -U pip setuptools virtualenv
$PIP install -q -U -r $REQUIREMENTS_FILE
if [ $? -eq 0 ]; then
  echo "Python requirements installed correctly."
else
  echo "Error installing Python requirements."
  exit 1
fi

# Return to original directory.
popd
