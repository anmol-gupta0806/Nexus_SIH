"""
Base Super-Resolution Model Interface
Standardizes inference, tiling, and uncertainty sampling across all model architectures
(SRGAN, GeoDiffusion, SwinIR Transformer).
"""

from abc import ABC, abstractmethod
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from preprocessing.tiling import RasterTiler
from postprocessing.merge_tiles import TileMerger
from postprocessing.uncertainty import SpatialUncertaintyEstimator

class BaseSuperResolutionModel(ABC):
    def __init__(self, name: str, scale_factor: int = 4, in_channels: int = 4):
        self.name = name
        self.scale_factor = scale_factor
        self.in_channels = in_channels

    @abstractmethod
    def predict_tile(self, tile: np.ndarray) -> np.ndarray:
        """
        Runs super-resolution on a single tile patch.
        Input: (C, H, W)
        Output: (C, H * scale_factor, W * scale_factor)
        """
        pass

    def predict_scene(
        self,
        image: np.ndarray,
        tile_size: int = 256,
        overlap: int = 32
    ) -> np.ndarray:
        """
        Processes a full satellite scene by tiling, running inference, and seamlessly merging.
        """
        tiler = RasterTiler(tile_size=tile_size, overlap=overlap)
        tiles, meta = tiler.split_into_tiles(image)

        sr_tiles = []
        for t in tiles:
            sr_tile = self.predict_tile(t)
            sr_tiles.append(sr_tile)

        merged = TileMerger.merge_super_resolved_tiles(sr_tiles, meta, scale_factor=self.scale_factor)
        return merged

    def predict_with_uncertainty(
        self,
        image: np.ndarray,
        num_samples: int = 5,
        tile_size: int = 256,
        overlap: int = 32
    ) -> Tuple[np.ndarray, np.ndarray, Dict[str, float]]:
        """
        Runs stochastic inference passes to estimate pixel-wise uncertainty.
        Returns:
            mean_prediction: (C, H * scale_factor, W * scale_factor)
            uncertainty_map: (H * scale_factor, W * scale_factor) in [0, 1]
            stats: Summary metrics
        """
        sample_runs = []
        for _ in range(max(2, num_samples)):
            run = self.predict_scene(image, tile_size=tile_size, overlap=overlap)
            sample_runs.append(run)

        # Average prediction across runs
        mean_pred = np.mean(np.stack(sample_runs, axis=0), axis=0)

        # Variance uncertainty map
        u_map, stats = SpatialUncertaintyEstimator.compute_variance_map(sample_runs)

        return mean_pred, u_map, stats