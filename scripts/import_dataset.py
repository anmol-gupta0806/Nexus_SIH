import os
import requests

out_dir = os.path.abspath("data/raw/sentinel2")
os.makedirs(out_dir, exist_ok=True)

base_url = "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/38/X/MF/2026/9/S2C_38XMF_20260928_0_L2A"
bands = {
    "TCI.tif": "True Color RGB Image (10m GSD)",
    "B02.tif": "Blue Band 492nm (10m GSD)",
    "B03.tif": "Green Band 560nm (10m GSD)",
    "B04.tif": "Red Band 665nm (10m GSD)",
    "B08.tif": "NIR Band 833nm (10m GSD)"
}

print("==================================================================")
print("[Downloading Real Sentinel-2 Level-2A Multi-Spectral Imagery]")
print(f"Destination Directory: {out_dir}")
print("==================================================================")

for filename, desc in bands.items():
    file_path = os.path.join(out_dir, filename)
    url = f"{base_url}/{filename}"
    print(f"\n[Fetching] {filename} - {desc}")
    print(f"  URL: {url}")
    
    r = requests.get(url, stream=True, timeout=30)
    if r.status_code == 200:
        total_size = int(r.headers.get("Content-Length", 0))
        downloaded = 0
        with open(file_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=65536):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
        print(f"  [SUCCESS] Saved: {filename} ({downloaded / 1024:.1f} KB)")
    else:
        print(f"  [FAILED] Status code: {r.status_code}")

print("\nDataset import complete!")