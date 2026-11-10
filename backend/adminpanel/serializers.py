from rest_framework import serializers
from authentication.models import User, Role, Permission
from authentication.permissions import RoleChoices

class UserAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id','email','username','first_name','last_name','phone_number','role','is_active','is_staff','is_superuser','is_email_verified','date_joined','last_login','password','password_confirm']
        extra_kwargs = {'password': {'write_only': True}}

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Return role name instead of UUID in responses
        if instance.role_id:
            ret['role'] = instance.role.name if instance.role else None
        else:
            ret['role'] = None
        return ret

    def validate(self, attrs):
        pw = attrs.get('password')
        pw_conf = attrs.pop('password_confirm', None)
        if pw and pw != pw_conf:
            raise serializers.ValidationError({'password_confirm':'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id','name','description']

class PermissionSerializer(serializers.ModelSerializer):
    roles = serializers.PrimaryKeyRelatedField(many=True, queryset=Role.objects.all(), required=False)

    class Meta:
        model = Permission
        fields = ['id','code','name','description','roles']

    def create(self, validated_data):
        roles = validated_data.pop('roles', [])
        perm = Permission.objects.create(**validated_data)
        perm.roles.set(roles)
        return perm

    def update(self, instance, validated_data):
        roles = validated_data.pop('roles', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if roles is not None:
            instance.roles.set(roles)
        return instance
