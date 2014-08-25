from django.contrib import messages
from django.contrib.auth import logout
from django.shortcuts import render_to_response, render
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.template.defaultfilters import slugify
from bloodon.accounts.social.adapter import get_adapter as get_account_adapter
from .adapter import get_adapter
from . import app_settings
from bloodon.accounts import app_settings as account_settings
from ..exceptions import ImmediateHttpResponse

from bloodon.accounts.utils import (perform_login, complete_signup, user_email)
from .utils import (email_address_exists)


def _process_signup(request, socialLogin):
    # If email is specified, check for duplicate and if so, no auto signup.
    auto_signup = app_settings.AUTO_SIGNUP
    email = user_email(socialLogin.account.user)
    if auto_signup:
        # Let's check if auto_signup is really possible...
        if email:
            if account_settings.UNIQUE_EMAIL:
                if email_address_exists(email):
                    # Oops, another user already has this address.  We
                    # cannot simply connect this social account to the
                    # existing user. Reason is that the email adress may
                    # not be verified, meaning, the user may be a hacker
                    # that has added your email address to his account in
                    # the hope that you fall in his trap.  We cannot check
                    # on 'email_address.verified' either, because
                    # 'email_address' is not guaranteed to be verified.
                    auto_signup = False
                    # FIXME: We redirect to signup form -- user will
                    # see email address conflict only after posting
                    # whereas we detected it here already.
        elif app_settings.EMAIL_REQUIRED:
            # Nope, email is required and we don't have it yet... (twitter case)
            auto_signup = False
    if not auto_signup:
        request.session['socialaccount_sociallogin'] = socialLogin
        url = reverse('account_signup')
        ret = HttpResponseRedirect(url)
    else:
        # FIXME: This part contains a lot of duplication of logic
        # ("closed" rendering, create user, send email, in active
        # etc..)
        try:
            if not get_adapter().is_open_for_signup(request,
                                                    socialLogin):
                return render(request,
                              "account/signup_closed.html")
        except ImmediateHttpResponse as e:
            return e.response
        get_adapter().save_user(request, socialLogin, form=None)
        ret = complete_social_signup(request, socialLogin)
    return ret


def _login_social_account(request, socialLogin):
    user = socialLogin.account.user
    ret = perform_login(request, user, redirect_url=socialLogin.get_redirect_url(request),
                        signal_kwargs={"socialLogin": socialLogin})
    return ret


def render_authentication_error(request, extra_context={}):
    return render_to_response(
        "socialaccount/authentication_error.html",
        extra_context, context_instance=RequestContext(request))


def _add_social_account(request, socialLogin):
    if request.user.is_anonymous():
        # This should not happen. Simply redirect to the connections
        # view (which has a login required)
        return reverse('socialaccount_connections')
    level = messages.INFO
    message = 'socialaccount/messages/account_connected.txt'
    if socialLogin.is_existing:
        if socialLogin.account.user != request.user:
            # Social account of other user. For now, this scenario
            # is not supported. Issue is that one cannot simply
            # remove the social account from the other user, as
            # that may render the account unusable.
            level = messages.ERROR
            message = 'socialaccount/messages/account_connected_other.txt'
        else:
            # This account is already connected -- let's play along
            # and render the standard "account connected" message
            # without actually doing anything.
            pass
    else:
        # New account, let's connect
        socialLogin.connect(request, request.user)
    default_next = get_adapter() \
        .get_connect_redirect_url(request,
                                  socialLogin.account)
    next_url = socialLogin.get_redirect_url(request) or default_next
    get_account_adapter().add_message(request, level, message)
    return HttpResponseRedirect(next_url)


def complete_social_login(request, socialLogin):
    assert not socialLogin.is_existing
    socialLogin.lookup()
    try:
        get_adapter().pre_social_login(request, socialLogin)
    except Exception as e:
        return e.response
    if socialLogin.state.get('process') == 'connect':
        return _add_social_account(request, socialLogin)
    else:
        return _complete_social_login(request, socialLogin)


def _complete_social_login(request, socialLogin):
    if request.user.is_authenticated():
        logout(request)
    if socialLogin.is_existing:
        # Login existing user
        ret = _login_social_account(request, socialLogin)
    else:
        # New social user
        ret = _process_signup(request, socialLogin)
    return ret


def _name_from_url(url):
    try:
        from urllib.parse import urlparse
    except ImportError:
        from urlparse import urlparse

    p = urlparse(url)
    for base in (p.path.split('/')[-1],
                 p.path,
                 p.netloc):
        name = ".".join(filter(lambda s: s,
                               map(slugify, base.split("."))))
        if name:
            return name


def complete_social_signup(request, socialLogin):
    return complete_signup(request,
                           socialLogin.account.user,
                           app_settings.EMAIL_VERIFICATION,
                           socialLogin.get_redirect_url(request),
                           signal_kwargs={'socialLogin': socialLogin})


# TODO: Factor out callable importing functionality
# See: account.utils.user_display
def import_path(path):
    modname, _, attr = path.rpartition('.')
    m = __import__(modname, fromlist=[attr])
    return getattr(m, attr)
