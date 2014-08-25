import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Django settings for bloodon project.

AUTH_USER_MODEL = 'accounts.MyUser'
USERNAME_FIELD = 'email'

# DEVELOPPEMET
DEBUG = False
TEMPLATE_DEBUG = DEBUG
PROJECT_NAME = 'bloodOn'

# -- email test
#EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'


#admins
ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

#
MANAGERS = ADMINS
ANONYMOUS_USER_ID = 'ANONYMOUS'
#
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'dbname',
        'USER': 'dbusername',
        'PASSWORD': 'dbpassword',
        'HOST': 'mysql.server',
        'PORT': '',
        'OPTIONS': {'init_command': 'SET storage_engine=INNODB,character_set_connection=utf8,collation_connection=utf8_unicode_ci' },
    }
}

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts

ALLOWED_HOSTS = [
    
    #'.example.com.',  Also allow FQDN and subdomains
]

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'
USE_TZ = False
DATE_INPUT_FORMATS = ('D d M Y','%d-%m-%Y','%Y-%m-%d')
SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-ar'

# If you set this to False, Django will not use timezone-aware datetimes.

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = 'path-to-source-folder/bloodon/media/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(BASE_DIR, "static"),
    'path-to-source-folder/bloodon/static',
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '#%6-mi@=gs+1iy%-3g3!#wpc)7jce@sh8#r@#yf-#1i)d3o04+'

PASSWORD_CREATE_SALT = 'password_create_salt'
PASSWORD_RESET_SALT = 'password_reset_salt'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ACCOUNT_EMAIL_UNIQUE = True
ROOT_URLCONF = 'bloodOn.bloodon.urls'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths."
    "path-to-source-folder/bloodon/templates",
    "path-to-source-folder/bloodon/templates/common",
    "path-to-source-folder/bloodon/templates/home",
    "path-to-source-folder/bloodon/templates/accounts",
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs'
    'bloodOn.bloodon',
	'bloodOn.bloodon.accounts',
	'bloodOn.bloodon.accounts.social',
	'bloodOn.bloodon.system',
	'bloodOn.bloodon.alerts',
)
INSTALLED_AOUTH_APPS = (
                        'bloodOn.bloodon.accounts.social.providers.facebook',
                        'bloodOn.bloodon.accounts.social.providers.google',
)
TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "django.core.context_processors.request",
    "bloodon.accounts.social.context_processors.socialaccount",

)
# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

EMAIL_USE_TLS = True
#DEFAULT_FROM_EMAIL = ''
#EMAIL_HOST = ''
#EMAIL_HOST_USER = ''
#EMAIL_HOST_PASSWORD = ''
#EMAIL_PORT = 587


# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'bloodon.wsgi.application'
LOGIN_ERROR_URL = '/accounts/error-login/'
SITE_PATH = 'your site path'
SITE_DOMAIN = ''

PROVIDERS = {
    'facebook': {'key': 'facebook-key',  'secret': 'fb-secret-key'},
    'google': {'key': 'google-key',  'secret': 'google-secret-key'}}
from bloodon.local_settings import *
