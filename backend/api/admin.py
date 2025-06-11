from django.contrib import admin
from .models import *
from api.models import CustomUser
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'user_type', 'phone', 'is_staff', 'is_active']
    list_filter = ['user_type', 'is_staff', 'is_active']
    search_fields = ['username', 'email']
    ordering = ['email']
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}), 
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone', 'user_type')}), 
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}), 
        ('Important dates', {'fields': ('last_login', 'date_joined')}), 
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )


class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    search_fields = ('title', 'author__username')  
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        User = CustomUser
        form.base_fields['author'].queryset = User.objects.filter(user_type='publisher')
        return form
    
@admin.register(Administrator)
class AdministratorAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'phone')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(PasswordReset)
admin.site.register(Profile)
admin.site.register(Article, ArticleAdmin)
admin.site.register(Land)
admin.site.register(PublisherApplication)
admin.site.register(FavoriteArticle)
admin.site.register(DiseaseImage)
admin.site.register(ConversationHistory)
admin.site.register(HardwareRequest)
admin.site.register(Subscription)
