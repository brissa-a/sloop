echo
# echo "fetching tags from remote"
# git fetch --tags

#set first arg to "prod-*" as default
COMPARETO=${1:-prod-*}


LATEST_PROD_TAG=$(git tag -l $COMPARETO | sort -V | tail -n 1)
echo "comparing with :   $LATEST_PROD_TAG"

echo
echo "Is there a new prisma migration? (No if empty)"
git --no-pager log $LATEST_PROD_TAG..HEAD --first-parent --oneline -- package/sloop-pg/schema.prisma

echo
echo "sloop-vite:"
git --no-pager log $LATEST_PROD_TAG..HEAD --first-parent --oneline -- package/sloop-vite/

echo 
echo "sloop-express:"
git --no-pager log $LATEST_PROD_TAG..HEAD --first-parent --oneline -- package/sloop-express/

echo 
echo "sloop-common:"
git --no-pager log $LATEST_PROD_TAG..HEAD --first-parent --oneline -- package/sloop-common/

echo 

