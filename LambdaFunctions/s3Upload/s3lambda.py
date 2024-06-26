import boto3
from botocore.exceptions import ClientError
import base64

def upload_file(event, context):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """
    
    # Decode the base64-encoded image data to bytes
    image_bytes = base64.b64decode(event["b_image"], validate=True)
    
    # Upload the file
    s3_client = boto3.client('s3')
    try:
        response = s3_client.put_object(
            Body=image_bytes,
            Bucket=event["bucket"],
            Key=event["key"],
        )
        return True
    except ClientError as e:
        return False