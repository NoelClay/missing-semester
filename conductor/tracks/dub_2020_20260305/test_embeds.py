import os
import sys

def test_embeds():
    lecture_dir = '_2020_kr'
    files = [f for f in os.listdir(lecture_dir) if f.endswith('.md') and f != 'index.md']
    missing_embeds = []

    for filename in files:
        filepath = os.path.join(lecture_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # The site uses a liquid include for videos, usually scaled_video.html or video.html
            # But the metadata is in the front matter under video.id
            # Let's verify the metadata is correct (redundant but good) and that the include is used or the layout handles it.
            # In this project, the layout 'lecture' usually handles the video embed using front matter.
            
            if 'layout: lecture' in content:
                if 'video:' not in content or 'id: kr_' not in content:
                    missing_embeds.append(f"{filename}: Missing or invalid video metadata in front matter")
            else:
                missing_embeds.append(f"{filename}: Not using 'lecture' layout")

    if missing_embeds:
        print("Embed validation failed:")
        for error in missing_embeds:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("All lecture embeds validated successfully.")
        sys.exit(0)

if __name__ == "__main__":
    test_embeds()
