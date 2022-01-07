from django.core.management import BaseCommand, CommandError

from muse.jobs.load_campaign import load_campaign
from muse.models import CampaignJobsLog


class Command(BaseCommand):
    help = 'Add a campaign parser job to the queue'

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--channel_id', type=int, help='internal channel id')
        parser.add_argument('--filename', type=str, help='name of file in S3 bucket')
        parser.add_argument('--now', action='store_true', help='name of file in S3 bucket')

    def handle(self, *args, **options):
        channel_id = options['channel_id']
        if not channel_id:
            raise CommandError('channel_id is required')

        filename = options['filename']
        if not filename:
            raise CommandError('filename is required')

        job = CampaignJobsLog.objects.create(channel_id=channel_id, filename=filename)
        if options['now']:
            load_campaign(job.id, channel_id, filename)
        else:
            load_campaign.delay(job.id, channel_id, filename, delay=10)
            print('campaign parse job created')
