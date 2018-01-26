USAGE="Usage: starter.sh path/to/capacitor-starter/repo"
LAST_COMMIT_MESSAGE=`git log -1 --pretty=format:"%s" -- starter/`

echo $LAST_COMMIT_MESSAGE

if [ "$#" -ne "1" ]; then
	echo "$USAGE"
	exit 1
fi
STARTER_REPO=$1
echo $STARTER_REPO

cp -R starter/* $STARTER_REPO
cd $STARTER_REPO
git add .
git commit -m "$LAST_COMMIT_MESSAGE"
git push -f origin master
