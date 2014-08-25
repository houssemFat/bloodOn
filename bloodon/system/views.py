# -*- coding: utf-8 -*- 

# Create your views here.
import json
from django import forms

from django.conf import settings
from django.http import HttpResponse
from django.db.models import Q
from django.template import Context
from django.template.loader import get_template
from django.utils.html import strip_tags
from django.utils.translation import ugettext_lazy as _
from django.core import serializers
from django.views.generic import FormView
from django.core.mail import send_mass_mail
from django.core.urlresolvers import reverse


from bloodon.tools.common import bloodon_render, bloodon_renderAsJson
from bloodon.alerts.models import Alert, Organization, Blood
from bloodon.system.fforms import ContactUsForm


# display the help for user
def help(request):
    return bloodon_render(request, 'common/help.html')


#######################
# search for blood donation organizations
#######################
def search_organizations(request):
    query = strip_tags(request.GET['query'])
    try:
        founds = Organization.objects.filter(Q(name__icontains=query) | Q(key_words__icontains=query))#~Q(id = 3) && 'مستشفى'
        return HttpResponse(json.dumps({'data':  serializers.serialize('json', founds, fields=("name", "key_words")), }), mimetype="application/json")
    except Organization.DoesNotExist:
        return HttpResponse(json.dumps({'data':  '', }), mimetype="application/json")


class ContactUsView(FormView):
    form_class = ContactUsForm
    template_name = "contact.html"
    success_url = "/"
    redirect_field_name = "next"

    def form_valid(self, form):
        message = ''
        try:
            contact = form.save(self.request)
            t = get_template('messages/contact/success.html')
            html = t.render(Context({'user': contact.name}))
            return HttpResponse(json.dumps({'state': 'success', 'message':  html}),
                                mimetype="application/json")
        except BaseException, e:
            return HttpResponse(json.dumps({'state': 'error', 'message': ''}), #'Something get wrong , please try later'}),
                                mimetype="application/json")

contact_us = ContactUsView.as_view()


def show(request, id):
    """
        search get the details of the curr ent
    """
    try:
        alert = Alert.objects.get(id__iexact=int(id))
    except Alert.DoesNotExist:
        return bloodon_render(request, 'public/alert.html', {'object': alert})
    return bloodon_render(request, 'public/alert.html', {'object': alert})



def send_via_mail_to(request):
    """
        send email to list of freinds
    :param request:
        in the square represented by :
        west < longitude < east
        north < latitude < south
    """
    idAlert = int(request.POST['id'])
    emails = request.POST['list']
    text = request.POST['text']
    listMails = emails.rstrip('#').split('#')
    alert = Alert.objects.get(id=idAlert)
    # email
    path = reverse("public_show_alert", args=(idAlert,))
    subject = "BloodOn team team,"
    message = ''
    if len(text):
        message += '%s \n,' % text
    message += 'This message has been sent from <href ="http://%s">BloodOn Inc</href>, ' \
               'Because Some one need blood , the %s, ' \
               'at %s \n ' % (settings.SITE_PATH, alert.date_for, alert.organization.name)
    message += '\n for more detail please refer to : <href ="http://%s%s">BloodOn' \
               'Inc</href> \n' % (settings.SITE_PATH,  path)
    messageMail = (subject, message, settings.DEFAULT_FROM_EMAIL, listMails)
    send_mass_mail((messageMail,), fail_silently=False)
    return bloodon_renderAsJson(request, {'success' : True})