from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        if 'detail' in response.data:
            detail = response.data.pop('detail')
            response.data['message'] = detail
        elif isinstance(response.data, dict):
            # handle nested detail
            for key, value in list(response.data.items()):
                if isinstance(value, dict) and 'detail' in value:
                    response.data[key] = {'message': value.pop('detail')}
        response.data['status'] = 'error'
    return response
