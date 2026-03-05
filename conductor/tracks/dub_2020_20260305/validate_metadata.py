import os
import yaml
import sys

def test_metadata():
    lecture_dir = '_2020_kr'
    files = [f for f in os.listdir(lecture_dir) if f.endswith('.md') and f != 'index.md']
    missing_metadata = []

    for filename in files:
        filepath = os.path.join(lecture_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if content.startswith('---'):
                try:
                    _, front_matter, _ = content.split('---', 2)
                    data = yaml.safe_load(front_matter)
                    video = data.get('video')
                    if not video or not video.get('id'):
                        missing_metadata.append(f"{filename}: Missing video.id")
                    elif not video.get('id').startswith('kr_'): # Expecting Korean video IDs to start with kr_
                        missing_metadata.append(f"{filename}: English video ID found ({video.get('id')})")
                except Exception as e:
                    missing_metadata.append(f"{filename}: Error parsing YAML ({e})")
            else:
                missing_metadata.append(f"{filename}: No front matter found")

    if missing_metadata:
        print("Metadata validation failed:")
        for error in missing_metadata:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("All metadata validated successfully.")
        sys.exit(0)

if __name__ == "__main__":
    test_metadata()
