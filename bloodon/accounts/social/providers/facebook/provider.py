import json

from django.core.urlresolvers import reverse
from django.template.loader import render_to_string
from django.template import RequestContext
from django.utils.html import mark_safe
from django.conf import settings

from bloodon.accounts.social.utils import import_callable
from bloodon.accounts.social import providers
from bloodon.accounts.social.providers.base import (ProviderAccount,
                                                   AuthProcess,
                                                   AuthAction)
from bloodon.accounts.social.providers.oauth2.provider import OAuth2Provider

from .locale import get_default_locale_callable
import requests

class FacebookAccount(ProviderAccount):
    def get_profile_url(self):
        return self.account.extra_data.get('link')

    def get_avatar_url(self):
        uid = self.account.uid
        return 'http://graph.facebook.com/%s/picture?type=large' % uid

    def get_friends_list(self, token):
        # FIXME
        api_key = settings.PROVIDERS['facebook']['key']
        url = "https://graph.facebook.com/me/friends?fields=address,cover,email,first_name,last_name&method=GET&format=json&suppress_http_code=1&access_token=%s" % token.token
        #params = {'accesstoken' : token.token, 'fields' : 'name,hometown,location', 'app_id' : api_key }
        # TODO: Proper exception handling
        #token_access =   "Authorization: Bearer {accessToken}
        headers = {'Content-Type' : 'application/json' }
        r = requests.get(url, headers=headers);
        response = r.json ()
        lists = []
        for item in response['data'] :
            info = []
            info.append(item['first_name'])
            try :
                info.append(item['cover']['source'])
            except Exception:
                info.append('/cc')
            lists.append(info)
        return lists
    
    def to_str(self):
        default = super(FacebookAccount, self).to_str()
        return self.account.extra_data.get('name', default)


class FacebookProvider(OAuth2Provider):
    id = 'facebook'
    name = 'Facebook'
    package = 'bloodon.accounts.social.providers.facebook'
    account_class = FacebookAccount

    def __init__(self):
        self._locale_callable_cache = None
        super(FacebookProvider, self).__init__()

    def get_method(self):
        return self.get_settings().get('METHOD', 'oauth2')

    def get_login_url(self, request, **kwargs):
        method = kwargs.get('method', self.get_method())
        if method == 'js_sdk':
            next = "'%s'" % (kwargs.get('next') or '')
            process = "'%s'" % (kwargs.get('process') or AuthProcess.LOGIN)
            action = "'%s'" % (kwargs.get('action') or AuthAction.AUTHENTICATE)
            ret = "javascript:allauth.facebook.login(%s, %s, %s)" \
                  % (next, action, process)
        else:
            assert method == 'oauth2'
            ret = super(FacebookProvider, self).get_login_url(request,
                                                              **kwargs)
        return ret

    def _get_locale_callable(self):
        settings = self.get_settings()
        f = settings.get('LOCALE_FUNC')
        if f:
            f = import_callable(f)
        else:
            f = get_default_locale_callable()
        return f

    def get_locale_for_request(self, request):
        if not self._locale_callable_cache:
            self._locale_callable_cache = self._get_locale_callable()
        return self._locale_callable_cache(request)

    def get_default_scope(self):
        scope = ['email','read_friendlists']
        return scope

    def get_auth_params(self, request, action):
        ret = super(FacebookProvider, self).get_auth_params(request,
                                                            action)
        if action == AuthAction.REAUTHENTICATE:
            ret['auth_type'] = 'reauthenticate'
        return ret

    def get_fb_login_options(self, request):
        ret = self.get_auth_params(request, 'authenticate')
        ret['scope'] = ','.join(self.get_scope())
        return ret

    def media_js(self, request):
        locale = self.get_locale_for_request(request)
        fb_login_options = self.get_fb_login_options(request)
        ctx = { 'facebook_channel_url':
                   request.build_absolute_uri(reverse('facebook_channel')),
               'fb_login_options': mark_safe(json.dumps(fb_login_options)),
               'facebook_jssdk_locale': locale}
        return render_to_string('facebook/fbconnect.html',
                                ctx,
                                RequestContext(request))

    def extract_uid(self, data):
        return data['id']

    def extract_common_fields(self, data):
        return dict(email=data.get('email'),
                    username=data.get('username'),
                    first_name=data.get('first_name'),
                    last_name=data.get('last_name'))


providers.registry.register(FacebookProvider)