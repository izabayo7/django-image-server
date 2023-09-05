from django.db import models

import uuid
from django.db import models


class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, editable=False)
    path = models.ImageField(upload_to='images/')

    def __str__(self):
        return self.name
