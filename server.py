
import http.server
import socketserver
import mimetypes
import os
import socket

PORT = 8000

# MIME 타입 설정 (브라우저가 파일을 올바르게 해석하도록 돕습니다)
mimetypes.add_type('application/javascript', '.tsx')
mimetypes.add_type('application/javascript', '.ts')

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS 허용 및 캐시 방지 (개발 시 편리함)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def get_local_ip():
    try:
        # 실제로 외부와 통신하는 인터페이스의 IP를 가져옵니다.
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

# 실행 경로 고정
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 서버 실행
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    local_ip = get_local_ip()
    print("\n" + "="*50)
    print("🚀 수학 스파크 앱이 가동되었습니다!")
    print("="*50)
    print(f"\n1. 컴퓨터에서 접속할 때:")
    print(f"   👉 http://localhost:{PORT}")
    print(f"\n2. 휴대폰에서 접속할 때 (매우 중요!):")
    print(f"   👉 http://{local_ip}:{PORT}")
    print("\n※ 주의: 휴대폰과 컴퓨터가 반드시 같은 WiFi에 있어야 합니다.")
    print("="*50)
    print("\n서버를 중단하려면 이 창에서 Ctrl+C를 누르세요.")
    httpd.serve_forever()
