import yaml

VALID_KEYS = ['title', 'text', 'aliases', 'page', 'parent', 'wiki_slug']


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
                    return False
                entry = self.campaign[key]
                if 'text' not in entry:
                    return False

                for prop in entry:
                    if prop not in VALID_KEYS:
                        return False
                    if prop == 'aliases':
                        if not isinstance(entry[prop], list):
                            return False
                        for alias in entry[prop]:
                            if alias.startswith('-'):
                                return False
                    else:
                        if not isinstance(entry[prop], str) and not isinstance(entry[prop], int):
                            return False
                        if prop == 'text':
                            if len(entry[prop]) == 0:
                                return False

            return True
        except yaml.scanner.ScannerError as err:
            self.last_error = err
            return False

        except yaml.parser.ParserError as err:
            self.last_error = err
            return False
