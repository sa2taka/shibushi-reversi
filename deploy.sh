#!/usr/bin/env sh

set -e

npm run build

cd dist

echo > .nojekyll


git checkout -B main
git add -A
git commit -m 'deploy'

git push -f git@github.com:sa2taka/shibushi-reversi.git main:gh-pages

cd -
