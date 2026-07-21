"""Vercel entrypoint. The Python runtime serves any ASGI app named `app`.

The sys.path line lets `from server import app` resolve both on Vercel (which
runs this file as the function) and locally from the project root via
`uvicorn api.index:app`.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from server import app  # noqa: E402

__all__ = ["app"]
