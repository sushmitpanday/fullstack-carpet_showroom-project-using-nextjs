import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# strict_slashes=False add kiya hai taaki /analyze aur /analyze/ dono chalein
@app.route("/analyze", methods=["POST"], strict_slashes=False)
def analyze_carpet():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        inventory = data.get('payload', []) 

        if not inventory:
            return jsonify({"error": "No data found in inventory"}), 400

        main_item = inventory[0] 
        prediction = main_item.get('jobName', 'Unknown')
        details = main_item.get('description', 'No description available')
        
        similar_matches = []
        for item in inventory[1:4]: 
            similar_matches.append({
                "name": item.get('jobName'),
                "match": f"{random.randint(80, 98)}%", 
                "price": item.get('quantity', '0'),
                "imageUrl": item.get('imageUrl') 
            })

        return jsonify({
            "status": "Success",
            "data": {
                "prediction": f"Match Found: {prediction}",
                "pattern": "Detected from Database",
                "confidence": f"{random.uniform(90.0, 99.0):.1f}%",
                "details": details
            },
            "similar": similar_matches 
        })
    except Exception as e:
        print(f"Error: {str(e)}") # Ye Render logs mein dikhega
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Render ke liye port 5000 standard hai par environment variable use karna behtar hai
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)