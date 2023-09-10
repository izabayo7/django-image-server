# image-server


## Runing the app

```bash
# (1) clone the project
$ git clone https://github.com/izabayo7/django-image-server.git

# (2) build the images and run the containers
$ sudo docker-compose build

# (3) run the image

$ sudo docker-compose up -d

# (4) run the migrations
$ sudo docker exec -it annotate_backend_1 python manage.py migrate
```
