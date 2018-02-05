cd ../core
npm run docs
cd ../site
rm -rf www && npm run build && firebase deploy
