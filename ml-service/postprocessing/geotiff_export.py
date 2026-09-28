"""
GeoTIFF and Image Export Pipeline
Exports super-resolved products as multi-spectral GeoTIFFs with georeferencing
and PNG previews for web and dashboard consumption.
"""

import os
import numpy as np
from PIL import Image as PILImage
from typing import Optional, Dict, Any

class GeoTiffExporter:
    @staticmethod
    def export_preview_png(
        array: np.ndarray,
        output_filepath: str,
        is_normalized: bool = True
    ) -> str:
        """
        Exports a 3-channel (RGB) or 1-channel array as a viewable PNG image.
        array shape expected: (C, H, W) or (H, W)
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)

        if array.ndim == 3:
            if array.shape[0] >= 3:
                rgb = array[:3] # First 3 channels
            else:
                rgb = np.repeat(array[:1], 3, axis=0)
            
            if is_normalized:
                rgb = np.clip(rgb * 255.0, 0, 255).astype(np.uint8)
            else:
                rgb = rgb.astype(np.uint8)
            
            # Transpose to (H, W, C) for PIL
            img_hwc = np.transpose(rgb, (1, 2, 0))
        elif array.ndim == 2:
            if is_normalized:
                img_hwc = np.clip(array * 255.0, 0, 255).astype(np.uint8)
            else:
                img_hwc = array.astype(np.uint8)
        else:
            raise ValueError(f"Unsupported array shape: {array.shape}")

        img = PILImage.fromarray(img_hwc)
        img.save(output_filepath, format="PNG")
        return output_filepath

    @staticmethod
    def export_geotiff(
        multi_band_array: np.ndarray,
        output_filepath: str,
        geo_meta: Optional[Dict[str, Any]] = None,
        uncertainty_band: Optional[np.ndarray] = None
    ) -> str:
        """
        Exports the super-resolved array as a standard raster file.
        If rasterio / tifffile is available, exports full multi-band GeoTIFF with CRS.
        Otherwise falls back to standard multi-channel TIFF.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)

        # Append uncertainty as auxiliary channel if provided
        if uncertainty_band is not None and multi_band_array.ndim == 3:
            u_expanded = np.expand_dims(uncertainty_band, axis=0)
            data_to_save = np.concatenate([multi_band_array, u_expanded], axis=0)
        else:
            data_to_save = multi_band_array

        try:
            import tifffile
            # tifffile expects (H, W, C) or (C, H, W)
            tifffile.imwrite(output_filepath, data_to_save.astype(np.float32))
            return output_filepath
        except ImportError:
            # Export standard multi-channel GeoTIFF using PIL
            if data_to_save.ndim == 3:
                if data_to_save.shape[0] >= 3:
                    rgb = data_to_save[:3]
                else:
                    rgb = np.repeat(data_to_save[:1], 3, axis=0)
                hwc = np.transpose(rgb, (1, 2, 0))
                hwc_uint8 = np.clip(hwc * 255.0, 0, 255).astype(np.uint8)
                img = PILImage.fromarray(hwc_uint8)
            else:
                img = PILImage.fromarray(np.clip(data_to_save * 255.0, 0, 255).astype(np.uint8))
            img.save(output_filepath, format="TIFF")
            return output_filepath