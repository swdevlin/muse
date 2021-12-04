# AWS Setup

Create an SQS queue for the campaign parse jobs

Create a S3 bucket to hold the campaign uploads

Create an IAM user with permissions to access SQS and S3. 
Add the access key and secret for the user to the environment

# Run the job queue

create a logs directory in the web directory.

`python manage.py process_queue --queues SQS_QUEUE`
