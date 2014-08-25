import requests

from bloodon.accounts.social.providers.oauth2.views import (OAuth2Adapter,
                                                            OAuth2LoginView,
                                                            OAuth2CallbackView)

from .provider import GoogleProvider


class GoogleOAuth2Adapter(OAuth2Adapter):
    provider_id = GoogleProvider.id
    access_token_url = 'https://accounts.google.com/o/oauth2/token'
    authorize_url = 'https://accounts.google.com/o/oauth2/auth'
    profile_url = 'https://www.googleapis.com/oauth2/v1/userinfo'

    def complete_login(self, request, token, **kwargs):
        resp = requests.get(self.profile_url,
                            params={'access_token': token.token,
                                    'alt': 'json'})
        extra_data = resp.json()
        provider = self.get_provider()
        login = provider.social_login_from_response(request, extra_data)
        return login


oauth2_login = OAuth2LoginView.adapter_view(GoogleOAuth2Adapter)
oauth2_callback = OAuth2CallbackView.adapter_view(GoogleOAuth2Adapter)
