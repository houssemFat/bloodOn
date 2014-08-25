from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls import patterns, url
from bloodon.system import views

urlpatterns = patterns('',
                       url(r'^search/medical/$', views.search_organizations, name='search_medical'),
                       url(r'^contact/$', views.contact_us, name='contact_us'),
                       url(r'^help/$', views.help, name='contact_us'),
                       url(r'^share/send-mail/$', views.send_via_mail_to),
                       # error
                       url(r'^show/(?P<id>\d+)/$', views.show , name='public_show_alert'),
                       
                       )
urlpatterns += staticfiles_urlpatterns()