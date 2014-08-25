from datetime import datetime, date
from time import timezone
from django.db import models
from bloodon.system.models import Organization, Blood
from bloodon.accounts.models import MyUser

class Alert(models.Model):
    text = models.CharField(max_length=200, blank=True)
    user = models.ForeignKey(MyUser, blank=True, null=True)
    organization = models.ForeignKey(Organization)
    blood = models.ForeignKey(Blood)
    date_creation = models.DateTimeField('creation date', default=datetime.now())
    date_for = models.DateTimeField('need for')
    contact = models.CharField(max_length=20)
    # ...
    def get_recently(self):
        return self.date_alert >= timezone.now() - datetime.timedelta(days=1)
