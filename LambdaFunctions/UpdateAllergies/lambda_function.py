import boto3
import hashlib

def lambda_handler(event, context):
    
    try:
        dynamodb = boto3.resource("dynamodb")
        table_name = "LoginInfo"
        table = dynamodb.Table(table_name)
        response = table.get_item(
            Key={
                'email': str(event['login']),
            },
            ConsistentRead=True
        )
        item = response['Item']

        if item:
            # Step 2: Update the array in the item
            array_field_name = 'allergies' 
            item[array_field_name] = item.get(array_field_name, [])
            if(event['action'] == 'delete'):
                item[array_field_name].remove(event['allergy'])
            if(event['action'] == 'add'):
                item[array_field_name].append(event['allergy'])
            # Step 3: Save the modified item back to DynamoDB
            update_response = table.update_item(
                Key={
                    'email': event['login'],
                },
                UpdateExpression=f'SET {array_field_name} = :newArray',
                ExpressionAttributeValues={
                    ':newArray': item[array_field_name],
                },
                ReturnValues='ALL_NEW',  # Change as needed
            )

            updated_item = update_response.get('Attributes')
        
        return {'status' : True, 'updated_item': updated_item}
    except Exception as e:
        print(e)
        return {'status' : False, 'error': str(e)}

if __name__ == '__main__':
    event = {"login" : "m", "password" : "1234"}
    print(lambda_handler(event, None))   