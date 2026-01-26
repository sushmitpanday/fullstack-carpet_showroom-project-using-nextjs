import random
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"], strict_slashes=False)
def analyze_carpet():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        inventory = data.get('payload', []) 

        if not inventory:
            return jsonify({"error": "No data found in inventory"}), 400

        # Sabhi items ko process kar rahe hain (Limit hata di gayi hai)
        similar_matches = []
        for item in inventory:
            similar_matches.append({
                "name": item.get('jobName', 'Unnamed Item'),
                "match": f"{random.randint(85, 98)}%", 
                "price": item.get('quantity', '0'),
                "imageUrl": item.get('imageUrl', '') 
            })

        # Pehla item Prediction ke liye use kar rahe hain
        prediction = inventory[0].get('jobName', 'Match Found')

        return jsonify({
            "status": "Success",
            "prediction": f"Match Found: {prediction}",
            "confidence": f"{random.uniform(92.0, 99.0):.1f}%",
            "similar": similar_matches 
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        # Error ko string me bhej rahe hain taaki object error na aaye
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)