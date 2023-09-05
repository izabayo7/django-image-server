from django.urls import path
from . import views

app_name = 'image_app'

urlpatterns = [
    # Endpoint to get all image IDs
    path('', views.get_all, name='get-all-image-ids'),

    # Endpoint to serve an individual image by ID
    path('<uuid:image_id>/', views.serve_image, name='serve-image'),

    # Endpoint to upload a new image or edit an existing one
    path('upload/', views.upload_image, name='upload-image'),
]
