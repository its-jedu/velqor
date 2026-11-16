import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
import boto3
from botocore.client import Config

s3 = boto3.client(
    's3',
    endpoint_url=settings.AWS_S3_ENDPOINT_URL,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME,
    config=Config(signature_version='s3v4'),
)

print("=== R2 Connectivity Test ===\n")

# Test 1: List buckets
print("Test 1: List buckets")
try:
    buckets = s3.list_buckets()
    print(f"  Buckets: {[b['Name'] for b in buckets['Buckets']]}")
except Exception as e:
    print(f"  FAILED: {e}")

# Test 2: Head bucket
print("\nTest 2: Head bucket (velqor-bucket)")
try:
    s3.head_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
    print("  Bucket accessible")
except Exception as e:
    print(f"  FAILED: {e}")

# Test 3: Upload test file
print("\nTest 3: Upload test file")
try:
    s3.put_object(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Key='test_upload.txt',
        Body=b'hello world',
        ContentType='text/plain'
    )
    print("  Upload succeeded")
except Exception as e:
    print(f"  FAILED: {e}")

# Test 4: List objects
print("\nTest 4: List objects in velqor-bucket")
try:
    objs = s3.list_objects_v2(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
    contents = objs.get('Contents', [])
    if contents:
        print(f"  Objects: {[o['Key'] for o in contents]}")
    else:
        print("  Bucket is empty")
except Exception as e:
    print(f"  FAILED: {e}")

# Test 5: Check if test file exists publicly
print("\nTest 5: Check public URL access")
custom_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', '')
if custom_domain:
    public_url = f'https://{custom_domain}/test_upload.txt'
else:
    public_url = f'{settings.AWS_S3_ENDPOINT_URL}/{settings.AWS_STORAGE_BUCKET_NAME}/test_upload.txt'
print(f"  Public URL: {public_url}")
print("  (Open this in a browser to verify public access)")

print("\n=== Test Complete ===")
