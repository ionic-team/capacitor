#!/usr/bin/env bash
set -e
rm -rf www
npm run build
cd ../core
npm run docs
cd ../site
firebase deploy
