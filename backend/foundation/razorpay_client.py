from __future__ import annotations

import base64
import hashlib
import hmac
import json
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class RazorpayError(Exception):
    pass


@dataclass
class RazorpayCredentials:
    key_id: str
    key_secret: str


class RazorpayClient:
    base_url = "https://api.razorpay.com/v1"

    def __init__(self, credentials: RazorpayCredentials):
        self.credentials = credentials

    def _headers(self) -> dict[str, str]:
        token = base64.b64encode(
            f"{self.credentials.key_id}:{self.credentials.key_secret}".encode("utf-8")
        ).decode("ascii")
        return {
            "Authorization": f"Basic {token}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        request = Request(
            url=f"{self.base_url}{path}",
            data=body,
            headers=self._headers(),
            method=method,
        )
        try:
            with urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="ignore")
            try:
                data = json.loads(raw)
                description = data.get("error", {}).get("description") or raw
            except json.JSONDecodeError:
                description = raw or str(exc)
            raise RazorpayError(description) from exc
        except URLError as exc:
            raise RazorpayError(f"Unable to reach Razorpay: {exc.reason}") from exc

    def create_order(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", "/orders", payload)

    def create_plan(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", "/plans", payload)

    def create_subscription(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", "/subscriptions", payload)

    def fetch_payment(self, payment_id: str) -> dict[str, Any]:
        return self._request("GET", f"/payments/{payment_id}")


def verify_payment_signature(secret: str, order_id: str, payment_id: str, signature: str) -> bool:
    generated = hmac.new(
        secret.encode("utf-8"),
        f"{order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated, signature)


def verify_subscription_signature(secret: str, payment_id: str, subscription_id: str, signature: str) -> bool:
    generated = hmac.new(
        secret.encode("utf-8"),
        f"{payment_id}|{subscription_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated, signature)


def verify_webhook_signature(secret: str, body: bytes, signature: str) -> bool:
    if not secret or not signature:
        return False
    generated = hmac.new(
        secret.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated, signature)
