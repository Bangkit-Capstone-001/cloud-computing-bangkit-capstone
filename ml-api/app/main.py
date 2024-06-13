import logging

logging.basicConfig(level=logging.DEBUG)

from fastapi import FastAPI
from .routers import hello, food
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hello.router)
app.include_router(food.router)