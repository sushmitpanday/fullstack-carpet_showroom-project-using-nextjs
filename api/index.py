from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route("/api/python", methods=["POST"])
def analyze_carpet():
    if 'file' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    # --- STEP 1: PREPROCESSING ---
    file = request.files['file']
    img = Image.open(io.BytesIO(file.read()))
    
    # Image ko AI ke size (224x224) mein badalna
    img = img.resize((224, 224))
    
    # Image ko numbers (array) mein badalna
    img_array = np.array(img) / 255.0  # Normalization (0 se 1 ke beech numbers)

    # --- STEP 2: CLASSIFICATION (Logic) ---
    # Abhi humne asli .h5 model file load nahi ki hai (kyuki wo badi hoti hai)
    # Isliye hum logic likh rahe hain jo design pehchanne ka dhancha dikhaye
    
    return jsonify({
        "status": "Success",
        "data": {
            "prediction": "Oriental Persian Design",
            "pattern": "Floral Medallion",
            "confidence": "92.5%",
            "details": "High density knots detected, suitable for luxury segment."
        }
    })

if __name__ == "__main__":
    app.run(port=5328)