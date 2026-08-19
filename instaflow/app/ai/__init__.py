"""AI içerik üretimi.

Sağlayıcı seçimi `.env` içindeki `AI_PROVIDER` ile yapılır. Anahtar yoksa
sistem kural tabanlı yerel üreticiye düşer; hiçbir durumda çökmez ve
kullanıcıya hangi kaynaktan üretildiği bildirilir.
"""

from .captions import (
    generate_caption,
    generate_caption_variants,
    generate_reels_description,
    generate_title,
)
from .content import generate_calendar, generate_ideas
from .hashtags import generate_hashtags
from .providers import (
    AIProvider,
    AnthropicProvider,
    LocalGenerator,
    LocalProvider,
    OpenAIProvider,
    get_provider,
)

__all__ = [
    "AIProvider",
    "AnthropicProvider",
    "LocalGenerator",
    "LocalProvider",
    "OpenAIProvider",
    "generate_calendar",
    "generate_caption",
    "generate_caption_variants",
    "generate_hashtags",
    "generate_ideas",
    "generate_reels_description",
    "generate_title",
    "get_provider",
]
