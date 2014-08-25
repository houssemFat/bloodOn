from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.utils.http import int_to_base36
from django.conf import settings
from django import forms
from django.utils.translation import ugettext_lazy as _

from bloodon.accounts.models import MyUser
from .utils import setup_user_email, perform_login
from . import app_settings

attrs_dict = {'class': 'required'}
attrs_ltr = {'class': 'required input-ltr'}


class PasswordField(forms.CharField):

    def __init__(self, *args, **kwargs):
        render_value = kwargs.pop('render_value',
                                  app_settings.PASSWORD_INPUT_RENDER_VALUE)
        kwargs['widget'] = forms.PasswordInput(render_value=render_value,
                                               attrs={'placeholder':
                                                      _('Password')})
        super(PasswordField, self).__init__(*args, **kwargs)


class SetPasswordField(PasswordField):

    def clean(self, value):
        value = super(SetPasswordField, self).clean(value)
        min_length = app_settings.PASSWORD_MIN_LENGTH
        if len(value) < min_length:
            raise forms.ValidationError(_("Password must be a minimum of {0} "
                                          "characters.").format(min_length))
        return value


#login user
class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.TextInput(attrs={'placeholder': _('E-mail address'), 'class': 'form-control'}), required=True)
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': _('Password'), 'autocomplete': 'off'}, render_value=False),
        required=True)
    remember = forms.BooleanField(label=_("Remember Me"),
                                  required=False)

    user = None

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)

    def user_credentials(self):
        credentials = {}
        credentials["email"] = self.cleaned_data["email"]
        credentials["password"] = self.cleaned_data["password"]
        return credentials

    def clean(self):
        if self._errors:
            return
        user = authenticate(**self.user_credentials())
        if user:
            self.user = user
        else:
            error = _("The login and/or password you specified are not correct.")
            raise forms.ValidationError(error)
        return self.cleaned_data

    def login(self, request, redirect_url=None):
        ret = perform_login(request, self.user,
                            email_verification=app_settings.EMAIL_VERIFICATION,
                            redirect_url=redirect_url)
        if self.cleaned_data["remember"]:
            request.session.set_expiry(60 * 60 * 24 * 7 * 3)
        else:
            request.session.set_expiry(0)
        return ret


# create a new user
class UserCreationForm(forms.Form):
    username = forms.CharField(label=_("Username"),
                               max_length=35,
                               widget=forms.TextInput(
                                   attrs={'placeholder': _('Username'), 'autocomplete': 'off', 'direction': 'rtl'}))
    email = forms.EmailField(
        widget=forms.TextInput(attrs={'placeholder': _('E-mail address'), 'class': 'form-control'}), required=True)
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': _('Password'), 'autocomplete': 'off'}, render_value=False),
        required=True)
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': _("Password (again)")}, render_value=False), required=True)

    error_messages = {
        'duplicate_email': _("A user with that email already exists."),
        'password_mismatch': _("The two password fields didn't match."),
    }

    class Meta:
        model = MyUser
        fields = ("username", "email")

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if username:
            return username
        raise forms.ValidationError(_("Empty Username."))

    def clean_email(self):
        email = self.cleaned_data.get("email")
        try:
            MyUser.objects.get(email=email)
        except MyUser.DoesNotExist:
            return email
        raise forms.ValidationError(self.error_messages['duplicate_email'])

    def clean(self):
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_('password_matching'))
        return self.cleaned_data

    def save(self, request):
        user = MyUser()
        from .helper import AccountHelper

        AccountHelper().save_user(request, user, self)
        # TODO: Add request?
        #super(UserCreationForm, self).save(user)
        # TODO: Move into adapter `save_user` ?
        setup_user_email(request, user, [])
        return user


# missing email @ for provider
class MissedProviderEmailForm(forms.Form):
    email = forms.EmailField(widget=forms.TextInput(attrs=dict(attrs_ltr, maxlength=75)))

    def clean(self):
        # Note that because this is the form-wide clean() method, any
        # validation errors raised here will not be tied to a particular field.
        # Instead, use form.non_field_errors() in the template.
        email = self.cleaned_data.get('email')
        # Check that both email and password were valid. If they're not valid,
        # there's no need to run the following bit of validation.
        if email:
            try:
                user = MyUser.objects.get(email=email)
                self.user = user
            except MyUser.DoesNotExist:
                raise forms.ValidationError("email does not exist")
        return self.cleaned_data



# change Password Form
class PasswordChangeForm(forms.Form):
    oldpassword = forms.CharField(widget=forms.PasswordInput(attrs=attrs_ltr, render_value=False))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs=attrs_ltr, render_value=False))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs=attrs_ltr, render_value=False))

    def __init__(self, user=None, *args, **kwargs):
        super(PasswordChangeForm, self).__init__(*args, **kwargs)
        self._user = user

    def clean(self):
        user = self._user
        if not user.check_password(self.cleaned_data.get('oldpassword')):
            raise forms.ValidationError(_('incorrect password'))
        elif 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_('passwords are not the same'))
        return self.cleaned_data


# reset form pass
class ResetPasswordForm(forms.Form):

    email = forms.EmailField(label=_("E-mail"),
                             required=True,
                             widget=forms.TextInput(attrs={"size": "30"}))

    def clean_email(self):
        email = self.cleaned_data["email"]
        email = get_helper()().clean_email(email)
        self.users = MyUser.objects \
            .filter(Q(email__iexact=email)
                    | Q(emailaddress__email__iexact=email)).distinct()
        if not self.users.exists():
            raise forms.ValidationError(_("The e-mail address is not assigned"
                                          " to any user account"))
        return self.cleaned_data["email"]

    def save(self, **kwargs):

        email = self.cleaned_data["email"]
        token_generator = kwargs.get("token_generator",
                                     default_token_generator)

        for user in self.users:

            temp_key = token_generator.make_token(user)

            # save it to the password reset model
            # password_reset = PasswordReset(user=user, temp_key=temp_key)
            # password_reset.save()

            # send the password reset email
            path = reverse("account_reset_password_from_key",
                           kwargs=dict(uidb36=int_to_base36(user.id),
                                       key=temp_key))
            url = 'http://%s%s' % (settings.SITE_PATH,
                                   path)
            context = {"user": user,
                       "password_reset_url": url}
            get_helper()().send_mail('accounts/account/email/password_reset_key', email, context)
        return self.cleaned_data["email"]


#
class ResetPasswordKeyForm(forms.Form):

    password1 = SetPasswordField(label=_("New Password"))
    password2 = PasswordField(label=_("New Password (again)"))

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop("user", None)
        self.temp_key = kwargs.pop("temp_key", None)
        super(ResetPasswordKeyForm, self).__init__(*args, **kwargs)

    # FIXME: Inspecting other fields -> should be put in def clean(self) ?
    def clean_password2(self):
        if ("password1" in self.cleaned_data
                and "password2" in self.cleaned_data):
            if (self.cleaned_data["password1"]
                    != self.cleaned_data["password2"]):
                raise forms.ValidationError(_("You must type the same"
                                              " password each time."))
        return self.cleaned_data["password2"]

    def save(self):
        # set the new user password
        user = self.user
        user.set_password(self.cleaned_data["password1"])
        user.save()


def get_helper():
    from .helper import AccountHelper
    return AccountHelper