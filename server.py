#!/usr/bin/env python3
"""
Daiane Stefani - Studio & Beauty
Servidor Local de Desenvolvimento & Testes Mobile
"""

import http.server
import socketserver
import os
import sys
import webbrowser

# Garante suporte a UTF-8 no stdout em terminais Windows (cp1252)
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Desabilita cache estrito em dev para testes fluidos
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        content_type = super().guess_type(path)
        if path.endswith('.svg'):
            return 'image/svg+xml'
        elif path.endswith('.json') or path.endswith('.webmanifest'):
            return 'application/json'
        elif path.endswith('.js'):
            return 'application/javascript'
        return content_type

def get_local_ip():
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_server():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        local_url = f"http://localhost:{PORT}"
        network_url = f"http://{local_ip}:{PORT}"
        print("================================================================")
        print("  DAIANE STEFANI - STUDIO & BEAUTY")
        print("  Servidor Web Ativo com suporte PWA & Mobile-First!")
        print(f"  Computador:     {local_url}")
        print(f"  NO SEU CELULAR: {network_url}  [Mobile]")
        print(f"  Painel Admin:   {local_url}#admin")
        print("================================================================")
        print("  Dica Celular: Conecte o celular na mesma rede Wi-Fi.")
        print("  Login Admin:  daiane  |  Senha:  Daiane123")
        print("  Pressione Ctrl+C para encerrar o servidor.")

        if "--open" in sys.argv:
            webbrowser.open(local_url)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")

if __name__ == '__main__':
    run_server()
