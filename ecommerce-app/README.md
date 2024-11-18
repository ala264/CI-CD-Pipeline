After running the code change, if there is an error on GitHub action section use following steps otherwise add, commit and push normally. 

Steps if there is an error commit on GitHub: 
#update local directory 
git fetch origin 

#stash current changes 
git stash 

#go to last working version locally 
git reset --hard origin/main 

#get back your changes and fix the error 
git stash pop 

#now add, commit and push normally 
git add . 

git commit -m "..."

git push