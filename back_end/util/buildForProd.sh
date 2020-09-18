#!/usr/bin/env bash


### Build Back End ###

# Remove existing production folder
rm -rf ./build/

# Transpile .ts to .js
tsc --sourceMap false


### Bundle Front End ###

# Create the directory for Three
mkdir -p ./build/public/app/

# Navigate to the Three directory
cd ../front_end/

# Build Three code
npm run compile

# Rename the folder
mv lib remembrance_card_app

# Move the contents to the build/ dir
mv remembrance_card_app ../back_end/build/public/remembrance_card_app/