import time
import threading
from typing import Any, Optional, Dict, Tuple


class SimpleCache:
    """
    Thread-safe in-memory TTL cache with bounded size, metadata tracking, and automatic eviction.
    """
    def __init__(self, max_entries: int = 2000):
        self._store: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._max_entries = max_entries

    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        now = time.time()
        with self._lock:
            if len(self._store) >= self._max_entries:
                self._evict_expired_or_oldest(now)

            self._store[key] = {
                "value": value,
                "expires_at": now + ttl,
                "cached_at": now
            }

    def get(self, key: str) -> Optional[Any]:
        now = time.time()
        with self._lock:
            item = self._store.get(key)
            if item is None:
                return None

            if now > item["expires_at"]:
                del self._store[key]
                return None

            return item["value"]

    def get_with_metadata(self, key: str) -> Tuple[Optional[Any], bool, float]:
        """
        Returns (value, is_cached, age_seconds).
        """
        now = time.time()
        with self._lock:
            item = self._store.get(key)
            if item is None:
                return None, False, 0.0

            if now > item["expires_at"]:
                del self._store[key]
                return None, False, 0.0

            age = now - item.get("cached_at", now)
            return item["value"], True, age

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._store:
                del self._store[key]
                return True
            return False

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def size(self) -> int:
        with self._lock:
            return len(self._store)

    def _evict_expired_or_oldest(self, now: float) -> None:
        expired = [k for k, v in self._store.items() if now > v["expires_at"]]
        for k in expired:
            del self._store[k]

        if len(self._store) >= self._max_entries:
            sorted_keys = sorted(self._store.keys(), key=lambda k: self._store[k].get("cached_at", 0))
            to_remove = sorted_keys[: max(1, len(sorted_keys) // 5)]
            for k in to_remove:
                del self._store[k]


cache = SimpleCache()