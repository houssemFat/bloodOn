import json
from django import http
from django.core.urlresolvers import reverse, reverse_lazy
from django.utils.http import base36_to_int
from django.views.decorators.csrf import csrf_protect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib import messages
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.utils.html import strip_tags
from django.utils  import translation #get_language_from_request, activate
from django.shortcuts import redirect, get_object_or_404
from django.views.generic.edit import FormView
from django.views.generic.base import TemplateResponseMixin, View, TemplateView
from bloodon.accounts.models import EmailConfirmation, MyUser
from django.contrib.auth.tokens import default_token_generator
from . import utils
from . import app_settings
from . import fforms as forms
from bloodon.system.models import  Blood


###########################
# VIEWS FOR USER ACCOUNTS #
###########################
from bloodon.tools.common import bloodon_render

@login_required
def profile(request, initial_email=None):
    custom_message = request.session.get('login_message')
    if 'login_message' in request.session:
        del request.session['login_message']
    if not request.user.is_authenticated():
        params = {'form': forms.LoginForm(request.POST, initial={'email': initial_email}),
                  'register_form': forms.RegistrationForm(), 'active': 'login'}
        return bloodon_render(request, 'accounts/register.html', params)
        # else :
        # if not request.user.is_active :
        # return bloodon_render(request, 'accounts/non_active_account.html')
        # else :
    bloodType = "all"
    try:
        bloodType = request.user.userprofile.blood.id
    except Blood.DoesNotExist:
	pass
    bloods = Blood.objects.all()
    params = {'bloods': bloods, 'myBlood' : bloodType}

    return bloodon_render(request, 'accounts/profile.html', params)


# update coordinates place of user
@login_required
def update_place(request):
    if request.user.is_authenticated():
        profile = request.user.userprofile
        profile.address_latitude = request.GET['lat']
        profile.address_longitude = request.GET['lng']
        profile.save()
        return HttpResponse(json.dumps({'success': 'true'}), mimetype="application/json")
    else:
        return HttpResponse(json.dumps({'error': 'true'}), mimetype="application/json")


# update coordinates place of user

@login_required
def update_lang(request):
    if request.user.is_authenticated():
        profile = request.user.userprofile
        lang_code =  request.POST['language']
        profile.lang = lang_code
        profile.save()
 	if lang_code and translation.check_for_language(lang_code):
            if hasattr(request, 'session'):
                request.session['django_language'] = lang_code


            else:
                response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang_code)
    	return HttpResponseRedirect ("/accounts/profile")
    return HttpResponseRedirect ("/")


# update blood type ( ready for donate )
@login_required
def update_bload(request, id):
    if request.user.is_authenticated():
        profile = request.user.userprofile
       	profile.blood = Blood.objects.get(id__iexact=int(id))

        profile.save()
        return HttpResponse(json.dumps({'success': 'true'}), mimetype="application/json")
    else:
        return HttpResponse(json.dumps({'error': 'true', }), mimetype="application/json")


@login_required
def update_display_name(request, name):
    user = request.user
    if user.is_authenticated():
        #profile = request.user.get_profile ()
        user.username = strip_tags(name)
        user.save()
        return HttpResponse(json.dumps({'success': name}), mimetype="application/json")
    else:
        return HttpResponse(json.dumps({'error': 'true', }), mimetype="application/json")


@login_required
def change_phone_number(request):
    if request.user.is_authenticated():
        profile = request.user.userprofile
        try:
            phone = request.GET['value']
            if len(phone) == 8 and phone.isdigit():
                profile.phone = phone
                profile.save()
                return HttpResponse(json.dumps({'success': True}), mimetype="application/json")
            else:
                pass
        except ValueError:
            pass
    else:
        return HttpResponse(json.dumps({'error': 'true'}), mimetype="application/json")


########################
# REGISTRATION PROCESS #
########################

# We want to avoid creating a database record until an e-mail address has been
# verified, so we use a hash of the e-mail address for security.


class RedirectAuthenticatedUserMixin(object):
    def dispatch(self, request, *args, **kwargs):
        # WORKAROUND: https://code.djangoproject.com/ticket/19316
        self.request = request
        # (end WORKAROUND)
        if request.user.is_authenticated():
            return HttpResponseRedirect(self.get_authenticated_redirect_url())
        return super(RedirectAuthenticatedUserMixin, self).dispatch(request,
                                                                    *args,
                                                                    **kwargs)

    def get_authenticated_redirect_url(self):
        redirect_field_name = self.redirect_field_name
        return utils.get_login_redirect_url(self.request,
                                            url=self.get_success_url(),
                                            redirect_field_name=redirect_field_name)


########################
# LOGIN PROCESS #
########################


class LoginView(RedirectAuthenticatedUserMixin, FormView):
    form_class = forms.LoginForm
    template_name = "accounts/account/login.html"
    success_url = "/"
    redirect_field_name = "next"

    def form_valid(self, form):
        success_url = self.get_success_url()
        return form.login(self.request, redirect_url=success_url)

    def get_success_url(self):
        # Explicitly passed ?next= URL takes precedence
        ret = (utils.get_next_redirect_url(self.request,
                                     self.redirect_field_name)
               or self.success_url)
        return ret

    def get_context_data(self, **kwargs):
        ret = super(LoginView, self).get_context_data(**kwargs)
        signup_url = utils.pass_through_next_redirect_url(self.request,
                                                   reverse("account_signup"),
                                                   self.redirect_field_name)
        redirect_field_value = self.request.REQUEST \
            .get(self.redirect_field_name)
        ret.update({"signup_url": signup_url,
                    "redirect_field_name": self.redirect_field_name,
                    "redirect_field_value": redirect_field_value})
        return ret

login = LoginView.as_view()


def logout_user(request):
    next_url = '/'
    logout(request)
    if request.method == 'POST':
        request.session.flush()
        request.user = None

        # The `next_url` can be specified either as POST data or in the
        # session. If it's in the session, it can be trusted. If it's in
        # POST data, it can't be trusted, so we do a simple check that it
        # starts with a slash (so that people can't hack redirects to other
        # sites).
        if 'next_url' in request.POST and request.POST['next_url'].startswith('/'):
            next_url = request.POST['next_url']
        elif 'next_url' in request.session:
            next_url = request.session.pop('next_url')
        else:
            request.session['login_message'] = "You're logged out. You can log in again below."
    return redirect(next_url)


class SignupView(RedirectAuthenticatedUserMixin, FormView):
    template_name = "account/signup.html"
    form_class = forms.UserCreationForm
    redirect_field_name = "next"
    success_url = None

    def get_success_url(self):
        # Explicitly passed ?next= URL takes precedence
        ret = (utils.get_next_redirect_url(self.request,
                                           self.redirect_field_name)
               or self.success_url)
        return ret

    def form_valid(self, form):
        user = form.save(self.request)
        return utils.complete_signup(self.request, user,
                                     app_settings.EMAIL_VERIFICATION,
                                     self.get_success_url())

    def get_context_data(self, **kwargs):
        form = kwargs['form']
        form.fields["email"].initial = self.request.session \
            .get('account_verified_email', None)
        ret = super(SignupView, self).get_context_data(**kwargs)
        login_url = utils.pass_through_next_redirect_url(self.request, reverse("account_login"),
                                                        self.redirect_field_name)
        redirect_field_name = self.redirect_field_name
        redirect_field_value = self.request.REQUEST.get(redirect_field_name)
        ret.update({"login_url": login_url,
                    "redirect_field_name": redirect_field_name,
                    "redirect_field_value": redirect_field_value,
		    
	          })
	if 'socialLoginError' in self.request.session:
		ret.update({"socialLoginError" : self.request.session.get('socialLoginError', False)});
		del self.request.session['socialLoginError']
        return ret


register = SignupView.as_view()


class PasswordResetView(FormView):
    template_name = "account/password_reset.html"
    form_class = forms.ResetPasswordForm
    success_url = reverse_lazy("account_reset_password_done")

    def form_valid(self, form):
        form.save()
        return super(PasswordResetView, self).form_valid(form)

    def get_context_data(self, **kwargs):
        ret = super(PasswordResetView, self).get_context_data(**kwargs)
        # NOTE: For backwards compatibility
        ret['password_reset_form'] = ret.get('form')
        # (end NOTE)
        return ret

password_reset = PasswordResetView.as_view()


class PasswordResetDoneView(TemplateView):
    template_name = "accounts/account/password_reset_done.html"

password_reset_done = PasswordResetDoneView.as_view()


class PasswordResetFromKeyView(FormView):
    template_name = "account/password_reset_from_key.html"
    form_class = forms.ResetPasswordKeyForm
    token_generator = default_token_generator
    success_url = reverse_lazy("account_reset_password_from_key_done")

    def _get_user(self, uidb36):
        # pull out user
        try:
            uid_int = base36_to_int(uidb36)
        except ValueError:
            raise Http404
        return get_object_or_404(MyUser, id=uid_int)

    def dispatch(self, request, uidb36, key, **kwargs):
        self.uidb36 = uidb36
        self.key = key
        self.request.user = self._get_user(uidb36)
        if not self.token_generator.check_token(self.request.user, key):
            return self._response_bad_token(request, uidb36, key, **kwargs)
        else:
            return super(PasswordResetFromKeyView, self).dispatch(request,
                                                                  uidb36,
                                                                  key,
                                                                  **kwargs)

    def get_form_kwargs(self):
        kwargs = super(PasswordResetFromKeyView, self).get_form_kwargs()
        kwargs["user"] = self.request.user
        kwargs["temp_key"] = self.key
        return kwargs

    def form_valid(self, form):
        form.save()
        get_helper()().add_message(self.request,
                                  messages.SUCCESS,
                                  'account/messages/password_changed.txt')
        return super(PasswordResetFromKeyView, self).form_valid(form)

    def _response_bad_token(self, request, uidb36, key, **kwargs):
        return self.render_to_response(self.get_context_data(token_fail=True))

password_reset_from_key = PasswordResetFromKeyView.as_view()


class PasswordResetFromKeyDoneView(TemplateView):
    template_name = "account/password_reset_from_key_done.html"

password_reset_from_key_done = PasswordResetFromKeyDoneView.as_view()


########################
# PASSWORD CHANGE       #
########################


@csrf_protect
def change_password(request):
# If the user is already logged in, redirect to the dashboard.
    if not request.user.is_authenticated():
        return http.HttpResponseRedirect('/accounts/login')

    if request.method == 'POST':
        form = forms.PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            request.user.set_password(form.cleaned_data['password1'])
            utils.set_user_message(request, messages.INFO, 'success', 'change_password_success');
            return http.HttpResponseRedirect('/')
        else:
            initialData = {'form': form}
            csrfContext = RequestContext(request, initialData)
            return bloodon_render(request, 'accounts/account/password_change.html', csrfContext)
    else:
        initialData = {'form': forms.PasswordChangeForm()}
        csrfContext = RequestContext(request, initialData)
        return bloodon_render(request, 'accounts/account/password_change.html', csrfContext)


def error(request, *args, **kwargs):
    return HttpResponse(json.dumps({'error': 'errror'}), mimetype="application/json")


########################
# SOCIAL REQUIRE EMAIL #
########################
@csrf_protect
def require_email(request):
    backend = request.session['partial_pipeline']['backend']
    if request.method == 'POST':
        request.session['saved_email'] = request.POST.get('email')
        return redirect('social:complete', backend=backend)
    user_name = request.session['partial_pipeline']['kwargs']['details']['first_name']
    initialData = {'user_name': user_name, 'backend': backend}
    csrfContext = RequestContext(request, initialData)
    return bloodon_render(request, 'accounts/forms/missing_email.html', csrfContext)


class ConfirmEmailView(TemplateResponseMixin, View):
    def get_template_names(self):
        if self.request.method == 'POST':
            return ["account/email_confirmed.html"]
        else:
            return ["account/email_confirm.html"]

    def get(self, *args, **kwargs):
        try:
            self.object = self.get_object()
        except Http404:
            self.object = None
        ctx = self.get_context_data()
        return self.render_to_response(ctx)

    def post(self, *args, **kwargs):
        self.object = confirmation = self.get_object()
        confirmation.confirm(self.request)
        # Don't -- is_active so that sys admin can
        # use it to block users et al
        #
        # user = confirmation.email_address.user
        # user.is_active = True
        # user.save()
        redirect_url = self.get_redirect_url()
        if not redirect_url:
            ctx = self.get_context_data()
            return self.render_to_response(ctx)
        get_helper()().add_message(self.request,
                                   messages.SUCCESS,
                                   'account/messages/email_confirmed.txt',
                                   {'email': confirmation.email_address.email})
        return redirect(redirect_url)

    def get_object(self, queryset=None):
        if queryset is None:
            queryset = self.get_queryset()
        try:
            return queryset.get(key=self.kwargs["key"].lower())
        except EmailConfirmation.DoesNotExist:
            raise Http404()

    def get_queryset(self):
        qs = EmailConfirmation.objects.all_valid()
        qs = qs.select_related("email_address__user")
        return qs

    def get_context_data(self, **kwargs):
        ctx = kwargs
        ctx["confirmation"] = self.object
        return ctx

    def get_redirect_url(self):
        adapter = get_helper()
        return adapter().get_email_confirmation_redirect_url(self.request)

confirm_email = ConfirmEmailView.as_view()


def get_helper():
    from .helper import AccountHelper
    return AccountHelper
