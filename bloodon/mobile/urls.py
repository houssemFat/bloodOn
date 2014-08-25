from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls import patterns, url
from . import views

urlpatterns = patterns('',
                       url(r'^$', views.index, name='get_mobile_json_data'),
                       )
urlpatterns += staticfiles_urlpatterns()