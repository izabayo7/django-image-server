import time

from django.shortcuts import render, get_object_or_404

import os
from django.shortcuts import render
from django.http import JsonResponse

from .models import Image
import uuid  # Import the 'uuid' module


def get_all_image_ids(request):
    images = Image.objects.all()
    image_ids = [str(image.id) for image in images]  # Convert UUIDs to strings
    return JsonResponse({'image_ids': image_ids})

def serve_image(request, image_id):
    image = get_object_or_404(Image, id=image_id)
    # Pass context data to the template
    context = {
        'title': image.name,  # Use the image name as the title
        'heading': 'Image Details',
        'image_url': image.path.url,  # Use the image URL from the 'path' field
    }
    print(context)
    return render(request, 'serve_image.html', context)


def update_image(request, image_id):
    image = get_object_or_404(Image, id=image_id)

    if request.method == 'POST':
        # Handle image updates here, using 'image_id' as the UUID identifier
        # You can use request.FILES['image'] to get the new image file
        # Don't forget to save the updated image and update other attributes as needed.

        # Example: Updating the title
        new_title = request.POST.get('title', image.title)
        image.title = new_title
        image.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'})


def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        uploaded_image = request.FILES['image']

        # Generate a unique name by appending a timestamp (converted to a number)
        timestamp = int(time.time())
        image_name = f'image_{timestamp}_{uploaded_image.name}'

        # Save the image with the unique name
        image = Image(name=image_name, path=uploaded_image)
        image.save()

        return JsonResponse({'success': True, 'image_id': image.id})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method or missing image'})
