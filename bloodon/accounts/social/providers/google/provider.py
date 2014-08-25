from bloodon.accounts.models import EmailAddress
from bloodon.accounts.social import providers
from django.conf import settings
from  bloodon.accounts.social import app_settings as social_setting
from bloodon.accounts.social.providers.base import (ProviderAccount,
                                                   AuthAction)
from bloodon.accounts.social.providers.oauth2.provider import OAuth2Provider
import requests

class Scope(object):
    USERINFO_PROFILE = 'https://www.googleapis.com/auth/userinfo.profile'
    USERINFO_EMAIL = 'https://www.googleapis.com/auth/userinfo.email'
    USER_PLUS = 'https://www.googleapis.com/auth/plus.login'
    #USER_PLUS_ME = 'https://www.googleapis.com/auth/plus.me'


class GoogleAccount(ProviderAccount):
    def get_profile_url(self):
        return self.account.extra_data.get('link')

    def get_avatar_url(self):
        url =  self.account.extra_data.get('picture')
        if not url:
            url = "https://plus.google.com/s2/photos/profile/%s?sz=100" % self.account.uid
        return url
    
    def to_str(self):
        dflt = super(GoogleAccount, self).to_str()
        return self.account.extra_data.get('name', dflt)

    def get_friends_list(self, token):
        api_key = settings.PROVIDERS['google']['key']
        
        url =  'https://content.googleapis.com/plus/v1/people/me/people/visible'
        params = { 'key' : api_key , 'access_token' : token.token}
        # TODO: Proper exception handling
        #token_access =   "Authorization: Bearer {accessToken}
        headers = {'Content-Type' : 'application/json' }
        r = requests.get(url, params = params, headers=headers);
        return  r.text

class GoogleProvider(OAuth2Provider):
    id = 'google'
    name = 'Google'
    package = 'bloodon.accounts.social.providers.google'
    account_class = GoogleAccount

    def get_default_scope(self):
        scope = [Scope.USERINFO_PROFILE]
        scope.append(Scope.USER_PLUS)
        scope.append(Scope.USERINFO_EMAIL)
        #scope.append(Scope.USER_PLUS_ME)
        return scope

    def get_auth_params(self, request, action):
        ret = super(GoogleProvider, self).get_auth_params(request,
                                                          action)
        if action == AuthAction.REAUTHENTICATE:
            ret['approval_prompt'] = 'force'
        return ret

    def extract_uid(self, data):
        return str(data['id'])

    def extract_common_fields(self, data):
        return dict(email=data.get('email'),
                    last_name=data.get('family_name'),
                    first_name=data.get('given_name'))

    def extract_email_addresses(self, data):
        ret = []
        email = data.get('email')
        if email and data.get('verified_email'):
            ret.append(EmailAddress(email=email,
                                    verified=True,
                                    primary=True))
        return ret


providers.registry.register(GoogleProvider)
