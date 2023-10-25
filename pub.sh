#!/usr/bin/env bash

echo "Publishing..."
npm run build

mv README.md github.README.md
mv npm.README.md README.md
npm publish
mv github.README.md README.md