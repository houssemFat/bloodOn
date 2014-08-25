# -*- coding: utf-8 -*- 
from bloodon.alerts.utils import search_organization_arround
from bloodon.alerts.models import Alert
from bloodon.tools.common import bloodon_renderAsJson
from django.core import serializers
from lib2to3.pgen2.tokenize import String


# display the help for user
def index(request):
    organizations_dictionary_by_ids = search_organization_arround (request)
    ids = organizations_dictionary_by_ids.keys ()
    alerts = Alert.objects.filter(organization_id__in=ids).reverse().order_by('date_for')[0:20]
    list = [] #
    for alert in alerts: #populate list
        list.append({'id':alert.id,
                      'blood': alert.blood.get_blood_display() ,
                      'organization': alert.organization.name,
                      'date'  :  alert.date_for.strftime('%m/%d/%Y')  })
    #recipe_list_json =  #dump list as JSON
    #return HttpResponse(json.dumps(list), 'application/javascript')
    #data  = serializers.serialize('json', alerts, use_natural_foreign_keys =True, fields=('blood','organization'))
    return bloodon_renderAsJson (request, list)