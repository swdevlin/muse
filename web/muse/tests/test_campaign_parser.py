import os
from django.test import TestCase
from pathlib import Path

from yaml.scanner import ScannerError

from muse.campaign_parser import CampaignParser
from muse.models import Server, Topic


class CampaignParserTest(TestCase):

    def setUp(self) -> None:
        super().setUp()
        self.parser = CampaignParser()

    def test_no_errors_in_good_file(self):
        yaml_file = os.path.dirname(os.path.abspath(__file__)) + '/data/valid_campaign.yaml'
        yaml = Path(yaml_file).read_text()
        is_ok = self.parser.verify(yaml)
        self.assertTrue(is_ok)

    def test_invalid_yaml(self):
        yaml = """entry:
            title: Entry
            text: should 
            not 
            be 
            here
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertIsInstance(self.parser.last_error, ScannerError)

    def test_no_extra_keys(self):
        yaml = """entry:
            title: Entry
            text: some text
            bad_value: should not be here
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry has invalid property bad_value')

    def test_alias_must_be_an_array(self):
        yaml = """entry:
            title: Entry
            text: some text
            aliases: some
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, f'aliases must be a list for entry')

    def test_text_max_length_2000(self):
        text = 'a1' * 1001
        yaml = f"""entry:
            title: Entry
            text: {text}
            aliases: 
                - some
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'text for entry exceeds max length of 2000')

    def test_key_max_length_100(self):
        key = 'a1' * 51
        yaml = f"""{key}:
            title: Entry
            text: This is the text
            aliases: 
                - some
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, f'{key} max length of 100 exceeded')

    def test_slug_max_length_100(self):
        slug = 'a1' * 51
        yaml = f"""entry:
            title: Entry
            wiki_slug: {slug}
            text: This is the text
            aliases: 
                - some
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, f'wiki_slug for entry exceeds max length of 100')

    def test_alias_max_length_100(self):
        alias = 'a1' * 51
        yaml = f"""entry:
            title: Entry
            text: This is the text
            aliases: 
                - {alias}
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, f'alias {alias} for entry exceeds max length of 100')

    def test_parent_max_length_100(self):
        parent = 'a1' * 51
        yaml = f"""entry:
            title: Entry
            text: This is the text
            parent: {parent}
            aliases: 
                - abc
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'parent for entry exceeds max length of 100')

    def test_key_cannot_start_with_hyphen(self):
        yaml = """'-entry':
            title: Entry
            text: some text
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, '-entry cannot start with a -')

    def test_text_is_required(self):
        yaml = """'entry':
            title: Entry
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry has no text')

        yaml = """'entry':
            title: Entry
            text:
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry / text invalid data type')

    def test_title_is_required(self):
        yaml = """'entry':
            text: Entry
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry has no title')

        yaml = """'entry':
            title:
            text: entry
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry has a blank title')

    def test_aliases_cannot_start_with_hyphen(self):
        yaml = """entry:
            title: Entry
            text: some text
            aliases:
                - '-one'
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'alias -one for entry cannot start with a -')

    def test_title_must_be_string(self):
        yaml = """entry:
            title:
                - the title
            text: some text
            page: 17
            parent: the parent
            aliases:
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry / title invalid data type')

    def test_page_must_be_string(self):
        yaml = """entry:
            title: the title
            text: some text
            page:
                - 17
            parent: the parent
            aliases:
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry / page invalid data type')

    def test_key_cannot_start_with_space(self):
        yaml = """" entry":
            title: the title
            text: some text
            page:
                - 17
            parent: the parent
            aliases:
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, ' entry cannot start with a space')

    def test_key_cannot_end_with_space(self):
        yaml = """"entry ":
            title: the title
            text: some text
            page:
                - 17
            parent: the parent
            aliases:
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry  cannot end with a space')

    def test_key_cannot_contain_punctuation(self):
        yaml = """"ent.ry":
            title: the title
            text: some text
            page:
                - 17
            parent: the parent
            aliases:
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'ent.ry cannot contain punctuation')

    def test_key_cannot_contain_multiple_spaces(self):
        yaml = """"my  entry":
            title: the title
            text: some text
            page:
                - 17
            parent: the parent
            aliases:
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'my  entry cannot have multiple spaces')

    def test_parent_must_be_string(self):
        yaml = """entry:
            title: the title
            text: some text
            page: 17
            parent:
                - the parent
            aliases:
                - two
                - three
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)
        self.assertEqual(self.parser.last_error, 'entry / parent invalid data type')

    def test_save_entries(self):
        server = Server.objects.create(discord_id='test134', name='testserver')
        yaml_file = os.path.dirname(os.path.abspath(__file__)) + '/data/valid_campaign.yaml'
        yaml = Path(yaml_file).read_text()
        is_ok = self.parser.save(server.id, yaml)
        self.assertTrue(is_ok)
        self.assertEqual(Topic.objects.filter(server=server).count(), 6)
        self.assertEqual(Topic.objects.filter(server=server, alias_for=None).count(), 2)
