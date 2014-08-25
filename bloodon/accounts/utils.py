import random

from django.core.validators import validate_email, ValidationError
from django.contrib.auth import login
from django.contrib import messages
from django.shortcuts import render
from django.utils.translation import ugettext_lazy as _, to_locale, get_language
from django.http import HttpResponseRedirect
from django.utils.http import urlencode
from django.utils.datastructures import SortedDict
from django.db.models import EmailField

import bbeta.bloodon.accounts.models


try:
    from django.utils.encoding import force_text
except ImportError:
    from django.utils.encoding import force_unicode as force_text

from . import app_settings
#from .adapter import get_adapter

# In Python 2.5+, the sha library was deprecated in favor of hashlib.
try:
    import hashlib

    sha_constructor = hashlib.sha1
except ImportError:
    import sha

    sha_constructor = sha.new

from datetime import timedelta

try:
    from django.utils.timezone import now
except ImportError:
    from datetime import datetime

    now = datetime.now

###############################
# E-MAIL ADDRESS VERIFICATION #
###############################

# We use the same e-mail verification functions for account creation
# and password reset, but each takes a 'task' argument, which is either
# CREATE_TASK or RESET_TASK.


def set_user_message(request, message_type, message, messageTags):
    messages.add_message(request, message_type, message, extra_tags=messageTags)


def get_next_redirect_url(request, redirect_field_name="next"):
    """
    Returns the next URL to redirect to, if it was explicitly passed
    via the request.
    """
    redirect_to = request.REQUEST.get(redirect_field_name)
    # light security check -- make sure redirect_to isn't garabage.
    if not redirect_to or "://" in redirect_to or " " in redirect_to:
        redirect_to = None
    return redirect_to


def get_login_redirect_url(request, url=None, redirect_field_name="next"):
    from .helper import AccountHelper

    redirect_url = (url
                    or get_next_redirect_url(request,
                                             redirect_field_name=redirect_field_name)
                    or AccountHelper().get_login_redirect_url(request))
    return redirect_url


_user_display_callable = None


def default_user_display(user):
    return getattr(user, 'username')


def user_display(user):
    return user.username + ' ' + user.email


def user_field(user, field, *args):
    """
    Gets or sets (optional) user model fields. No-op if fields do not exist.
    """
    if field and hasattr(user, field):
        if args:
            # Setter
            v = args[0]
            if v:
                User = get_user_model()
                v = v[0:User._meta.get_field(field).max_length]
            setattr(user, field, v)
        else:
            # Getter
            return getattr(user, field)


def user_username(user, *args):
    return user_field(user, 'username', *args)


def user_email(user, *args):
    return user_field(user, 'email', *args)


def perform_login(request, user, redirect_url=None, signup=False, **kwargs):
    """
    Keyword arguments:

    signup -- Indicates whether or not sending the
    email is essential (during signup), or if it can be skipped (e.g. in
    case email verification is optional and we are only logging in).
    """
    # not is_active: social users are redirected to a template
    # local users are stopped due to form validation checking is_active
    #assert user.is_active
    # the user have a verified email
    has_verified_email = True #bloodon.accounts.models.EmailAddress.objects.filter(user=user, verified=True).exists()

    if not has_verified_email:
        set_user_message(request, messages.WARNING, 'confirmation',
                         'please check your email to active your account ' + user_email(user))
        send_email_confirmation(request, user, signup=signup)
        return render(request,
                      "accounts/account/verification_sent.html",
                      {"email": user_email(user)})
    else:
        # authentication backend, but I fail to see any added benefit
        # whereas I do see the downsides (having to bother the integrator
        # to set up authentication backend in settings.py
        if not hasattr(user, 'backend'):
            user.backend = "django.contrib.auth.backends.ModelBackend"
        login(request, user)
        to_locale(user.userprofile.lang or get_language())
        return HttpResponseRedirect(get_login_redirect_url(request, redirect_url))


def get_success_url(request, redirect_field_name='next', success_url='/'):
    # Explicitly passed ?next= URL takes precedence
    ret = (get_next_redirect_url(request, redirect_field_name) or success_url)
    return ret


def complete_signup(request, user, email_verification, success_url, signal_kwargs={}):
    return perform_login(request, user,
                         email_verification=email_verification,
                         signup=True,
                         redirect_url=success_url,
                         signal_kwargs=signal_kwargs)


def cleanup_email_addresses(request, addresses):
    """
    Takes a list of EmailAddress instances and cleans it up, making
    sure only valid ones remain, without multiple primaries etc.

    Order is important: e.g. if multiple primary e-mail addresses
    exist, the first one encountered will be kept as primary.
    """
    from .helper import AccountHelper
    # Let's group by `email`
    e2a = SortedDict()
    primary_addresses = []
    verified_addresses = []
    primary_verified_addresses = []
    for address in addresses:
        # Pick up only valid ones...
        email = valid_email_or_none(address.email)
        if not email:
            continue
            # ... and non-conflicting ones...
        if app_settings.UNIQUE_EMAIL and bloodon.accounts.models.EmailAddress.objects.filter(email__iexact=email).exists():
            continue
        a = e2a.get(email.lower())
        if a:
            a.primary = a.primary or address.primary
            a.verified = a.verified or address.verified
        else:
            a = address
            a.verified = a.verified or AccountHelper().is_email_verified(request,
                                                                         a.email)
            e2a[email.lower()] = a
        if a.primary:
            primary_addresses.append(a)
            if a.verified:
                primary_verified_addresses.append(a)
        if a.verified:
            verified_addresses.append(a)
        # Now that we got things sorted out, let's assign a primary
    if primary_verified_addresses:
        primary_address = primary_verified_addresses[0]
    elif verified_addresses:
        # Pick any verified as primary
        primary_address = verified_addresses[0]
    elif primary_addresses:
        # Okay, let's pick primary then, even if unverified
        primary_address = primary_addresses[0]
    elif e2a:
        # Pick the first
        primary_address = e2a.keys()[0]
    else:
        # Empty
        primary_address = None
        # There can only be one primary
    for a in e2a.values():
        a.primary = primary_address.email.lower() == a.email.lower()
    return list(e2a.values()), primary_address


def setup_user_email(request, user, addresses):
    """
    Creates proper EmailAddress for the user that was just signed
    up. Only sets up, doesn't do any other handling such as sending
    out email confirmation mails etc.
    """
    from bloodon.accounts.models import EmailAddress

    assert EmailAddress.objects.filter(user=user).count() == 0
    priority_addresses = []
    # Is there a stashed e-mail?

    from .helper import AccountHelper

    stashed_email = AccountHelper().unstash_verified_email(request)
    if stashed_email:
        priority_addresses.append(EmailAddress(user=user,
                                               email=stashed_email,
                                               primary=True,
                                               verified=True))
    email = user_email(user)
    if email:
        priority_addresses.append(EmailAddress(user=user,
                                               email=email,
                                               primary=True,
                                               verified=False))
    addresses, primary = cleanup_email_addresses(request,
                                                 priority_addresses
                                                 + addresses)
    for a in addresses:
        a.user = user
        a.save()
    if (primary
        and email
        and email.lower() != primary.email.lower()):
        user_email(user, primary.email)
        user.save()
    return primary


def send_email_confirmation(request, user, signup=False):
    """
    E-mail verification mails are sent:
    a) Explicitly: when a user signs up
    b) Implicitly: when a user attempts to log in using an unverified
    e-mail while EMAIL_VERIFICATION is mandatory.

    Especially in case of b), we want to limit the number of mails
    sent (consider a user retrying a few times), which is why there is
    a cooldown period before sending a new mail.
    """
    from bloodon.accounts.models import EmailAddress, EmailConfirmation

    COOLDOWN_PERIOD = timedelta(minutes=3)
    email = user_email(user)
    if email:
        try:
            email_address = EmailAddress.objects.get(user=user,
                                                     email__iexact=email)
            if not email_address.verified:
                send_email = not EmailConfirmation.objects \
                    .filter(sent__gt=now() - COOLDOWN_PERIOD,
                            email_address=email_address) \
                    .exists()
                if send_email:
                    email_address.send_confirmation(request,
                                                    signup=signup)
            else:
                send_email = False
        except EmailAddress.DoesNotExist:
            send_email = True
            email_address = EmailAddress.objects.add_email(request,
                                                           user,
                                                           email,
                                                           signup=signup,
                                                           confirm=True)
            assert email_address
            # At this point, if we were supposed to send an email we have sent it.
        if send_email:
            messages.info(request,
                          _(u"Confirmation e-mail sent to %(email)s") % {"email": email}
            )


def sync_user_email_addresses(user):
    """
    Keep user.email in sync with user.emailadress_set.
    Under some circumstances the user.email may not have ended up as
    an EmailAddress record, e.g. in the case of manually created admin
    users.
    """

    email = user_email(user)
    if email and not bloodon.accounts.models.EmailAddress.objects.filter(user=user,
                                                 email__iexact=email).exists():
        if app_settings.UNIQUE_EMAIL and bloodon.accounts.models.EmailAddress.objects.filter(email__iexact=email).exists():
            # Bail out
            return
        bloodon.accounts.models.EmailAddress.objects.create(user=user,
                                    email=email,
                                    primary=False,
                                    verified=False)


def random_token(extra=None, hash_func=hashlib.sha256):
    if extra is None:
        extra = []
    bits = extra + [str(random.SystemRandom().getrandbits(512))]
    return hash_func("".join(bits).encode('utf-8')).hexdigest()


def pass_through_next_redirect_url(request, url, redirect_field_name):
    assert url.find("?") < 0  # TODO: Handle this case properly
    next_url = get_next_redirect_url(request, redirect_field_name)
    if next_url:
        url = url + '?' + urlencode({redirect_field_name: next_url})
    return url


def get_user_model():
    from bloodon.accounts.models import MyUser
    return MyUser


def get_new_user(request):
    return get_user_model()()


def valid_email_or_none(email):
    ret = None
    try:
        if email:
            validate_email(email)
            if len(email) <= EmailField().max_length:
                ret = email
    except ValidationError:
        pass
    return ret