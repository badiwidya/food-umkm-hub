from app.schema import BaseSchema


class FavoriteStatusResponse(BaseSchema):
    is_favorited: bool
