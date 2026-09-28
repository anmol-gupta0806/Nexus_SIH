import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import router

app = FastAPI(
    title="Nexus Satellite Super-Resolution Engine",
    description="Deep Learning microservice for enhancing Sentinel-2 (10m) Earth observation imagery to <4m spatial resolution.",
    version="1.0.0"
)

# CORS configuration to allow Express backend and local dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount data outputs directory for static previews
outputs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/outputs"))
os.makedirs(outputs_dir, exist_ok=True)
app.mount("/static/outputs", StaticFiles(directory=outputs_dir), name="outputs")

# Include routes
app.include_router(router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "service": "Nexus Satellite Super-Resolution ML Microservice",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.app:app", host="127.0.0.1", port=8000, reload=True)
