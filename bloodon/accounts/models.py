import datetime
from django.utils.translation import get_language
from django.db import models, IntegrityError, transaction

# create profile
from bbeta.bloodon.system.models import Blood
from . import utils
from django.db.models.signals import post_save
from django.contrib.auth.models import *
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from django.core.urlresolvers import reverse
from datetime import timedelta

from django.db.models import Q
from .utils import random_token


class MyUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(email=MyUserManager.normalize_email(email), username=username)

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(username, email, password=password)
        user.is_admin = True
        user.is_active = True
        #user.is_superuser = True
        user.save(using=self._db)
        return user

class MyUser(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
        db_index=True,
    )
    username = models.CharField(max_length=35, blank=False)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def get_full_name(self):
        # The user is identified by their email address
        return self.email

    def get_short_name(self):
        # The user is identified by their email address
        return self.email

    def __unicode__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin

class UserProfile(models.Model):
    address_latitude = models.FloatField(blank=True, null=True)
    address_longitude = models.FloatField(blank=True, null=True)
    can_donate = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)
    user = models.OneToOneField(MyUser, primary_key=True)
    blood = models.ForeignKey(Blood)
    lang = models.CharField(max_length=3, default=True, blank=True)


class EmailAddressManager(models.Manager):
    def add_email(self, request, user, email, **kwargs):
        confirm = kwargs.pop("confirm", False)
        signup = kwargs.pop("signup", False)
        try:
            email_address = self.create(user=user, email=email, **kwargs)
        except IntegrityError:
            return None
        else:
            if confirm and not email_address.verified:
                email_address.send_confirmation(request,
                                                signup=signup)
            return email_address

    def get_primary(self, user):
        try:
            return self.get(user=user, primary=True)
        except self.model.DoesNotExist:
            return None

    def get_users_for(self, email):
        # this is a list rather than a generator because we probably want to
        # do a len() on it right away
        return [address.user for address in self.filter(verified=True,
                                                        email=email)]


class EmailConfirmationManager(models.Manager):
    def all_expired(self):
        return self.filter(self.expired_q())

    def all_valid(self):
        return self.exclude(self.expired_q())

    def expired_q(self):
        sent_threshold = timezone.now() \
                         - timedelta(days=3)
        return Q(sent__lt=sent_threshold)

    def delete_expired_confirmations(self):
        self.all_expired().delete()


class EmailAddress(models.Model):
    user = models.ForeignKey(MyUser)
    email = models.EmailField(unique=True)
    verified = models.BooleanField(default=False)
    primary = models.BooleanField(default=False)

    objects = EmailAddressManager()

    class Meta:
        verbose_name = _("email address")
        verbose_name_plural = _("email addresses")

    def __str__(self):
        return u"%s (%s)" % (self.email, self.user)

    def set_as_primary(self, conditional=False):
        old_primary = EmailAddress.objects.get_primary(self.user)
        if old_primary:
            if conditional:
                return False
            old_primary.primary = False
            old_primary.save()
        self.primary = True
        self.save()
        utils.user_email(self.user, self.email)
        #B$P
        self.user.save()
        return True

    def send_confirmation(self, request, signup=False):
        confirmation = EmailConfirmation.create(self)
        confirmation.send(request, signup=signup)
        return confirmation

    def change(self, request, new_email, confirm=True):
        """
        Given a new email address, change self and re-confirm.
        """
        with transaction.commit_on_success():
            utils.user_email(self.user, new_email)
            #B$P
            self.user.save()
            self.email = new_email
            self.verified = False
            self.save()
            if confirm:
                self.send_confirmation(request)


class EmailConfirmation(models.Model):
    email_address = models.ForeignKey(EmailAddress)
    created = models.DateTimeField(default=timezone.now)
    sent = models.DateTimeField(null=True)
    key = models.CharField(max_length=64, unique=True)

    objects = EmailConfirmationManager()

    class Meta:
        verbose_name = _("email confirmation")
        verbose_name_plural = _("email confirmations")

    def __str__(self):
        return u"confirmation for %s" % self.email_address

    @classmethod
    def create(cls, email_address):
        key = random_token([email_address.email])
        return cls._default_manager.create(email_address=email_address, key=key)

    def key_expired(self):
        expiration_date = self.sent + datetime.timedelta(days=3)
        return expiration_date <= timezone.now()

    key_expired.boolean = True

    def confirm(self, request):
        if not self.key_expired() and not self.email_address.verified:
            email_address = self.email_address
            email_address.verified = True
            email_address.set_as_primary(conditional=True)
            email_address.save()
            return email_address

    def send(self, request, signup=False, **kwargs):
        #current_site = kwargs["site"] if "site" in kwargs else Site.objects.get_current()
        activate_url = reverse("account_confirm_email", args=[self.key])
        activate_url = request.build_absolute_uri(activate_url)
        ctx = {
            "user": self.email_address.user,
            "activate_url": activate_url,
            #"current_site": current_site,
            "key": self.key,
        }
        if signup:
            email_template = 'account/email/email_confirmation_signup'
        else:
            email_template = 'account/email/email_confirmation'
        from .helper import AccountHelper

        AccountHelper().send_mail(email_template,
                                  self.email_address.email,
                                  ctx)
        self.sent = timezone.now()
        self.save()


MyUser.backend = 'django.contrib.auth.backends.ModelBackend'


def my_callback(sender, instance, created, raw, using, **kwargs):
    if created:
        defaultBloodType = Blood.objects.get(blood='0')
        lang = get_language()
        profile = UserProfile.objects.create(user=instance, blood=defaultBloodType, lang=lang)
        profile.save()


post_save.connect(my_callback, sender=MyUser)
