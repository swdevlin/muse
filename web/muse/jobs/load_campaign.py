import logging

import boto3
from django.utils.timezone import now

from eb_sqs.decorators import task

from muse.campaign_parser import CampaignParser
from muse.models import CampaignJobsLog
from musew.settings import CAMPAIGN_BUCKET, SQS_CAMPAIGN_QUEUE_NAME

logger = logging.getLogger('jobs')


@task(queue_name=SQS_CAMPAIGN_QUEUE_NAME)
def load_campaign(job_id, channel_id, campaign_filename):
    try:
        logger.info(f'starting campaign import {campaign_filename} for {channel_id}')
        s3 = boto3.client('s3')
        s3_file = s3.get_object(Bucket=CAMPAIGN_BUCKET, Key=campaign_filename)
        campaign = s3_file['Body'].read().decode('utf-8')
        parser = CampaignParser()
        is_ok = parser.save(channel_id=channel_id, campaign_contents=campaign)
        if not is_ok:
            logger.error(parser.last_error)
            log = CampaignJobsLog.objects.get(channel_id=channel_id, filename=campaign_filename)
            log.last_error = str(parser.last_error)
            log.save()
        else:
            logger.info(f'imported {campaign_filename} for {channel_id}')
            s3.delete_object(Bucket=CAMPAIGN_BUCKET, Key=campaign_filename)
            try:
                log = CampaignJobsLog.objects.get(id=job_id)
                log.completed_at = now()
                log.save()
            except CampaignJobsLog.DoesNotExist:
                pass
    except Exception as err:
        print(err)
        print(channel_id)
        print(campaign_filename)
