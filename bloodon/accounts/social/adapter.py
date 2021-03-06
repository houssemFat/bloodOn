from __future__ import absolute_import

from django.core.urlresolvers import reverse

from .utils import (import_attribute)
from ..utils import valid_email_or_none
from bloodon.accounts.utils import user_email, user_username, user_field, get_new_user
from bloodon.accounts.helper import AccountHelper

from . import app_settings


class DefaultSocialAccountAdapter(object):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed
        (and before the pre_social_login signal is emitted).

        You can use this hook to intervene, e.g. abort the login by
        raising an ImmediateHttpResponse

        Why both an adapter hook and the signal? Intervening in
        e.g. the flow from within a signal handler is bad -- multiple
        handlers may be active and are executed in undetermined order.
        """
        pass

    def new_user(self, request, sociallogin):
        """
        Instantiates a new User instance.
        """
        return get_new_user(request)

    def save_user(self, request, sociallogin, form=None):
        """
        Saves a newly signed up social login. In case of auto-signup,
        the signup form is not available.
        """
        u = sociallogin.account.user
        u.set_unusable_password()
        AccountHelper().populate_username(u)
        sociallogin.save(request)
        return u

    def populate_user(self, socialLogin, data):
        """
        Hook that can be used to further populate the user instance.

        For convenience, we populate several common fields.

        Note that the user instance being populated represents a
        suggested User instance that represents the social user that is
        in the process of being logged in.

        The User instance need not be completely valid and conflict
        free. For example, verifying whether or not the username
        already exists, is not a responsibility.
        """
        username = data.get('username')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        name = data.get('name')
        user = socialLogin.account.user
        user_username(user, username or '')
        user_email(user, valid_email_or_none(email) or '')
        name_parts = (name or '').partition(' ')
        user_field(user, 'first_name', first_name or name_parts[0])
        user_field(user, 'last_name', last_name or name_parts[2])
        return user

    def get_connect_redirect_url(self, request):
        """
        Returns the default URL to redirect to after successfully
        connecting a social account.
        """
        assert request.user.is_authenticated()
        url = reverse('socialaccount_connections')
        return url


    def is_open_for_signup(self, request, socialLogin):
        """
        Checks whether or not the site is open for signups.

        Next to simply returning True/False you can also intervene the
        regular flow by raising an ImmediateHttpResponse
        """
        return AccountHelper().is_open_for_signup(request)


def get_adapter():
    return import_attribute(app_settings.ADAPTER)()
