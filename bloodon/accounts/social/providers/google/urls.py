from bloodon.accounts.social.providers.oauth2.urls import default_urlpatterns
from .provider import GoogleProvider

urlpatterns = default_urlpatterns(GoogleProvider)
