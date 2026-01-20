import random  # Random matching and confidence values ke liye
from flask import Flask, request, jsonify
from flask_cors import CORS  # Next.js (Vercel) connection allow karne ke liye

# Flask App Initialize
app = Flask(__name__)

# CORS Enable karna zaroori hai taaki Next.js project is API se baat kar sake
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze_carpet():
    try:
        data = request.json
        # 'payload' key se inventory data nikaal rahe hain
        inventory = data.get('payload', []) 

        if not inventory:
            return jsonify({"error": "No data found in inventory"}), 400

        # --- AI SIMULATION: Pehle item ko analyze karna ---
        main_item = inventory[0] 
        
        prediction = main_item.get('jobName', 'Unknown')
        details = main_item.get('description', 'No description available')
        
        # --- DYNAMIC MATCHING: Inventory se similar items nikaalna ---
        similar_matches = []
        # Pehle 3 items ko matches bana rahe hain
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
        return jsonify({"error": str(e)}), 500

# Render local testing ke liye (Optional)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)