eval "$(ssh-agent -s)"
ssh-add ~/.ssh/docker_repo_key 
git pull git@github.com:LuEklund/LucasBot.git 
docker compose up -d