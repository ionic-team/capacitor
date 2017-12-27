MONOREPO_DIR=$(pwd)
LAST_COMMIT_MESSAGE=`git log -1 --pretty=format:"%s" -- .`

echo $MONOREPO_DIR
echo "Deploying avocado-site to gh-pages branch"
echo "Last commit in site/ was: $LAST_COMMIT_MESSAGE"
npm run build

echo "Making temporary directory..."
WORK_DIR=`mktemp -d`
echo "Made $WORK_DIR"

if [[ ! "$WORK_DIR" || ! -d "$WORK_DIR" ]]; then
  echo "Could not create temp dir"
  exit 1
fi

cd $WORK_DIR
git init
git remote add origin git@github.com:ionic-team/avocado
git fetch origin -- gh-pages
git checkout gh-pages
cp -R $MONOREPO_DIR/www/* .
git add .
git commit -m "$LAST_COMMIT_MESSAGE"
git push origin gh-pages

function cleanup {
  rm -rf "$WORK_DIR"
  echo "Deleted temp deploy directory"
}

trap cleanup EXIT
