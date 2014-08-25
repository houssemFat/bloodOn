from django.conf.urls import patterns, include, url
from django.conf import settings
# Uncomment the next two lines to enable the admin:
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
                       #home
                       url(r'^$', include('bloodon.alerts.urls')),
                       # home
                       url(r'^home/', include('bloodon.alerts.urls')),
                       # error
                       url(r'^create/', 'bloodon.alerts.views.create_alert', name='create_alert'),
                       # users
                       url(r'^accounts/', include('bloodon.accounts.urls')),
                       #url(r'^social/', include('social.apps.django_app.urls',
                       # namespace='social')),
                       # system
                       #url(r'^help/', include('bloodi.system.urls')),
                       # system
                       url(r'^error/', include('bloodon.system.urls')),
                       url(r'^system/', include('bloodon.system.urls')),
                       url(r'^public/', include('bloodon.system.urls')),
                       ## mobile client 
                       url(r'^mclient/', include('bloodon.mobile.urls')),
                       
                       # Uncomment the admin/doc line below to enable admin documentation:
                       # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

                       # administration
                       url(r'^admin/', include(admin.site.urls)),

                       (r'^i18n/', include('django.conf.urls.i18n')),
                       # static files
                       url(r'^static/(?P<path>.*)$', 'django.views.static.serve',
                           {'document_root': settings.STATIC_ROOT}),
                       # system
)
#
#urlpatterns += staticfiles_urlpatterns()