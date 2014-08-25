from django.conf.urls import patterns, url, include
from bloodon.accounts import views
from django.utils import importlib

urlpatterns = patterns('',
                       # user is out
                       url(r'^login/$', views.login, name="account_login"),
                       url(r'^register/$', views.register, name='account_signup'),
                       url(r"^confirm_email/(?P<key>\w+)/$", views.confirm_email, name="account_confirm_email"),
                       #(r'^email-sent/$', TemplateView.as_view (template_name="accounts/messages/email_sent.html")),
                       # user is logged in
                       url(r'^profile/$', views.profile, name="user_profile"),
                       (r'^logout/$', views.logout_user),
                       url(r'^profile/place/', views.update_place),

                       url(r'^profile/setlang/', views.update_lang, name="account_profile_setlang"),
                       url(r'^profile/blood/(?P<id>.*)', views.update_bload),
                       url(r'^profile/name/(?P<name>.*)', views.update_display_name),
                       url(r'^profile/phone/$', views.change_phone_number),

                       #passsword
                       url(r'^password/set/$', views.change_password, name='account_change_password'),


                        # password reset
                        url(r"^password/reset/$", views.password_reset, name="account_reset_password"),
                        url(r"^password/reset/done/$", views.password_reset_done, name="account_reset_password_done"),
                        url(r"^password/reset/key/(?P<uidb36>[0-9A-Za-z]+)-(?P<key>.+)/$", views.password_reset_from_key, name="account_reset_password_from_key"),
                        url(r"^password/reset/key/done/$", views.password_reset_from_key_done, name="account_reset_password_from_key_done"),

                       # social
                       url(r'^missing-email/$', 'bloodon.accounts.views.require_email', name='require_email'),
                       (r'^error-login/$', views.error),
                       #social
                       url(r'^social/', include('bloodon.accounts.social.urls')),
)


from .social import providers

for provider in providers.registry.get_list():
    #try:
    prov_mod = importlib.import_module(provider.package + '.urls')
    #except ImportError:
        #continue
    prov_urlpatterns = getattr(prov_mod, 'urlpatterns', None)
    if prov_urlpatterns:
        urlpatterns += prov_urlpatterns
