from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
  url(r'^api/', include('drftest.apps.crud.urls'))
)

