docker run -d -p 9000:9000 --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v ${HOME}/app/portainer/data/data --name portainer portainer/portainer:latest
