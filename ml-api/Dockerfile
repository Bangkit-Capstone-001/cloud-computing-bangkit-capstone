FROM python:3.10-slim

ENV PYTHONUNBUFFERED True

# set the working directory
WORKDIR /usr/src/app

# install dependencies
COPY ./requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# copy src code
COPY ./app ./app

EXPOSE 8000

# start the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]