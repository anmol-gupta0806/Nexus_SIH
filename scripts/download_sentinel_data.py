"""
Sentinel-2 Data Acquisition Script for Copernicus Data Space Ecosystem (CDSE)
Portal: https://browser.dataspace.copernicus.eu
"""

import sys
import os
import argparse
from pathlib import Path

# Add ml-service to path
sys.path.append(str(Path(__file__).resolve().parent.parent / "ml-service"))
from utils.sentinel_api import CopernicusDataSpaceClient

def main():
    parser = argparse.ArgumentParser(description="Query and Download Sentinel-2 L2A data from Copernicus Data Space")
    parser.add_argument("--bbox", nargs=4, type=float, default=[76.85, 28.40, 77.35, 28.75], 
                        help="Bounding box: min_lon min_lat max_lon max_lat (Default: Delhi/NCR region)")
    parser.add_argument("--start", type=str, default="2024-03-01", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", type=str, default="2024-05-31", help="End date (YYYY-MM-DD)")
    parser.add_argument("--max-cloud", type=float, default=5.0, help="Maximum cloud cover %")
    args = parser.parse_args()

    print("================================================================")
    print("🛰️ Copernicus Data Space Ecosystem (CDSE) Sentinel-2 Downloader")
    print(f"🔗 Portal: https://browser.dataspace.copernicus.eu")
    print(f"📍 BBOX: {args.bbox}")
    print(f"📅 Temporal Range: {args.start} to {args.end}")
    print(f"☁️ Max Cloud Cover: {args.max_cloud}%")
    print("================================================================")

    client = CopernicusDataSpaceClient()
    scenes = client.search_sentinel2_scenes(
        bbox=tuple(args.bbox),
        start_date=args.start,
        end_date=args.end,
        max_cloud_cover=args.max_cloud
    )

    print(f"\n[Found {len(scenes)} Candidate L2A Scenes]")
    for i, s in enumerate(scenes, 1):
        print(f"  [{i}] Product: {s.get('name')}")
        print(f"      Acquisition: {s.get('start_date')}")
        print(f"      Cloud Cover: {s.get('cloud_cover')}%")
        print(f"      Resolution: 10m Ground Sampling Distance (B02, B03, B04, B08)")

if __name__ == "__main__":
    main()