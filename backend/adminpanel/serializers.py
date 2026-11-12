from rest_framework import serializers
from authentication.models import User, Role, Permission
from authentication.permissions import RoleChoices
from .models import (
    Game, Tournament, TournamentRegistration, Match,
    Withdrawal, Dispute, FlaggedAccount, Deposit, Payout,
)


# ============================================================================
# EXISTING ADMIN SERIALIZERS (kept unchanged)
# ============================================================================

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
        if instance.role_id:
            ret['role'] = instance.role.name if instance.role else None
        else:
            ret['role'] = None
        return ret

    def validate(self, attrs):
        pw = attrs.get('password')
        pw_conf = attrs.pop('password_confirm', None)
        if pw and pw != pw_conf:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
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
        fields = ['id', 'name', 'description']


class PermissionSerializer(serializers.ModelSerializer):
    roles = serializers.PrimaryKeyRelatedField(many=True, queryset=Role.objects.all(), required=False)

    class Meta:
        model = Permission
        fields = ['id', 'code', 'name', 'description', 'roles']

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


# ============================================================================
# TOURNAMENT SERIALIZERS
# ============================================================================

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'name', 'platform', 'is_active', 'created_at']


class TournamentSerializer(serializers.ModelSerializer):
    game_name = serializers.CharField(source='game.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    current_players_count = serializers.IntegerField(source='current_players', read_only=True)

    class Meta:
        model = Tournament
        fields = [
            'id', 'name', 'game', 'game_name', 'platform', 'description',
            'cover_image', 'tournament_type', 'cup_type', 'allows_third_place',
            'status', 'join_type', 'join_code', 'min_players', 'max_players',
            'current_players', 'current_players_count', 'entry_fee', 'pool_prize',
            'platform_fee', 'prize_1st', 'prize_2nd', 'prize_3rd',
            'registration_open_date', 'registration_close_date', 'start_date',
            'end_date', 'rules', 'created_by', 'created_by_email',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'join_code', 'pool_prize', 'platform_fee', 'prize_1st',
            'prize_2nd', 'prize_3rd', 'current_players', 'created_by',
            'created_by_email', 'created_at', 'updated_at',
        ]

    def validate(self, attrs):
        game = attrs.get('game') or getattr(self.instance, 'game', None)
        tournament_type = attrs.get('tournament_type') or getattr(self.instance, 'tournament_type', None)
        cup_type = attrs.get('cup_type') or getattr(self.instance, 'cup_type', None)
        entry_fee = attrs.get('entry_fee') or getattr(self.instance, 'entry_fee', None)
        min_players = attrs.get('min_players') or getattr(self.instance, 'min_players', None)
        max_players = attrs.get('max_players') or getattr(self.instance, 'max_players', None)
        registration_open_date = attrs.get('registration_open_date') or getattr(self.instance, 'registration_open_date', None)
        registration_close_date = attrs.get('registration_close_date') or getattr(self.instance, 'registration_close_date', None)
        start_date = attrs.get('start_date') or getattr(self.instance, 'start_date', None)

        # entry_fee minimum 1000
        if entry_fee is not None and entry_fee < 1000:
            raise serializers.ValidationError({'entry_fee': 'Entry fee must be at least 1000.'})

        # player limits
        if min_players is not None and max_players is not None:
            if min_players < 8 or min_players > 64:
                raise serializers.ValidationError({'min_players': 'Minimum players must be between 8 and 64.'})
            if max_players < 8 or max_players > 64:
                raise serializers.ValidationError({'max_players': 'Maximum players must be between 8 and 64.'})
            if min_players > max_players:
                raise serializers.ValidationError({'min_players': 'Minimum players cannot exceed maximum players.'})

        # dates
        if registration_open_date and registration_close_date:
            if registration_close_date <= registration_open_date:
                raise serializers.ValidationError({
                    'registration_close_date': 'Close date must be after open date.'
                })

        # eFootball-specific format validation
        if game and game.name.lower() == 'efootball':
            if not tournament_type:
                raise serializers.ValidationError({
                    'tournament_type': 'Tournament type is required for eFootball games.'
                })
            if tournament_type == 'cup' and not cup_type:
                raise serializers.ValidationError({
                    'cup_type': 'Cup type is required for Cup tournaments.'
                })

        return attrs

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        tournament = Tournament(**validated_data)
        tournament.save()
        return tournament

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class TournamentRegistrationSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)

    class Meta:
        model = TournamentRegistration
        fields = ['id', 'tournament', 'tournament_name', 'user', 'user_email', 'joined_at', 'is_paid']
        read_only_fields = ['id', 'joined_at', 'user_email', 'tournament_name']


class MatchSerializer(serializers.ModelSerializer):
    player_one_email = serializers.CharField(source='player_one.email', read_only=True)
    player_two_email = serializers.CharField(source='player_two.email', read_only=True)
    winner_email = serializers.CharField(source='winner.email', read_only=True)

    class Meta:
        model = Match
        fields = [
            'id', 'tournament', 'player_one', 'player_one_email',
            'player_two', 'player_two_email', 'winner', 'winner_email',
            'player_one_score', 'player_two_score', 'status',
            'played_at', 'created_at',
        ]
        read_only_fields = ['id', 'winner', 'played_at', 'created_at']
