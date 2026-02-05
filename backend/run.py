from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Replace the URL with your ACTUAL Cloudflare Pages URL
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://flora-x.pages.dev", 
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Ensure your routes also explicitly allow OPTIONS for preflight
@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    # ... your logic here ...
    return "Login endpoint"