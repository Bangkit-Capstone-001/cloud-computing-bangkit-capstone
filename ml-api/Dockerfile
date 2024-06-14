FROM python:3.10-slim

ENV PYTHONUNBUFFERED True

# set the working directory
WORKDIR /usr/src/app

# install dependencies
COPY ./requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# copy src code
COPY ./app ./app

# ADD https://storage.googleapis.com/fitfirst-model-bucket/food_detection_model.keras ./app/models/food_detection_model.keras
ADD https://storage.googleapis.com/fitfirst-model-bucket/best_model_densenet_27.keras ./app/models/best_model_densenet_27.keras

EXPOSE 4000

# start the server
CMD ["uvicorn", "app.main:app", "--timeout-keep-alive", "0", "--host", "0.0.0.0", "--port", "4000", "--proxy-headers"]