from django.urls import reverse
from rest_framework import serializers
from .models import StoryItem

class StoryItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = StoryItem
        fields = ["id", "title", "image", "sort_order"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            filename = (
                obj.image.file_name
                or getattr(obj.image.file, "name", "")
                or ""
            ).lower()
            is_image = (
                obj.image.media_type == "image"
                or (obj.image.content_type or "").lower().startswith("image/")
                or filename.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp"))
            )
            if is_image:
                version = int(obj.image.updated_at.timestamp()) if obj.image.updated_at else 0
                path = f"{reverse('mediaasset-file', kwargs={'pk': obj.image.pk})}?v={version}"
                return request.build_absolute_uri(path) if request else path
            return obj.image.public_url(request)
        return None
