from fastapi import APIRouter

router = APIRouter()

@router.get("/", tags=["hello"])
async def hello_world():
    return {"message": "Hello World"}