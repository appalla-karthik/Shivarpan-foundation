from __future__ import annotations

import re
from urllib.parse import parse_qs, urlparse


YOUTUBE_VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{6,20}$")


def extract_youtube_video_id(value: str) -> str:
    """Return a safe YouTube video id for supported public YouTube URL formats."""
    raw_value = (value or "").strip()
    if not raw_value:
        return ""

    try:
        parsed = urlparse(raw_value)
    except ValueError:
        return ""

    hostname = (parsed.hostname or "").lower().removeprefix("www.")
    candidate = ""

    if hostname == "youtu.be":
        candidate = parsed.path.strip("/").split("/", 1)[0]
    elif hostname in {
        "youtube.com",
        "m.youtube.com",
        "music.youtube.com",
        "youtube-nocookie.com",
    }:
        path_parts = [part for part in parsed.path.split("/") if part]
        if parsed.path.rstrip("/") == "/watch":
            candidate = parse_qs(parsed.query).get("v", [""])[0]
        elif len(path_parts) >= 2 and path_parts[0] in {"embed", "shorts", "live"}:
            candidate = path_parts[1]

    return candidate if YOUTUBE_VIDEO_ID_PATTERN.fullmatch(candidate) else ""


def youtube_thumbnail_url(video_id: str) -> str:
    if not YOUTUBE_VIDEO_ID_PATTERN.fullmatch(video_id or ""):
        return ""
    return f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"


def youtube_embed_url(video_id: str) -> str:
    if not YOUTUBE_VIDEO_ID_PATTERN.fullmatch(video_id or ""):
        return ""
    return f"https://www.youtube-nocookie.com/embed/{video_id}?rel=0"
