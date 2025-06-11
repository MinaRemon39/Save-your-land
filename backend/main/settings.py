from pathlib import Path
import os
import certifi


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-4d0k-0(^8ut00=gb)z$e_(aiu$)3j7a@7@#d@vq51)_*%v%7mp'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

AUTH_USER_MODEL='api.CustomUser'
SITE_ID = 1

# Application definition
# REST_FRAMEWORK={
#     'DEFAULT_AUTHENTICATION_CLASSES':
#         ['rest_framework.authentication.BasicAuthentication'],
#     'DEFAULT_PERMISSION_CLASSES':
#         ['rest_framework.permissions.IsAuthenticated'],
#  }


LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*','password1*', 'password2*']
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']


INSTALLED_APPS = [
    'django_extensions',
    'api',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.sites',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.staticfiles',
    'django.contrib.messages',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.linkedin_oauth2',
    'allauth.socialaccount.providers.twitter',
    'allauth.socialaccount.providers.google',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    




 
]
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# AUTHENTICATION_BACKENDS = [
#     'django.contrib.auth.backends.ModelBackend',
#     'social_core.backends.facebook.FacebookOAuth2',
#     'social_core.backends.linkedin.LinkedinOAuth2',
#     'social_core.backends.google.GoogleOAuth2',
#     'social_core.backends.twitter.TwitterOAuth',
#     'social_django.context_processors.backends',
#     'social_django.context_processors.login_redirect',
# ]
 

# SOCIAL_AUTH_FACEBOOK_KEY	=	 '1351995859506745' 	# Facebook App	ID
# SOCIAL_AUTH_FACEBOOK_SECRET	=	'41928afac0618da5c7235f89926dd5d1'	# Facebook App Secret
# SOCIAL_AUTH_FACEBOOK_REDIRECT_URI = 'http://localhost:8000/social-auth/complete/facebook/'



# SOCIAL_AUTH_TWITTER_KEY = 'kycNUnH01FsbKIVqEHCspno0G'
# SOCIAL_AUTH_TWITTER_SECRET = 'UyWt8wQqOIFznK5HQjiQRmnITPBfqWX0uBp0zWW412uhrgRqhl-22SHg0bUtq'
# SOCIAL_AUTH_TWITTER_REDIRECT_URI = 'http://127.0.0.1:8000/complete/twitter/'


# SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '102442914261-phvst7sj0ii4gq24rljqn7dg3hbqau3j.apps.googleusercontent.com'
# SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = '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'
# SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI = 'http://127.0.0.1:8000/social-auth/complete/google-oauth2/'



# SOCIAL_AUTH_LINKEDIN_OAUTH2_KEY = '770o9rebiiks9q'    #Client ID
# SOCIAL_AUTH_LINKEDIN_OAUTH2_SECRET = 'WPL_AP1.p5dwVy4WpQdZUZJd.PuQBAg=='  #Client Secret
# SOCIAL_AUTH_LINKEDIN_OAUTH2_SCOPE = ['openid', 'profile', 'email', 'r_emailaddress']
# SOCIAL_AUTH_LINKEDIN_OAUTH2_REDIRECT_URI = 'http://127.0.0.1:8000/social-auth/complete/linkedin-oauth2/'


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'social_django.middleware.SocialAuthExceptionMiddleware',  # <-- Here
    'allauth.account.middleware.AccountMiddleware',


]

ROOT_URLCONF = 'main.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                # 'social_django.context_processors.backends',
                # 'social_django.context_processors.login_redirect',
            ],
        },
    },
]

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
    # 'social_core.backends.google.GoogleOAuth2',

)

SOCIALACCOUNT_PROVIDERS = {
    # 'linkedin_oauth2': {
    #     'SCOPE': [
    #         'r_liteprofile',
    #         'r_emailaddress',
    #     ],
    #     'PROFILE_FIELDS': [
    #         'id',
    #         'firstName',
    #         'lastName',
    #         'emailAddress',
    #     ],
    # }
        'google':{
             'SCOPE': [
                 'profile',
                 'email',
        ],
             'AUTH_PARAMS': {
                    'access_type': 'online',
        }
        }
            
}
#SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI = 'http://localhost:8000/accounts/linkedin/login/callback/'




# SOCIALACCOUNT_PROVIDERS = {  
#     'google': {  
#         'APP': {  
#             'client_id': '102442914261-phvst7sj0ii4gq24rljqn7dg3hbqau3j.apps.googleusercontent.com',  
#             'secret': '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',  
#             'key': ''  
#         }  
#     },  
#     'facebook': {  
#         'APP': {  
#             'client_id': '1351995859506745',  
#             'secret': '41928afac0618da5c7235f89926dd5d1',  
#             'key': ''  
#         }  
#     }
#     ,  
#     'twitter': {  
#         'APP': {  
#             'consumer_key': 'kycNUnH01FsbKIVqEHCspno0G',  
#             'secret': '5HsvWpXITU3AtcV7NHDViege2MeOCmymjpzVg9SUG7kcy1n67R',  
#             'key': ''  
#         }  
#     },  
#     'linkedin': {  
#         'APP': {  
#             'client_id': '770o9rebiiks9q',  
#             'secret': 'WPL_AP1.p5dwVy4WpQdZUZJd.PuQBAg==',  
#             'key': ''  
#         }    
# }
# } 



WSGI_APPLICATION = 'main.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'defaultdb',  
        'USER': 'avnadmin',         
        'PASSWORD': 'AVNS_VUjKvYTpHnw8gx1nVyv',     
        'HOST': 'union-team2000-ai-c1c7.l.aivencloud.com',        
        'PORT': '13148',             
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/


STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR,  'staticfiles')
STATICFILES_DIRS = (os.path.join(BASE_DIR, 'static'), )

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


#os.environ['SSL_CERT_FILE'] = certifi.where()

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER="rogenayousryadel12345@gmail.com"
EMAIL_HOST_PASSWORD="ebhzolvjgywtubrr"

import os

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # React
]
CORS_ALLOW_CREDENTIALS = True

GOOGLE_API_KEY ="AIzaSyCLQb4Rsp1D6BCW6DI8f_e1xo-y3jTiF4A"

STRIPE_SECRET_KEY = 'sk_test_51RXRENQN84BybSyKNwUzIhVGNtIZPvd6TLgOq15zC9xo4e4GyBN5e7nTeSn6jhZu8MY7wptPNgfRqlKXt8fyaKoE00VriRERhR'  
STRIPE_PUBLISHABLE_KEY = 'pk_test_51RXRENQN84BybSyKaaQVSPflizT1tCFwhrdDpAZEnpyUXpgyz9DHU7ZNvlT4K0lNCsBiZyJqrtpCDcG6OmZ3E8n300W0bxrz1X'

