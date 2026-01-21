import os

workers = 4
worker_class = "sync"
bind = f"0.0.0.0:{os.getenv('PORT', 8000)}"
timeout = 60
keepalive = 2
