#!/bin/bash -x

# Go to project directory
pushd $(dirname $0)/..

rm -rf /dev/shm/drftest-db.sqlite3

env/bin/python tests/dummy/backend/manage.py migrate
env/bin/python tests/dummy/backend/manage.py runserver localhost:8000 --noreload &

source env/bin/activate
    env/bin/ember test
deactivate

# Kill the background django process.
kill -9 $!

# Return to original directory.
popd
