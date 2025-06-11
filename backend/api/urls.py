from django.urls import path, include
from api.api_views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'lands', LandViewSet, basename='land')
router.register(r'favorites', FavoriteArticleViewSet, basename='favorite-article')
router.register(r'hardware-requests', HardwareRequestViewSet, basename='hardware-requests')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uuid:reset_id>/', ResetPasswordView.as_view(), name='reset-password'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('edit-profile/', EditProfileView.as_view(), name='edit-profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/articles/', ArticleViewSet.as_view({'get': 'list'}), name='profile-articles'),
    path('', include(router.urls)),
    path('articles/<int:pk>/', ArticleViewSet.as_view({'put': 'update', 'patch': 'partial_update'}), name='article-update'),
    path('disease-detection/', DiseaseDetectionAPIView.as_view(), name='disease-detection'),
    path('api/lands/<int:pk>/', LandDetailAPIView.as_view(), name='land-detail'),
    path('apply-publisher/', apply_publisher),
    path('publisher-requests/', get_publisher_requests),
    path('publisher-status/<int:pk>/', update_publisher_status),
    path('publisher-requests/<int:pk>/', update_publisher_status, name='update_publisher_status'),
    path('unread-publisher-count/', unread_publisher_requests_count),
    path('unread-hardware-count/', unread_hardware_requests_count),
    path('mark-requests-read/', mark_all_requests_as_read),
    path('create-administrator/', create_administrator, name='create_administrator'),
    path('subscription/', subscription_view),
    path('create-payment-intent/', create_payment_intent, name='create-payment-intent'),
    path('activate-subscription/', activate_subscription, name='activate-subscription'),
    path('update-plant-status/<int:land_id>/', update_plant_status, name='update-plant-status'),
]

urlpatterns += router.urls