from django.urls import path, re_path

from . import views

app_name = 'image_app'

urlpatterns = [
    re_path(r'^(?P<image_id>[0-9a-f-]+)/$', views.serve_image, name='serve_image'),
    re_path(r'^(?P<image_id>[0-9a-f-]+)/update/$', views.update_image, name='update_image'),
    path('all/', views.get_all_image_ids, name='get_all_image_ids'),
    path('upload/', views.upload_image, name='upload_image'),
]
