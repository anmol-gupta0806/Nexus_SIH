import time
import os
from fastapi import APIRouter, HTTPException
from .schemas import (
    PredictRequest,
    PredictResponse,
    HealthResponse,
    MetricScore,
    UncertaintySummary,
    ModelArchitecture,
)
from pipeline import SatelliteSuperResolutionPipeline

router = APIRouter()
pipeline = SatelliteSuperResolutionPipeline()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    has_cuda = False
    try:
        import torch
        has_cuda = torch.cuda.is_available()
        device_name = torch.cuda.get_device_name(0) if has_cuda else "CPU"
    except ImportError:
        device_name = "CPU (Torch not imported)"

    return HealthResponse(
        status="online",
        service="Nexus Super-Resolution ML Engine",
        version="1.0.0",
        device=device_name,
        cuda_available=has_cuda,
        supported_models=[m.value for m in ModelArchitecture]
    )

@router.get("/models")
async def list_models():
    return {
        "models": [
            {
                "id": "srgan",
                "name": "Sentinel-2 SRGAN",
                "description": "Adversarial network optimized for high frequency edge reconstruction on Sentinel-2 bands.",
                "scale_factor": 4,
                "input_resolution": "10m",
                "output_resolution": "2.5m",
                "speed": "Fast (~0.8s/tile)"
            },
            {
                "id": "diffusion",
                "name": "GeoDiffusion-SR",
                "description": "Score-based diffusion pipeline with guided sampling for fine agricultural and urban textures.",
                "scale_factor": 4,
                "input_resolution": "10m",
                "output_resolution": "2.5m",
                "speed": "Moderate (~2.5s/tile)"
            },
            {
                "id": "swin_ir",
                "name": "SwinIR Remote Sensing Transformer",
                "description": "Shifted window self-attention network preserving long-range spectral and spatial relationships.",
                "scale_factor": 4,
                "input_resolution": "10m",
                "output_resolution": "2.5m",
                "speed": "Balanced (~1.2s/tile)"
            }
        ]
    }

@router.post("/predict", response_model=PredictResponse)
async def predict_super_resolution(req: PredictRequest):
    try:
        res = pipeline.run(
            image_path=req.image_path,
            model_name=req.model_type.value,
            scale_factor=req.scale_factor,
            estimate_uncertainty=req.estimate_uncertainty
        )

        metrics = MetricScore(
            psnr=res["metrics"].get("psnr"),
            ssim=res["metrics"].get("ssim"),
            sam=res["metrics"].get("sam_deg"),
            ergas=res["metrics"].get("ergas")
        )

        uncertainty = None
        if res.get("uncertainty"):
            uncertainty = UncertaintySummary(
                mean_uncertainty=res["uncertainty"]["mean_uncertainty"],
                max_uncertainty=res["uncertainty"]["max_uncertainty"],
                high_uncertainty_coverage_pct=res["uncertainty"]["high_uncertainty_coverage_pct"],
                uncertainty_map_path=res.get("uncertainty_map_url")
            )

        return PredictResponse(
            status="success",
            job_id="job_" + str(int(time.time())),
            original_resolution=res["original_resolution"],
            target_resolution=res["target_resolution"],
            model_used=res["model_used"],
            output_path=res["output_path"],
            preview_url=res["preview_url"],
            geotiff_url=res.get("geotiff_url"),
            input_preview_url=res.get("input_preview_url"),
            uncertainty_map_url=res.get("uncertainty_map_url"),
            metrics=metrics,
            uncertainty=uncertainty,
            execution_time_seconds=res["execution_time_seconds"],
            metadata=res["metadata"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline inference failed: {str(e)}")