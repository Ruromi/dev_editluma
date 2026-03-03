"""
Server-side Supabase client.
Uses service_role key — never expose to the client.
"""
from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def db_schema() -> str:
    """Returns the active Postgres schema based on environment."""
    return settings.supabase_schema
