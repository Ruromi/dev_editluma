import hashlib

from fastapi import Request

from app.core.config import settings

DEFAULT_ALLOWED_IP_HASHES = {
    "fa8108dc82027d57f02afdbb95129071595c31c36d193787d7fddaf9de505254",
}
LOCAL_IPS = {"127.0.0.1", "localhost"}


def _split_csv(raw: str) -> list[str]:
    return [value.strip() for value in raw.split(",") if value.strip()]


def normalize_ip(ip: str) -> str:
    trimmed = ip.strip()
    if not trimmed:
        return ""
    if trimmed.startswith("::ffff:"):
        return trimmed[len("::ffff:") :]
    if trimmed == "::1":
        return "127.0.0.1"
    return trimmed


def hash_value(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def get_request_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return normalize_ip(forwarded_for.split(",")[0])

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return normalize_ip(real_ip)

    client = request.client.host if request.client else ""
    return normalize_ip(client)


def get_allowed_site_ip_hashes() -> set[str]:
    configured_hashes = {
        value.lower() for value in _split_csv(settings.dev_allowed_ip_hashes)
    }
    if configured_hashes:
        return configured_hashes

    configured_ips = _split_csv(settings.dev_allowed_ips)
    if configured_ips:
        return {
            hash_value(normalize_ip(value))
            for value in configured_ips
            if normalize_ip(value)
        }

    return DEFAULT_ALLOWED_IP_HASHES


def has_site_ip_access(request: Request) -> bool:
    request_ip = get_request_ip(request)
    if not request_ip:
        return False

    if not settings.is_production and request_ip in LOCAL_IPS:
        return True

    return hash_value(request_ip) in get_allowed_site_ip_hashes()
