from django.conf.urls import patterns, url
import views

urlpatterns = patterns('',
                       url('^login/cancelled/$', views.login_cancelled,
                           name='socialaccount_login_cancelled'),
                       url('^login/error/$', views.login_error, name='socialaccount_login_error'),
                       url('^(?P<provider>.*)/signup/$', views.social_login, name='socialaccount_signup'),
                       url('^(?P<provider>.*)/callback/$', views.social_callback, name='socialaccount_callback'),
                       url('^connections/$', views.connections, name='socialaccount_connections'),
)
