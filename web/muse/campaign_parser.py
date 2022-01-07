from string import punctuation

import yaml

from muse.models import ChannelTopic

VALID_KEYS = ['title', 'text', 'aliases', 'page', 'parent', 'wiki_slug', 'category', 'image']

MAX_KEY_LENGTH = 100
MAX_MESSAGE_LENGTH = 2000


class CampaignParser:
    def __init__(self) -> None:
        super().__init__()
        self.last_error = None
        self.campaign = None

    def verify(self, yaml_contents):
        try:
            self.campaign = yaml.safe_load(yaml_contents)
            for key in self.campaign:
                if key.startswith('-'):
                    self.last_error = f'{key} cannot start with a -'
                    return False
                if key.startswith(' '):
                    self.last_error = f'{key} cannot start with a space'
                    return False
                if key.endswith(' '):
                    self.last_error = f'{key} cannot end with a space'
                    return False
                if '  ' in key:
                    self.last_error = f'{key} cannot have multiple spaces'
                    return False
                if any(p in key for p in punctuation):
                    self.last_error = f'{key} cannot contain punctuation'
                    return False
                if len(key) > MAX_KEY_LENGTH:
                    self.last_error = f'{key} max length of {MAX_KEY_LENGTH} exceeded'
                    return False
                entry = self.campaign[key]
                if 'text' not in entry:
                    self.last_error = f'{key} has no text'
                    return False

                if 'title' not in entry:
                    self.last_error = f'{key} has no title'
                    return False
                elif entry['title'] is None or len(entry['title']) == 0:
                    self.last_error = f'{key} has a blank title'
                    return False

                for prop in entry:
                    if prop not in VALID_KEYS:
                        self.last_error = f'{key} has invalid property {prop}'
                        return False
                    if prop == 'aliases':
                        if not isinstance(entry[prop], list):
                            self.last_error = f'aliases must be a list for {key}'
                            return False
                        for alias in entry[prop]:
                            if alias.startswith('-'):
                                self.last_error = f'alias {alias} for {key} cannot start with a -'
                                return False
                            if len(alias) > MAX_KEY_LENGTH:
                                self.last_error = f'alias {alias} for {key} exceeds max length of {MAX_KEY_LENGTH}'
                                return False
                    else:
                        if not isinstance(entry[prop], str) and not isinstance(entry[prop], int):
                            self.last_error = f'{key} / {prop} invalid data type'
                            return False
                        if isinstance(entry[prop], str):
                            l = len(entry[prop])
                        else:
                            l = 0
                        if prop == 'text':
                            if l == 0 or l > MAX_MESSAGE_LENGTH:
                                self.last_error = f'text for {key} exceeds max length of {MAX_MESSAGE_LENGTH}'
                                return False
                        elif prop == 'wiki_slug':
                            if l == 0 or l > MAX_KEY_LENGTH:
                                self.last_error = f'{prop} for {key} exceeds max length of {MAX_KEY_LENGTH}'
                                return False
                        elif prop == 'parent':
                            if l > MAX_KEY_LENGTH:
                                self.last_error = f'{prop} for {key} exceeds max length of {MAX_KEY_LENGTH}'
                                return False

            return True
        except yaml.scanner.ScannerError as err:
            self.last_error = err
            return False

        except yaml.parser.ParserError as err:
            self.last_error = err
            return False

    def save(self, channel_id, campaign_contents):
        is_ok = self.verify(campaign_contents)
        if not is_ok:
            return is_ok
        for key in self.campaign:
            entry = self.campaign[key]
            try:
                ChannelTopic.objects.update_or_create(
                    key=key,
                    channel_id=channel_id,
                    defaults={
                        'title': entry.get('title'),
                        'text': entry.get('text'),
                        'parent': entry.get('parent'),
                        'page': entry.get('page'),
                        'wiki_slug': entry.get('wiki_slug'),
                        'image': entry.get('image'),
                        'category': entry.get('category'),
                    }
                )
                for alias in entry.get('aliases', []):
                    ChannelTopic.objects.get_or_create(
                        key=alias,
                        channel_id=channel_id,
                        defaults={
                            'title': entry.get('title'),
                            'alias_for': key,
                        }
                    )
            except Exception as err:
                print(err)
                return False
        return True
