from PyPDF2 import PdfReader, PdfWriter, Transformation
from PyPDF2.errors import PdfReadError

# Target size in points (1 inch = 72 points)
TARGET_WIDTH = 5.06 * 72  # 365.44 pt
TARGET_HEIGHT = 7.81 * 72 # 562.44 pt

def resize_pdf(input_path, output_path):
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for page in reader.pages:
        orig_width = float(page.mediabox.width)
        orig_height = float(page.mediabox.height)

        # Calculate scaling factor
        scale_x = TARGET_WIDTH / orig_width
        scale_y = TARGET_HEIGHT / orig_height
        scale = min(scale_x, scale_y)

        # Calculate translation to center content
        new_width = orig_width * scale
        new_height = orig_height * scale
        translate_x = (TARGET_WIDTH - new_width) / 2
        translate_y = (TARGET_HEIGHT - new_height) / 2

        # Apply transformation
        transformation = Transformation().scale(scale).translate(tx=translate_x, ty=translate_y)
        page.add_transformation(transformation)
        page.mediabox.lower_left = (0, 0)
        page.mediabox.upper_right = (TARGET_WIDTH, TARGET_HEIGHT)

        writer.add_page(page)

    with open(output_path, "wb") as out_file:
        writer.write(out_file)

# Usage:
# resize_pdf("woundwise-final.pdf", "resized_KDP.pdf")

