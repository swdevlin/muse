import os
from unittest import TestCase
from pathlib import Path

from muse.campaign_parser import CampaignParser


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

    def test_no_extra_keys(self):
        yaml = """entry:
            title: Entry
            text: some text
            bad_value: should not be here
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)

    def test_alias_must_be_an_array(self):
        yaml = """entry:
            title: Entry
            text: some text
            aliases: some
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)

    def test_key_cannot_start_with_hyphen(self):
        yaml = """'-entry':
            title: Entry
            text: some text
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)

    def test_text_is_required(self):
        yaml = """'-entry':
            title: Entry
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)

        yaml = """'-entry':
            title: Entry
            text:
        """
        is_ok = self.parser.verify(yaml)
        self.assertFalse(is_ok)

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
