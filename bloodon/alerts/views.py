# Create your views here.
from datetime import datetime, time, timedelta
from itertools import groupby
import json

from django.db.models import Count
from django.http import HttpResponse
from django.template import Context, RequestContext
from django.template.loader import get_template
from django.utils import formats
from django.template.defaultfilters import date as date_tag
from django.shortcuts import render_to_response

from bloodon.alerts.fake import AlertForm
from bloodon.alerts.models import Alert
from bloodon.tools.common import bloodon_render, bloodon_renderAsJson
from bloodon.tools.calendarutils import calendar_events
from bloodon.system.models import Organization, Blood
from bloodon.accounts  import fforms as forms
from bloodon.accounts.social import providers
from bloodon.accounts.social.models import SocialAccount, SocialToken
from compiler.pycodegen import EXCEPT

from .utils import get_view_type, set_lang, search_organization_arround , search_organization_bound


def index(request, **kwargs):
    bloods = Blood.objects.all()
    params = {'bloods': bloods}
    if request.user.is_authenticated():
        params['file'] = 'alert.html'
        try :
            socialaccount = SocialAccount.objects.get (user = request.user)
            registry = providers.registry
            accountClass = registry.by_id(socialaccount.provider).account_class
            account = accountClass(socialaccount)
            params['user_avatar_url'] = account.get_avatar_url ()
            #token = SocialToken.objects.get (account = socialaccount)
            #params['friends'] = account.get_friends_list (token)
            #params['token_'] = '' #token.token
        except SocialAccount.DoesNotExist :
            params['user_avatar_url'] = "/static/img/tw.png"
    else:
        params['form'] = forms.LoginForm(request.POST or None)
        params['register_form'] = forms.UserCreationForm()
    try:
        mapView = request.session['map_view']
        params["map_view"] = mapView
        params["map_zoom"] = request.session['map_zoom']
    except KeyError:
        pass
    try:
        params["map_user"] = request.session['map_user_session']
    except KeyError:
        pass
    #parametres['welcome'] = True if (request.GET['state'] == 'welcome' ) else false
    #return HttpResponse(request.session)
    params.update(calendar_events(request))

    #
    type = get_view_type (request)
    #if type == 'map' :
    params["file_view"] = "home/views/map/map.html"
    #else :
        #alerts = Alert.objects.all().reverse().order_by('date_for')[0:40]
        #params.update({'alertObjects': alerts})
        #params["file_view"] = "views/timeline/alerts.html"
    set_lang (request)
    # get
    bloods_out_ids = []
    try :
         exclude_string = request.GET['exclude']
         if exclude_string :
             bloods_out_ids = exclude_string.split(',')
             bloods_out_ids = map(int, bloods_out_ids)
         request.session['excluded_blood'] = bloods_out_ids
    except :
        try :
            bloods_out_ids = request.session['excluded_blood']
        except :
            pass
    params['excluded_blood'] = bloods_out_ids
    return render_to_response('home/home.html', params, context_instance=RequestContext(request))


def create_alert(request):
    if request.POST:
        alert = AlertForm(request.POST)
        if alert.is_valid():
            if request.user.is_authenticated():
                alert.user = request.user
            # save
            alert.save()
            return HttpResponse(json.dumps({'state': 'success', }), mimetype="application/json")
        else:
            #
            return HttpResponse(json.dumps({'state': 'error', 'message':  alert.errors}), mimetype="application/json")
    return ''


def get_alerts_calendar(request):
    calendar = calendar_events(request)
    return bloodon_render(request, 'home/calendar.html', calendar)


def get_event(request, day, month, year):
    start = datetime.combine(datetime(int(year), int(month), int(day)), time(00, 00))
    end = start + timedelta(1)
    try :
        organizations = request.session['bounded_organizations']
    except :
        organizations = [] #= organizations

    bloods_out_ids = request.session['excluded_blood'] #
    alerts = Alert.objects\
        .values('blood__blood', 'blood')\
        .exclude(blood_id__in=bloods_out_ids)\
        .filter(date_for__gte=start, date_for__lt=end, organization_id__in = organizations)\
        .annotate(count=Count('blood'))\
        .order_by('-count')
    # iterate throw out the choices
    choices = dict(Blood.BLOOD_TYPE)
    data = []
    for item in alerts:
        # get the blood choice name , A+, O+ ...
        bType = choices[item['blood__blood']]
        data.append({'type': bType, 'count': item['count']})
    t = get_template('home/calendar/calendar_tooltip.html')
    html = t.render(Context({'alerts': data}))
    return bloodon_renderAsJson(request, {'html' : html})


def get_event_details(request, day, month, year, page):
    start = datetime.combine(datetime(int(year), int(month), int(day)), time(00, 00))
    end = start + timedelta(1)
    try :
        organizations = request.session['bounded_organizations']
    except :
        organizations = [] #= organizations

    bloods_out_ids = request.session['excluded_blood'] #
    page = int(page)
    alerts = Alert.objects\
            .exclude(blood_id__in=bloods_out_ids)\
            .filter(date_for__gte=start, date_for__lt=end, organization_id__in = organizations)[page: page + 10]
    t = get_template('home/organization/organization_detail.html')
    html = t.render(Context({'alerts': alerts}))
    return bloodon_renderAsJson(request,
                                {
                                 'html': html,
                                 'at' : date_tag(start, "D d M Y").encode('utf-8')
                                 }
                                )


def refresh_map(request):
    # organizations_dictionary_by_ids inside given area
    orgs_by_ids = search_organization_bound (request)
    return send_map_data(request, orgs_by_ids)


def refresh_map_around(request):
    # organizations_dictionary_by_ids inside given circle
    orgs_by_ids = search_organization_arround (request)
    return send_map_data(request, orgs_by_ids)


def send_map_data(request, organizations_dictionary_by_ids):
    # save request
    request.session['map_view'] = request.GET['center']
    request.session['map_zoom'] = request.GET['zoom']
    organizations_ids = organizations_dictionary_by_ids.keys ()
    request.session['bounded_organizations'] = organizations_ids
    if 'excluded_blood' in request.session :
        bloods_out_ids = request.session['excluded_blood']
    else :
       bloods_out_ids = [] #
    # add date filter
    alerts = Alert.objects.exclude(blood_id__in=bloods_out_ids).filter(organization_id__in=organizations_ids)
    """\
        .values('organization__id', 'organization__name', 'organization__latitude', 'organization__longitude')\
        .annotate(count=Count('organization__id'))\
        .order_by('-count')
    """
    calendar = {}
    result = organizations_dictionary_by_ids
    for item in alerts :
        organization = item.organization
        id = organization.id
        day = item.date_for.strftime("%d-%m-%Y")

        if not 'count' in result[id]:
            result[id]['count'] = 0

        result[id]["count"] += 1
        if not day in  calendar :
            calendar[day] = 0
        calendar[day] += 1

    # build a dictionary of organization
    # loop throw out alerts
    #
    # return two dictionary
    """
    alerts = Alert.objects.filter(date_for__gte=start, date_for__lte=end)
    field = lambda alert: str(alert.date_for.day) + '_' + str(alert.date_for.month)
    alerts_ = dict(
            [(day, list(items)) for day, items in groupby(alerts, field)]
        )
    return null
    """
    return bloodon_renderAsJson(request, {'html': result , 'calendar' : calendar })


def get_place_details(request, id, page):
    if 'excluded_blood' in request.session :
        bloods_out_ids = request.session['excluded_blood']
    else :
       bloods_out_ids = [] #
    """
        search get the details of the current
    """
    alerts = Alert.objects\
            .exclude(blood_id__in=bloods_out_ids).filter(organization__id__iexact=id)[int(page):int(page) + 10]
    t = get_template('home/organization/organization_detail.html')
    html = t.render(Context({'alerts': alerts}))
    return bloodon_renderAsJson(request, {'html': html})


def get_place_info(request, id):
    """
        search get the details of the curr ent
    """
    if 'excluded_blood' in request.session :
        bloods_out_ids = request.session['excluded_blood']
    else :
       bloods_out_ids = [] #
    alerts = Alert.objects\
        .values('blood__blood', 'blood')\
        .exclude(blood_id__in=bloods_out_ids)\
        .filter(organization__id__iexact=id)\
        .annotate(count=Count('blood'))\
        .order_by('-count')
    # iterate throw out the choices
    choices = dict(Blood.BLOOD_TYPE)
    data = []
    for item in alerts:
        # get the blood choice name , A+, O+ ...
        bType = choices[item['blood__blood']]
        data.append({'type': bType, 'count': item['count']})

    t = get_template('home/organization/organization_popup.html')
    html = t.render(Context({'alerts': data}))
    return bloodon_renderAsJson(request, {'html' : html})

