import os
import tensorflow as tf
import numpy as np
import requests
from tqdm import tqdm
from tensorflow.keras.preprocessing import image

# Define the URL to the model
# model_url = 'https://storage.googleapis.com/fitfirst-model-bucket/food_detection_model.keras'
model_url = 'https://storage.googleapis.com/fitfirst-model-bucket/best_model_densenet_27.keras'

# Define the path to the local model file
# local_model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'food_detection_model.keras')
local_model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'best_model_densenet_27.keras')

# Check if the local model file exists
if not os.path.exists(local_model_path):
    print(f"Local model file not found. Downloading from {model_url}...")
    # Create the local directories if they do not exist
    os.makedirs(os.path.dirname(local_model_path), exist_ok=True)

    # Download the model file via HTTP with a progress bar
    response = requests.get(model_url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    block_size = 1024  # 1 Kibibyte

    if response.status_code == 200:
        with open(local_model_path, 'wb') as file, tqdm(
            desc="Downloading model",
            total=total_size,
            unit='iB',
            unit_scale=True,
        ) as bar:
            for chunk in response.iter_content(block_size):
                file.write(chunk)
                bar.update(len(chunk))
        print(f"Model downloaded successfully and saved to {local_model_path}")
    else:
        raise Exception(f"Failed to download model. HTTP status code: {response.status_code}")

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
    (2, 'Ayam Goreng'),
    (3, 'Bakso'),
    (4, 'Batagor'),
    (5, 'Bebek Goreng'),
    (6, 'Cireng'),
    (7, 'Donut'),
    (8, 'French Fries'),
    (9, 'Gado - Gado'),
    (10, 'Gulai Kambing'),
    (11, 'Martabak Asin'),
    (12, 'Martabak Manis'),
    (13, 'Mie Ayam'),
    (14, 'Nasi Goreng'),
    (15, 'Nasi Kuning'),
    (16, 'Pecel Lele'),
    (17, 'Pempek'),
    (18, 'Pizza'),
    (19, 'Rendang'),
    (20, 'Sate Ayam'),
    (21, 'Sop Buntut'),
    (22, 'Soto'),
    (23, 'Tahu Goreng'),
    (24, 'Tekwan'),
    (25, 'Telur Dadar'),
    (26, 'Tempe Goreng')
]
FOOD_LABELS = {index: name for index, name in FOOD_PREDICTION_CLASSES}

def preprocess_image(img):
    """ Preprocess image bytes to be used as model input."""
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

def predict_food(img) -> tuple[str, float]:
    """ 
    Takes image bytes as input and returns the predicted 
    food class and its confidence score. """

    processed_image = preprocess_image(img)
    predictions = model.predict(processed_image)

    predicted_class = np.argmax(predictions, axis=1)[0]
    confidence_score = float(predictions[0][predicted_class]) 

    predicted_label = FOOD_LABELS[predicted_class]

    return predicted_label, confidence_score
