from django import forms


TemplateChoices = [
    ('default', 'Default'),
    ('ripley', 'Ripley'),
]


class PersonalityForm(forms.Form):
    personality = forms.ChoiceField(label='Personality', choices=TemplateChoices, required=False)

    def __init__(self, personality):
        super().__init__()
        self.fields['personality'].initial = personality
