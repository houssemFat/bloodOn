from datetime import datetime
from django.forms import ModelForm, forms
from django.utils.translation import ugettext_lazy as _
from bloodon.alerts.models import Alert
from bloodon.system.models import Blood, Organization


class AlertForm (ModelForm):
    class Meta:
        model = Alert
        exclude = ['user','date_creation']