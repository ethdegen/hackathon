from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.get("/v1/healthz")
def healthz():
    return {"up": True}


@app.get("/")
def index():
    return {"Hello": "World"}
