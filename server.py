import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    # Try port 3000, fallback to 8080 if in use
    for port in [3000, 8080, 8888, 5000]:
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print(f"🎬 CandidSet BTS Cameo Server running at http://localhost:{port}")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError:
            continue
