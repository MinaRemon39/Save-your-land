from api.models import CustomUser  
def authenticate(username, password):
    
    try:
        user=CustomUser.objects.get(username=username)
        if user.check_password(password):
            return user
        else:
            return None
    except CustomUser.DoesNotExist:
        return None