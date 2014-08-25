from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls import patterns, url
from bloodon.alerts import views

urlpatterns = patterns('',
                       url(r'^$', views.index, name='index'),
                       url(r'^map/refresh/$', views.refresh_map),
                       url(r'^map/refresh/around/$', views.refresh_map_around),
                       url(r'^calendar/$', views.get_alerts_calendar),
                       url(r'^calendar/event/show/(?P<day>\d+)/(?P<month>\d{1,2})/(?P<year>\d{4})/$', views.get_event),
                       url(r'^calendar/event/details/(?P<day>\d+)/'
                           r'(?P<month>\d{1,2})/(?P<year>\d{4})/(?P<page>\d+)/$', views.get_event_details),
                       url(r'^place/details/(?P<id>\d+)/(?P<page>\d+)/$', views.get_place_details),
                       url(r'^place/infos/(?P<id>\d+)/$', views.get_place_info),
                       url(r'^view/(?P<id>\d+)/$', views.get_place_info),

                       )
urlpatterns += staticfiles_urlpatterns()
