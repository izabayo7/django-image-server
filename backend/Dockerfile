# Use the official Python 3.10.12 image as the base image
FROM python:3.10.12-slim

# Set environment variables to avoid buffering issues and enable colorized output
ENV PYTHONUNBUFFERED 1
ENV TERM xterm

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the entire project directory to the container
COPY . /app/

# Expose port 8000 to the outside world (this is the default for Django development server)
EXPOSE 8000

# Start the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
