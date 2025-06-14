from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from .models import *
from django.utils import timezone
from django.core.mail import EmailMessage
from django.urls import reverse
from django.conf import settings
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
import requests
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import TokenAuthentication
import re
from rest_framework.decorators import api_view
from rest_framework.decorators import parser_classes
from rest_framework.decorators import permission_classes
from django.http import JsonResponse
from inference_sdk import InferenceHTTPClient
import base64
from io import BytesIO
from PIL import Image
#from .chat_bot import get_soil_analysis
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import traceback
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "main.settings")
from dotenv import load_dotenv
from fastapi import FastAPI
from rest_framework.generics import RetrieveUpdateDestroyAPIView
import io
from django.core.mail import send_mail
from django.utils.html import format_html
import stripe
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username')
        email = data.get('email')

        if data.get('user_type') == 'publisher':
            if PublisherApplication.objects.filter(email=email).exists() or PublisherApplication.objects.filter(name=username).exists():
                return Response({'error': 'A publisher application with this email or username already exists.'}, status=400)

            if CustomUser.objects.filter(email=email).exists() or CustomUser.objects.filter(username=username).exists():
                return Response({'error': 'A user with this email or username already exists.'}, status=400)

            PublisherApplication.objects.create(
                name=username,
                email=email,
                phone=data.get('phone'),
                article_link=data.get('article_link'),
                password=data['password'],
                status='pending'
            )
            return Response({'message': 'Publisher application submitted. Wait for approval.'}, status=201)

        else:  # user_type == 'user'
            # Prevent user registration if a publisher application or user already exists with same email or username
            if PublisherApplication.objects.filter(email=email).exists() or PublisherApplication.objects.filter(name=username).exists():
                return Response({'error': 'An application with this email or username already exists for publisher.'}, status=400)

            if CustomUser.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists.'}, status=400)

            if CustomUser.objects.filter(email=email).exists():
                return Response({'error': 'Email already in use.'}, status=400)

            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=data['password'],
                phone=data.get('phone'),
                user_type='user',
                is_active=True
            )
            return Response({'message': 'User registered successfully'}, status=201)

'''
    def validate_email(self, email):
        api_key = 'b13412e76b9440878e1eaad5ee7dad4f'
        url = f'https://emailvalidation.abstractapi.com/v1/?api_key={api_key}&email={email}'

        try:
            response = requests.get(url)
            data = response.json()

            if data.get('is_valid_format', {}).get('value') and data.get('deliverability') == 'DELIVERABLE':
                return True
            else:
                return False
        except requests.exceptions.RequestException:
            return False '''


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username').strip()
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is not None:
            if user.user_type == 'publisher' and not user.is_approved_publisher:
                return Response({'error': 'Publisher account not approved yet'}, status=403)

            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user_id': user.id,
                'token': token.key,
                'username': user.username,
                'user_type': user.user_type
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        try:
            user = CustomUser.objects.get(email=email)

            new_password_reset = PasswordReset(user=user)
            new_password_reset.save()

            password_reset_url = reverse('reset-password', kwargs={'reset_id': new_password_reset.reset_id})
            full_password_reset_url = f'http://localhost:3000/update/{new_password_reset.reset_id}/'

            email_body = f'Reset your password using the link below:\n\n\n{full_password_reset_url}'

            email_message = EmailMessage(
                'Reset your password',
                email_body,
                settings.EMAIL_HOST_USER,
                [email]
            )

            email_message.fail_silently = True
            email_message.send()

            return Response({'message': 'Password reset email sent successfully.'}, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, reset_id):
        try:
            password_reset = PasswordReset.objects.get(reset_id=reset_id)
            user = password_reset.user
            new_password = request.data.get("password")

            if not new_password:
                return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

            user.password = make_password(new_password)
            user.save()
            password_reset.delete()

            return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)

        except PasswordReset.DoesNotExist:
            return Response({"error": "Invalid or expired reset link"}, status=status.HTTP_400_BAD_REQUEST)
        
class UserProfileView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = CustomUserSerializer

    def get(self, request):
        user = request.user
        serializer = CustomUserSerializer(user)
        return Response(serializer.data)
    
class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        user = request.user

        user_serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if user_serializer.is_valid():
            email = request.data.get('email')
            #if email:
                #if not self.validate_email(email):
                    #return Response({"email": "Invalid email format or email is not deliverable."}, status=400)

            user_serializer.save()
            profile = user.profile
            bio = request.data.get('bio')
            if bio is not None:
                profile.bio = bio

            if 'profile_pic' in request.FILES:
                profile.profile_pic = request.FILES['profile_pic']

            profile.save()

            return Response(user_serializer.data)
        return Response(user_serializer.errors, status=400)

    '''def validate_email(self, email):
        api_key = 'b13412e76b9440878e1eaad5ee7dad4f'
        url = f'https://emailvalidation.abstractapi.com/v1/?api_key={api_key}&email={email}'
        try:
            response = requests.get(url)
            data = response.json()

            if data.get('is_valid_format', {}).get('value') and data.get('deliverability') == 'DELIVERABLE':
                return True
            else:
                return False
        except requests.exceptions.RequestException:
            return False'''
        
class IsPublisherOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        return request.user.user_type == 'administrator' or (request.user.user_type == 'publisher' and obj.author == request.user)


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]  
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsPublisherOrAdmin()]  
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type not in ['publisher', 'administrator']:
            raise PermissionDenied("Only publishers or admins can create articles.")
        serializer.save(author=user)

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_image = old_instance.image

        updated_instance = serializer.save()

        if old_image and old_image != updated_instance.image:
            old_image.delete(save=False)

    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()
        
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        request.auth.delete()  
        return Response({"message": "Logged out successfully"}, status=200)
    
class LandViewSet(viewsets.ModelViewSet):
    queryset = Land.objects.all()
    serializer_class = LandSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        user = self.request.user
        subscription, _ = Subscription.objects.get_or_create(user=user)
        lands_used = Land.objects.filter(user=user).count()

        if not user.user_type == 'administrator' and lands_used >= subscription.land_profiles_allowed:
            raise serializers.ValidationError(
                {"detail": "You have reached the maximum number of allowed land profiles in your subscription."}
            )

        serializer.save(user=user)


class FavoriteArticleViewSet(viewsets.ModelViewSet):
    queryset = FavoriteArticle.objects.all()
    serializer_class = FavoriteArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        article = Article.objects.get(id=self.request.data.get('article'))
        serializer.save(user=self.request.user, article=article)

import requests

class DiseaseDetectionAPIView(APIView): 
    def post(self, request):
        serializer = DiseaseDetectionSerializer(data=request.data)
        if serializer.is_valid():
            image = serializer.validated_data['image']
            img = Image.open(image)
            box_width, box_height = 460, 350
            img = img.resize((box_width, box_height), Image.Resampling.LANCZOS)  # Resize to exact size

            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            image_data = base64.b64encode(buffered.getvalue()).decode('utf-8')
            client = InferenceHTTPClient(
                api_url="https://detect.roboflow.com",
                api_key="vlPZFCdo0grUM6Wou9T8"
            )

            try:
                result = client.run_workflow(
                    workspace_name="graduation-project-6a42i",
                    workflow_id="union-team",
                    images={
                        "image": image_data  
                    },
                    use_cache=True
                )[0]
                print(result)
                
                output_image = result.get("output_image")
                text_data = result.get("Tex")  
                predictions = text_data.get("predictions", []) if text_data else []

                top_class = None
                if predictions:
                    top_prediction = max(predictions, key=lambda p: p.get("confidence", 0))
                    top_class = top_prediction.get("class")

                if output_image:
                    return Response({
                        "output_image": output_image,
                        "class": top_class  
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "error": "No output image received.",
                        "class": top_class
                    }, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return Response({"error": f"Roboflow request failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        

class LandDetail(APIView):
    def get(self, request, user_id, land_name):
        try:
            land = Land.objects.get(user__id=user_id, landName=land_name)
            serializer = LandSerializer(land)
            return Response(serializer.data)
        except Land.DoesNotExist:
            return Response({"error": "Land not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request, *args, **kwargs):
        user = request.user
        land_name = request.data.get('landName')

        if Land.objects.filter(user=user, landName=land_name).exists():
            return Response({'error': 'You already have a land with this name.'}, status=400)

        serializer = LandSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class LandDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Land.objects.all()
    serializer_class = LandSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
def apply_publisher(request):
    serializer = PublisherApplicationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Application submitted successfully'}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_publisher_requests(request):
    user = request.user
    if user.user_type != 'administrator':
        return Response({'detail': 'You do not have permission to access this resource.'}, status=403)
    
    applications = PublisherApplication.objects.filter(status='pending')
    serializer = PublisherApplicationSerializer(applications, many=True)
    return Response(serializer.data)

from django.core.mail import EmailMessage
from django.utils.html import format_html

@api_view(['PATCH'])
def update_publisher_status(request, pk):
    try:
        application = PublisherApplication.objects.get(pk=pk)
        status = request.data.get("status")

        if status not in ['accepted', 'refused']:
            return Response({'error': 'Invalid status'}, status=400)

        application.status = status
        application.save()

        if status == 'accepted':
            if not hasattr(application, 'user') or application.user is None:
                user = CustomUser(
                    username=application.name,
                    email=application.email,
                    phone=application.phone,
                    user_type='publisher',
                    article_link=application.article_link,
                    is_active=True,
                    is_approved_publisher=True
                )
                user.set_password(application.password) 
                user.save()
                application.user = user
                application.save()

            html_message = format_html(
                """
                <p>Congratulations! Your application has been <strong>accepted</strong>.</p>
                <p>You can now log in using the button below:</p>
                <p>
                  <a href="http://localhost:3000/signpage" style="padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
                    Login Now
                  </a>
                </p>
                """
            )
            email = EmailMessage(
                'Publisher Application Accepted',
                html_message,
                'your_email@example.com',
                [application.email],
            )
            email.content_subtype = "html"
            email.send(fail_silently=True)

        elif status == 'refused':
            if application.user:
                application.user.is_active = False
                application.user.save()

            
            send_mail(
                'Publisher Application Refused',
                'Sorry, your application has been refused.',
                'your_email@example.com',
                [application.email],
                fail_silently=True,
            )
            application.delete()

        return Response({'message': 'Status updated successfully'})

    except PublisherApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_publisher_requests_count(request):
    if request.user.user_type != 'administrator':
        return Response({"detail": "Unauthorized"}, status=403)
    count = PublisherApplication.objects.filter(is_read=False).count()
    return Response({'unread_count': count})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_hardware_requests_count(request):
    if request.user.user_type != 'administrator':
        return Response({"detail": "Unauthorized"}, status=403)
    count = HardwareRequest.objects.filter(is_read=False).count()
    return Response({'unread_count': count})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_requests_as_read(request):
    if request.user.user_type != 'administrator':
        return Response({"detail": "Unauthorized"}, status=403)
    
    request_type = request.data.get('type', 'publisher')

    if request_type == 'publisher' or request_type == 'all':
        PublisherApplication.objects.filter(is_read=False).update(is_read=True)
    if request_type == 'hardware' or request_type == 'all':
        HardwareRequest.objects.filter(is_read=False).update(is_read=True)

    return Response({'status': 'all marked as read'})


def approve_publisher(application_id):
    try:
        app = PublisherApplication.objects.get(id=application_id, status='pending')

        user = CustomUser(
            username=app.name,
            email=app.email,
            phone=app.phone,
            user_type='publisher',
            is_approved_publisher=True
        )
        user.set_password(app.password)  
        user.save()

        app.user = user  
        app.status = 'accepted'  
        app.save()

        return True
    except PublisherApplication.DoesNotExist:
        return False
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_administrator(request):
    if request.user.user_type != 'administrator':
        return Response({'error': 'Only administrators can create new admins.'}, status=403)

    data = request.data
    required_fields = ['userName', 'email', 'password', 'confirmPassword', 'phoneNumber']
    if not all(field in data for field in required_fields):
        return Response({'error': 'Missing required fields.'}, status=400)

    if data['password'] != data['confirmPassword']:
        return Response({'error': 'Passwords do not match.'}, status=400)

    phone = data['phoneNumber']
    if not re.fullmatch(r'\d{11}', phone):
        return Response({'error': 'Phone number must be exactly 11 digits.'}, status=400)

    if CustomUser.objects.filter(username=data['userName'].strip()).exists():
        return Response({'error': 'Username already exists.'}, status=400)

    if CustomUser.objects.filter(email=data['email']).exists():
        return Response({'error': 'Email already exists.'}, status=400)

    user = CustomUser(
        username=data['userName'],
        email=data['email'],
        phone=phone,
        user_type='administrator'
    )
    user.set_password(data['password'])
    user.save()

    return Response({'message': 'Administrator created successfully'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subscription_view(request):
    subscription, created = Subscription.objects.get_or_create(user=request.user)
    subscription.check_feature_status()

    if request.method == 'GET':
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data
        subscription.land_profiles_allowed = data.get('land_profiles', subscription.land_profiles_allowed)

        now = timezone.now()
        feature_duration = timedelta(days=365)

        # ai_assistant
        if data.get('ai_assistant', False):
            if not subscription.ai_assistant or not subscription.ai_assistant_expires_at or subscription.ai_assistant_expires_at < now:
                subscription.ai_assistant = True
                subscription.ai_assistant_expires_at = now + feature_duration

        # disease_detection
        if data.get('disease_detection', False):
            if not subscription.disease_detection or not subscription.disease_detection_expires_at or subscription.disease_detection_expires_at < now:
                subscription.disease_detection = True
                subscription.disease_detection_expires_at = now + feature_duration

        # hardware_streaming
        if data.get('hardware_streaming', False):
            if not subscription.hardware_streaming or not subscription.hardware_streaming_expires_at or subscription.hardware_streaming_expires_at < now:
                subscription.hardware_streaming = True
                subscription.hardware_streaming_expires_at = now + feature_duration

        subscription.save()
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)
    
class HardwareRequestViewSet(viewsets.ModelViewSet):
    queryset = HardwareRequest.objects.all()
    serializer_class = HardwareRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'administrator':
            return HardwareRequest.objects.filter(status='pending')
        else:
            return HardwareRequest.objects.filter(user=user, status='pending')



stripe.api_key = settings.STRIPE_SECRET_KEY
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    try:

        data = request.data
        amount = data.get('amount')  
        currency = data.get('currency', 'usd')

        if not amount:
            return Response({'error': 'Amount is required'}, status=400)

        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={'user_id': request.user.id}
        )

        return Response({
            'clientSecret': intent['client_secret']
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_subscription(request):
    user = request.user
    sub, _ = Subscription.objects.get_or_create(user=user)
    now = timezone.now()
    one_year = timedelta(days=365)

    sub.land_profiles_allowed = request.data.get('land_profiles_allowed', sub.land_profiles_allowed)

    if request.data.get('ai_assistant'):
        if request.data.get('ai_assistant'):
            sub.ai_assistant = True
            sub.ai_assistant_expires_at = now + one_year


    if request.data.get('disease_detection'):
        if request.data.get('disease_detection'):
            sub.disease_detection = True
            sub.disease_detection_expires_at = now + one_year

    if request.data.get('hardware_streaming'):
        if request.data.get('hardware_streaming'):
            sub.hardware_streaming = True
            sub.hardware_streaming_expires_at = now + one_year

    sub.save()

    lands_used = Land.objects.filter(user=user).count()
    data = SubscriptionSerializer(sub).data
    data['lands_used'] = lands_used
    data['can_add_land'] = lands_used < sub.land_profiles_allowed

    return Response(data)

@csrf_exempt
@api_view(['POST'])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = 'whsec_LTtjon3FAdhUcxoasKZVgApPpOp9Fdn3'  

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        user_id = payment_intent['metadata'].get('user_id')

        if user_id:
            try:
                user = CustomUser.objects.get(id=user_id)
                sub, _ = Subscription.objects.get_or_create(user=user)
                now = timezone.now()
                one_year = timedelta(days=365)
                sub.land_profiles_allowed += 1  
                sub.ai_assistant = True
                sub.ai_assistant_expires_at = now + one_year
                sub.save()
            except CustomUser.DoesNotExist:
                pass  

    return HttpResponse(status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_plant_status(request, land_id):
    try:
        land = Land.objects.get(id=land_id, user=request.user)
        plant_status = request.data.get("plant_status")

        if not plant_status:
            return Response({"error": "Missing plant_status"}, status=400)

        land.plant_status = plant_status
        land.save()

        return Response({"message": "Plant status updated successfully"})
    except Land.DoesNotExist:
        return Response({"error": "Land not found"}, status=404)