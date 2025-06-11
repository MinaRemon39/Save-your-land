from rest_framework import serializers
from .models import *
from rest_framework import permissions

class ProfileSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['bio', 'profile_pic']

    def get_profile_pic(self, obj):
        return obj.profile_pic_url
    
    def validate_profile_pic(self, value):
        if isinstance(value, str) and value.endswith('.png.png'):
            value = value.replace('.png.png', '.png')
        return value


class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'phone', 'user_type', 'article_link', 'date_joined', 'profile']
        extra_kwargs = {
            'password': {'write_only': True},
            'user_type': {'required': False}
        }

    def validate(self, data):
        user_type = data.get('user_type', 'user')
        article_link = data.get('article_link', '')

        if user_type == 'publisher' and not article_link:
            raise serializers.ValidationError({
                'article_link': 'Article link is required for publishers.'
            })
        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        profile_data = validated_data.pop('profile', None)
        if validated_data.get('user_type') == 'publisher':
            validated_data['is_approved_publisher'] = False
        user = CustomUser(**validated_data)
        if profile_data:
            profile = Profile.objects.create(user=user, **profile_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        profile_data = validated_data.pop('profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if profile_data:
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.save()
        if password:
            instance.set_password(password)
        instance.save()
        return instance
    
class ArticleSerializer(serializers.ModelSerializer):
    author_profile = serializers.SerializerMethodField()
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'image', 'author_profile', 'author_name', 'created_at']

    def get_author_profile(self, obj):
        try:
            profile = Profile.objects.get(user=obj.author)
            return ProfileSerializer(profile).data
        except Profile.DoesNotExist:
            return None

    def validate_author(self, value):
        if value.user_type != 'publisher':
            raise serializers.ValidationError("Author must be a Publisher.")
        return value
    
class LandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Land
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, data):
        user = self.context['request'].user
        land_name = data.get('landName')
        soil_type = data.get('soilType')

        if not soil_type:
            raise serializers.ValidationError({"soilType": "Please enter the soil type."})

        if self.instance is None:
            if Land.objects.filter(user=user, landName=land_name).exists():
                raise serializers.ValidationError({"landName": "You already have a land with this name."})
        else:
            if Land.objects.filter(user=user, landName=land_name).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError({"landName": "You already have a land with this name."})

        return data
    

    


class FavoriteArticleSerializer(serializers.ModelSerializer):
    title = serializers.ReadOnlyField(source='article.title')
    content = serializers.ReadOnlyField(source='article.content')
    image = serializers.ImageField(source='article.image', read_only=True)
    author_name = serializers.ReadOnlyField(source='article.author.username')
    author_profile = serializers.SerializerMethodField()

    class Meta:
        model = FavoriteArticle
        fields = ['id', 'user', 'article', 'liked_at', 'title', 'content', 'image', 'author_name', 'author_profile']

    def get_author_profile(self, obj):
        try:
            profile = Profile.objects.get(user=obj.article.author)
            return ProfileSerializer(profile).data
        except Profile.DoesNotExist:
            return None


class DiseaseDetectionSerializer(serializers.Serializer):
    image = serializers.FileField()  
    
class PublisherApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublisherApplication
        fields = '__all__'

    def validate_email(self, value):
        exists = PublisherApplication.objects.filter(email=value).exclude(STATUS_CHOICES='rejected').exists()
        if exists:
            raise serializers.ValidationError("Application with this email already exists and is not rejected.")
        return value

class SubscriptionSerializer(serializers.ModelSerializer):
    can_add_land = serializers.SerializerMethodField()
    lands_used = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = '__all__'

    def get_can_add_land(self, obj):
        user = obj.user
        lands_used = Land.objects.filter(user=user).count()
        return lands_used < obj.land_profiles_allowed

    def get_lands_used(self, obj):
        return Land.objects.filter(user=obj.user).count()

class HardwareRequestSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = HardwareRequest
        fields = ['id', 'kits', 'type', 'status', 'created_at', 'email', 'phone' , 'name']
    
    def get_name(self, obj):
        return obj.user.username if obj.user else ''
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['email'] = user.email
        validated_data['phone'] = user.phone
        validated_data['user'] = user
        return super().create(validated_data)