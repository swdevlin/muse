from django.core.management import BaseCommand, CommandError

from muse.jobs.load_campaign import load_campaign
from muse.models import CampaignJobsLog


class Command(BaseCommand):
    help = 'Add a campaign parser job to the queue'

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--server_id', type=int, help='internal server id')
        parser.add_argument('--filename', type=str, help='name of file in S3 bucket')

    def handle(self, *args, **options):
        server_id = options['server_id']
        if not server_id:
            raise CommandError('server_id is required')

        filename = options['filename']
        if not filename:
            raise CommandError('filename is required')

        job = CampaignJobsLog.objects.create(server_id=server_id, filename=filename)
        load_campaign.delay(job.id, server_id, filename, delay=10)
        print('campaign parse job created')
