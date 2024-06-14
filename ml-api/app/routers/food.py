from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
import io
from ..services.foodDetection import predict_food

router = APIRouter()

ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/heic",
    "image/heif"
]

@router.post("/food/predict", tags=["food"])
async def predict(image: UploadFile = File(...)):
    if image.content_type not in ACCEPTED_IMAGE_TYPES:
        raise HTTPException(status_code=404, detail="Invalid file type. Only images are allowed.")

    image_bytes = await image.read()
    image = Image.open(io.BytesIO(image_bytes))

    # Check if the image has an alpha channel (RGBA)
    if image.mode == 'RGBA':
        image = image.convert('RGB')

    # Convert image back to bytes
    img_byte_arr = io.BytesIO()
    img_byte_arr = img_byte_arr.getvalue()

    [label, confidence] = predict_food(img_byte_arr)

    return {"food": label, "confidence": confidence*100}