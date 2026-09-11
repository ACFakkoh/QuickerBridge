"""Launch the local viewer; all calculations remain on this computer."""

import argparse
import threading
import webbrowser
import urllib.request

import uvicorn


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    url = "http://127.0.0.1:8765"
    try:
        with urllib.request.urlopen(url + "/api/health", timeout=1) as response:
            running = b"QuickerBridge" in response.read()
    except OSError:
        running = False
    if running:
        if not args.no_browser:
            webbrowser.open(url)
        print("QuickerBridge is already running at " + url)
    else:
        if not args.no_browser:
            threading.Timer(1.5, lambda: webbrowser.open(url)).start()
        print("QuickerBridge: " + url, flush=True)
        uvicorn.run(
            "quickerbridge.server:app", host="127.0.0.1", port=8765, log_level="warning"
        )
