from django.db import models
from django.utils.translation import gettext as _


# the blood model
class Blood (models.Model):
    BLOOD_TYPE = (
        ('0', 'all'),
        ('1', 'A-'),
        ('2', 'A+'),
        ('3', 'B-'),
        ('4', 'B+'),
        ('5', 'AB-'),
        ('6', 'AB+'),
        ('7', 'O-'),
        ('8', 'O+'),
    )
    blood = models.CharField(max_length=3, choices=BLOOD_TYPE)

class Country(models.Model):
    iso_code =  models.CharField(max_length=2, unique=True)
    name =  models.CharField(max_length=50)
    local_name =  models.CharField(max_length=50)
    
    def __unicode__(self):
        return self.name

class State(models.Model):
    country = models.ForeignKey(Country)
    name =  models.CharField(max_length=50)
    
    def __unicode__(self):
        return self.name

class Region(models.Model):
    state = models.ForeignKey(State)
    name = models.CharField(max_length=50)
    
    def __unicode__(self):
        return self.name

 
class Organization(models.Model):
    country = models.ForeignKey(Country)
    state = models.ForeignKey(State, blank=True, null=True)
    region = models.ForeignKey(Region, blank=True, null=True)
    name = models.CharField(max_length=200)
    key_words = models.CharField(max_length=200)
    url = models.CharField(max_length=300, null=True)
    zip_code = models.IntegerField(_('Zip code'), max_length=4, null=True)
    place = models.CharField(_('Address Complement'), max_length=400, null=True)
    latitude = models.FloatField(_('Latitude'), blank=True, null=True)
    longitude = models.FloatField(_('Longitude'), blank=True, null=True)
    
    def __unicode__(self):
        return self.name
    
    def natural_key(self):
        return self.name
    
class Contact(models.Model):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        db_index=True,
    )
    name = models.CharField(max_length=35, blank=False)
    text = models.CharField(max_length=1000, blank=False)

    def __unicode__(self):
       return self.name