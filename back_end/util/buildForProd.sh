#!/usr/bin/env bash


### Build Back End ###

# Remove existing production folder
rm -rf ./build/

# Transpile .ts to .js
tsc --sourceMap false

### Bundle Front End ###

# Create the directories for the app
mkdir -p ./build/src/public/app/

# Navigate to the front end
cd ../front_end/

# Build the app with webpack
webpack

# Rename the folder
mv dist app

# Move the contents to the build directory
mv app ../back_end/build/src/public/

# Move static assets across
mkdir -p ../back_end/build/src/public/app/src/
cp -r src/models ../back_end/build/src/public/app/src/
cp -r src/sounds ../back_end/build/src/public/app/src/