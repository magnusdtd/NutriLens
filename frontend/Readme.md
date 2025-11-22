<h1>Docker</h1>

# Install docker
Go to this [link](https://www.docker.com/), download Docker and install it.

# Build
```sh
cd frontend 
docker build . -t magnusdtd/naver-hackathon-frontend:latest
```

# Run
## Method 1: Use docker run
```sh
cd frontend 
docker run -p 8070:8070 magnusdtd/naver-hackathon-frontend:latest
```
## Method 2: Use docker compose
```sh
docker compose up --build
```
Use **ctrl + C** to stop docker compose or docker run

# Access to the frontend
Open brower and enter the **http://localhost:8070** to see the frontend.