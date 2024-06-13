import os
import tensorflow as tf
import numpy as np
import gcsfs

# Load model
# Define the path to the local model file
local_model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'food_detection_model.keras')

# URL of the model in Google Cloud Storage
gcs_url = 'gs://fitfirst-model-bucket/food_detection_model.keras'

# Check if the local model file exists
if not os.path.exists(local_model_path):
    print(f"Local model file not found. Downloading from {gcs_url}...")
    # Create the local directories if they do not exist
    os.makedirs(os.path.dirname(local_model_path), exist_ok=True)

    # Use gcsfs to download the file from Google Cloud Storage
    fs = gcsfs.GCSFileSystem()
    with fs.open(gcs_url, 'rb') as src_file:
        with open(local_model_path, 'wb') as dst_file:
            dst_file.write(src_file.read())

# Load the model
model = tf.keras.models.load_model(local_model_path)
print("Model loaded successfully.")



# Image input setting
IMAGE_WIDTH = 224
IMAGE_HEIGHT = 224
# Food prediction classes
FOOD_PREDICTION_CLASSES = [
        (0, 'Ayam Bakar'),
        (1, 'Ayam Geprek'),
        (2, 'Bakso'),
        (3, 'Batagor'),
        (4, 'Bebek Goreng'),
        (5, 'Cireng'),
        (6, 'French Fries'),
        (7, 'Gado - Gado'),
        (8, 'Mie Ayam'),
        (9, 'Nasi Goreng'),
        (10, 'Pempek'),
        (11, 'Pizza'),
        (12, 'Rendang'),
        (13, 'Sate Ayam'),
        (14, 'Sop Buntut'),
        (15, 'Soto'),
        (16, 'Tahu Goreng'),
        (17, 'Tekwan'),
        (18, 'Telur Dadar'),
        (19, 'Tempe Goreng')
    ]
FOOD_LABELS = {index: name for index, name in FOOD_PREDICTION_CLASSES}

def preprocess_image(image_bytes: bytes):
    """ Preprocess image bytes to be used as model input."""
    
    image_tensor = tf.io.decode_image(image_bytes)
    reshaped_image = tf.image.resize(image_tensor, [IMAGE_WIDTH, IMAGE_HEIGHT])
    normalized = tf.cast(reshaped_image, tf.float32) / 255.0
    image = tf.expand_dims(normalized, axis=0)
    return image

def predict_food(image_bytes: bytes) -> tuple[str, float]:
    """ 
    Takes image bytes as input and returns the predicted 
    food class and its confidence score. """

    processed_image = preprocess_image(image_bytes)
    predictions = model.predict(processed_image)

    predicted_class = np.argmax(predictions, axis=1)[0]
    confidence_score = float(predictions[0][predicted_class]) 

    predicted_label = FOOD_LABELS[predicted_class]

    return predicted_label, confidence_score