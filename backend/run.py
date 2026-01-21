from app import create_app, db

app = create_app()

if __name__ == "__main__":
    import os
    debug_mode = os.getenv("FLASK_ENV") != "production"
    app.run(debug=debug_mode)
