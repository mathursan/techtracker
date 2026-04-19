"""Public surface of the universes package — re-export the registry."""
from ._registry import UNIVERSE_SLUGS, UNIVERSES, UniverseDef

__all__ = ["UNIVERSE_SLUGS", "UNIVERSES", "UniverseDef"]
