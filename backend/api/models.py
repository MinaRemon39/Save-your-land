from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.core.exceptions import ValidationError
import uuid
from django.core.exceptions import ValidationError
import re
from django.core.validators import RegexValidator
from django.contrib.auth import get_user_model
import os
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('user', 'User'),
        ('publisher', 'Publisher'),
        ('administrator', 'Administrator'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='user')
    phone = models.CharField(max_length=11, blank=True, null=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    article_link = models.URLField(max_length=1000, null=True, blank=True)
    is_approved_publisher = models.BooleanField(default=False)

    def clean(self):
        if self.phone and not re.match(r'^\d{11}$', self.phone):
            raise ValidationError({'phone': 'Phone number must be 11 digits'})
        if self.user_type == 'publisher' and not self.article_link:
            raise ValidationError({'article_link': 'Article link is required for publishers'})

    def save(self, *args, **kwargs):
        self.full_clean()  
        super().save(*args, **kwargs)


class PublisherApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('refused', 'Refused'),
    ]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, null=True, blank=True) 
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=11, blank=True, null=True)
    article_link = models.URLField(max_length=1000)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    is_read = models.BooleanField(default=False) 
    password = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
    




class PasswordReset(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reset_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_when = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset for {self.user.email} at {self.created_when}"
    

phone_validator = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")



class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    profile_pic = models.ImageField(upload_to='profile_pics/', default='profile_pics/user.png')
    phone = models.CharField(max_length=20, blank=True, null=True, validators=[phone_validator])
    bio = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.profile_pic and isinstance(self.profile_pic, str):
            if self.profile_pic.endswith('.png.png'):
                self.profile_pic = self.profile_pic.replace('.png.png', '.png')
        super().save(*args, **kwargs)
    

    @property
    def profile_pic_url(self):
        if self.profile_pic:
            full_path = os.path.join(settings.MEDIA_ROOT, self.profile_pic.name)
            if os.path.exists(full_path):
                return self.profile_pic.url
        return settings.MEDIA_URL + 'profile_pics/user.png'

    def __str__(self):
        return self.user.username
    
    
    
class Article(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='articles/', blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class AdministratorManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(user_type='administrator')

class Administrator(CustomUser):
    objects = AdministratorManager()
    
    class Meta:
        proxy = True
        verbose_name = 'Administrator'
        verbose_name_plural = 'Administrators'
        
    
class Land(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='lands')
    landName = models.CharField(max_length=100)
    plantType = models.CharField(max_length=100)
    soilType = models.CharField(max_length=100, default="Loamy")
    soilPH = models.FloatField()
    soilMoisture = models.FloatField()
    soilAir = models.FloatField()
    soilTemp = models.FloatField()
    organicMatter = models.FloatField()
    ambientTemp = models.FloatField()
    humidity = models.FloatField()
    lightIntensity = models.FloatField()
    nitrogenLevel = models.FloatField()
    potassiumLevel = models.FloatField()
    phosphorusLevel = models.FloatField()
    chlorophyllContent = models.FloatField(default=0.0)
    electrochemicalSignal = models.FloatField(default=0.0)
    last_detected_disease = models.CharField(max_length=100, null=True, blank=True)
    plant_status = models.CharField(max_length=50, default="Healthy")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'landName'], name='unique_land_per_user')
        ]

    def clean(self):
        super().clean()
        if not (0.0 <= self.soilPH <= 14.0):
            raise ValidationError({'soilPH': 'Soil pH must be between 0 and 14.'})
        if not (0.0 <= self.soilMoisture <= 100.0):
            raise ValidationError({'soilMoisture': 'Soil moisture must be between 0% and 100%.'})
        if not (-50.0 <= self.soilTemp <= 80.0):
            raise ValidationError({'soilTemp': 'Soil temperature must be between -50°C and 80°C.'})
        if not (-50.0 <= self.ambientTemp <= 80.0):
            raise ValidationError({'ambientTemp': 'Ambient temperature must be between -50°C and 80°C.'})
        if not (0.0 <= self.humidity <= 100.0):
            raise ValidationError({'humidity': 'Humidity must be between 0% and 100%.'})
        if not (0.0 <= self.lightIntensity <= 200000.0):
            raise ValidationError({'lightIntensity': 'Light intensity must be between 0 and 200000 lux.'})
        if not (0.0 <= self.nitrogenLevel <= 1000.0):
            raise ValidationError({'nitrogenLevel': 'Nitrogen level must be between 0 and 1000 mg/kg.'})
        if not (0.0 <= self.phosphorusLevel <= 500.0):
            raise ValidationError({'phosphorusLevel': 'Phosphorus level must be between 0 and 500 mg/kg.'})
        if not (0.0 <= self.potassiumLevel <= 1000.0):
            raise ValidationError({'potassiumLevel': 'Potassium level must be between 0 and 1000 mg/kg.'})
        if not (0.0 <= self.organicMatter <= 20.0):
            raise ValidationError({'organicMatter': 'Organic matter must be between 0% and 20%.'})

    def __str__(self):
        return f"{self.landName} (Owner: {self.user.username})"

class FavoriteArticle(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    article = models.ForeignKey('Article', on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'article')  

    def __str__(self):
        return f"{self.user.username} ❤️ {self.article.title}"
    
User = get_user_model()

class DiseaseImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='disease_images/')
    result = models.JSONField(null=True, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)


class ConversationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    land = models.ForeignKey(Land, on_delete=models.CASCADE, null=True, blank=True)
    history = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)


class Subscription(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    land_profiles_allowed = models.IntegerField(default=1)

    ai_assistant = models.BooleanField(default=False)
    ai_assistant_expires_at = models.DateTimeField(null=True, blank=True)

    disease_detection = models.BooleanField(default=False)
    disease_detection_expires_at = models.DateTimeField(null=True, blank=True)

    hardware_streaming = models.BooleanField(default=False)
    hardware_streaming_expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Subscription"

    def check_feature_status(self):
        now = timezone.now()

        if self.ai_assistant and self.ai_assistant_expires_at and self.ai_assistant_expires_at < now:
            self.ai_assistant = False

        if self.disease_detection and self.disease_detection_expires_at and self.disease_detection_expires_at < now:
            self.disease_detection = False

        if self.hardware_streaming and self.hardware_streaming_expires_at and self.hardware_streaming_expires_at < now:
            self.hardware_streaming = False

        self.save()
    
class HardwareRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    kits = models.PositiveIntegerField(default=1)
    type = models.CharField(max_length=20, choices=[('hardware', 'Hardware'), ('setup', 'Setup')], default='hardware')
    status = models.CharField(max_length=10, choices=[('pending','Pending'), ('accepted','Accepted'), ('refused','Refused')], default='pending')
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)





