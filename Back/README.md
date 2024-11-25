사용 환경 : Ubuntu 20.04
base_install_capstone.sh 에 chmod +x 로 권한 부여 후 실행 시 docker 에 mongodb, nodejs 이미지 설치됩니다.


이후 리눅스에서
docker run -v ./project:/project node -it -d -p 10111:10111 --name=컨테이너이름 node

이 경우 /project의 내용이 nodejs 컨테이너의 project폴더와 마운트 됩니다


sudo docker run --name mongodb -v ~/data:/data/db -d -p 27017:27017 mongo

이 때 -v ~/data:/data/db는 호스트(컨테이너를 구동하는 로컬 컴퓨터)의 ~/data 디렉터리와 컨테이너의 /data/db 디렉터리를 마운트 됩니다. (이 부분은 빠져도 됨)



nodejs와 mongodb 컨테이너가 통신이 안될 경우 같은 docker network 에 넣으면 됩니다. 명령어는 다음과 같습니다.
docker network create my-network
docker network connect my-network <mongodb_container_name_or_id>
docker network connect my-network <app_container_name_or_id>

이후 nodejs 컨테이너의 project 폴더에 들어가 npm install 후 node server.js 를 입력하면 server 가 실행됩니다.

docker exec -it <nodejs_container_name> /bin/sh
를 통해 컨테이너에 들어갈 수 있습니다.
