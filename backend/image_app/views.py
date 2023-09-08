import os
import time

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Image


@api_view(['GET'])
def get_all(request):
    images = Image.objects.all()
    # sort by uuid desc
    images = sorted(images, key=lambda image: image.name, reverse=True)
    return Response([{'id': image.id, 'name': image.name} for image in images])


@api_view(['GET'])
def serve_image(request, image_id):
    image = get_object_or_404(Image, id=image_id)
    image_file = image.path

    # Serve the image file using FileResponse
    response = FileResponse(open(image_file.path, 'rb'), content_type='image/png')
    response['Content-Disposition'] = f'inline; filename="{image_file.name}"'

    return response


@api_view(['POST'])
def upload_image(request):
    image_to_update_id = request.query_params.get('update', None)
    new_image_file = request.data.get('image', None)

    if new_image_file:
        # Generate a unique name for the image file
        timestamp = int(time.time())
        image_name = f'image_{timestamp}_{new_image_file.name}'

        if image_to_update_id:
            # Update an existing image
            image_to_update = get_object_or_404(Image, id=image_to_update_id)

            # Delete the old image file if needed
            if os.path.exists(image_to_update.path.path):
                os.remove(image_to_update.path.path)

            # Update the image model with the new file path and name
            image_to_update.path = new_image_file
            image_to_update.name = image_name
            image_to_update.save()

            return Response({'success': True, 'id': image_to_update.id, 'name': image_to_update.name})
        else:
            # Create a new image
            image = Image(name=image_name, path=new_image_file)
            image.save()

            return Response({'success': True, 'id': image.id, 'name': image.name})
    else:
        return Response({'success': False, 'error': 'Invalid request: Missing image_file'})

@api_view(['DELETE'])
def delete_image(request, image_id):
    image = get_object_or_404(Image, id=image_id)

    # Delete the image file if needed
    if os.path.exists(image.path.path):
        os.remove(image.path.path)

    # Delete the image model
    image.delete()

    return Response({'success': True})