from PIL import Image
import pytesseract
import io, os

from pdf2image import convert_from_bytes

def extract_text_from_image(file_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(file_bytes))
    text = pytesseract.image_to_string(image)
    return text

def extract_text_from_pdf(file_bytes: bytes) -> str:
    images = convert_from_bytes(file_bytes)
    all_text = []
    for page_img in images:
        text = pytesseract.image_to_string(page_img)
        all_text.append(text)
    return "\n\n".join(all_text)
