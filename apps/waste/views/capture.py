from django.views import View
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
import cv2
import numpy as np
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from roboflow import Roboflow
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image
import logging
import base64

# Configure logging
logger = logging.getLogger(__name__)

# Roboflow configuration
rf = Roboflow(api_key="0r4klCQmalPo9Xw2xkj6")
project = rf.workspace().project("recyclableitems")
model = project.version(2).model

@method_decorator(csrf_exempt, name='dispatch')
class WasteDetectionView(LoginRequiredMixin, View):
    template_name = 'capture.html'
    
    def get(self, request):
        """Render the waste detection page."""
        return render(request, self.template_name)
    
    def post(self, request):
        """Handle both camera captures and file uploads."""
        try:
            # Check if we received an image
            image_file = request.FILES.get('frame') or request.FILES.get('image')
            
            if not image_file:
                # Check if we received base64 image data
                image_data = request.POST.get('image_data')
                if image_data:
                    # Convert base64 to image file
                    image_file = self._base64_to_image(image_data)
                else:
                    return JsonResponse({
                        'error': 'No image provided',
                        'details': 'Please provide an image file or base64 image data'
                    }, status=400)
            
            # Process the image and get predictions
            predictions = self._process_image(image_file)
            
            # Format the predictions
            processed_detections = self._format_predictions(predictions)
            print(processed_detections)
            return JsonResponse({
                'status': 'success',
                'detections': processed_detections
            })
            
        except Exception as e:
            logger.error(f"Error processing waste detection: {str(e)}", exc_info=True)
            return JsonResponse({
                'error': 'Processing failed',
                'details': str(e)
            }, status=500)
    
    def _process_image(self, image_file):
        """Process the image and get predictions from the model."""
        try:
            # Convert image to format compatible with model
            image = Image.open(image_file)
            
            # Convert RGBA to RGB if necessary
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_np = np.array(image)
            
            # Make prediction
            result = model.predict(image_np, confidence=40, overlap=30).json()
            
            return result.get('predictions', [])
            
        except Exception as e:
            logger.error(f"Error in image processing: {str(e)}", exc_info=True)
            raise
    
    def _format_predictions(self, predictions):
        """Format the predictions for frontend consumption."""
        processed_detections = []
        
        for prediction in predictions:
            try:
                # Extract basic information
                label = prediction['class']
                id_class = prediction["class_id"]
                confidence = prediction['confidence']
                # Calculate coordinates
                x = int(prediction['x'])
                y = int(prediction['y'])
                width = int(prediction['width'])
                height = int(prediction['height'])
                # Create formatted detection object
                detection = {
                    'id_class': id_class,
                    "label": label,
                    "confidence": confidence,
                    "coordinates": {
                        "x": x,
                        "y": y,
                        "width": width,
                        "height": height
                    }
                }
                
                processed_detections.append(detection)
                
            except KeyError as e:
                logger.warning(f"Skipping malformed prediction: {str(e)}")
                continue
                
        return processed_detections
    
    def _base64_to_image(self, base64_string):
        """Convert base64 string to image file."""
        try:
            # Remove header if present
            if 'base64,' in base64_string:
                base64_string = base64_string.split('base64,')[1]
            
            # Decode base64 string
            image_data = base64.b64decode(base64_string)
            
            # Create file-like object
            image_file = BytesIO(image_data)
            
            # Create InMemoryUploadedFile
            return InMemoryUploadedFile(
                file=image_file,
                field_name=None,
                name='image.jpg',
                content_type='image/jpeg',
                size=len(image_data),
                charset=None
            )
            
        except Exception as e:
            logger.error(f"Error converting base64 to image: {str(e)}", exc_info=True)
            raise