import datetime
import json
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template.context import RequestContext


def bloodon_render(request, templateName, params = None, *args, **kwargs):
    """
    Replacement for render_to_response that uses RequestContext and sets an
    extra template variable, TEMPLATE_NAME.
    """
    #kwargs['context_instance'] = RequestContext(request)
    return render_to_response(templateName, params, context_instance=RequestContext(request))


def bloodon_renderAsJson(request, data):
    return HttpResponse(json.dumps(data), mimetype="application/json")

