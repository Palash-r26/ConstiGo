from PIL import Image, ImageChops
import os

def crop_logo(image_path, out_path):
    img = Image.open(image_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Create a bounding box of the non-white, non-transparent area
    # Convert white to transparent for cropping purposes
    datas = img.getdata()
    newData = []
    for item in datas:
        # If it's white or very close to white, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img.putdata(newData)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path)
    return img

def create_icon(img, size, out_path):
    # Make a square canvas with padding
    longest_side = max(img.size)
    # Add a bit of padding (e.g. 10%)
    canvas_size = int(longest_side * 1.2)
    
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 0))
    # Paste centered
    offset = ((canvas_size - img.size[0]) // 2, (canvas_size - img.size[1]) // 2)
    canvas.paste(img, offset)
    
    # Resize
    icon = canvas.resize((size, size), Image.Resampling.LANCZOS)
    icon.save(out_path)

def main():
    base_dir = r"d:\ConstiGo\mobile"
    img_path = os.path.join(base_dir, "..", "Gemini_Generated_Image_6gbd916gbd916gbd.png")
    
    logo_path = os.path.join(base_dir, "src", "presentation", "assets", "images", "logo.png")
    logo_white_path = os.path.join(base_dir, "src", "presentation", "assets", "images", "logo_white.png")
    
    cropped_img = crop_logo(img_path, logo_path)
    cropped_img.save(logo_white_path)
    print("Cropped logo saved.")
    
    res_dir = os.path.join(base_dir, "android", "app", "src", "main", "res")
    
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    
    for folder, size in sizes.items():
        folder_path = os.path.join(res_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        
        ic_launcher = os.path.join(folder_path, "ic_launcher.png")
        ic_launcher_round = os.path.join(folder_path, "ic_launcher_round.png")
        
        create_icon(cropped_img, size, ic_launcher)
        create_icon(cropped_img, size, ic_launcher_round)
        print(f"Created icons for {folder}")
        
if __name__ == '__main__':
    main()
