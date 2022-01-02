from django.contrib import admin
from django.db import models
from django.forms import TextInput, ModelForm


class Personalities:
    TRAVELLER = 1
    ECLIPSE_PHASE = 2
    CALL_OF_CTHULHU = 3
    BLANK_CANVAS = 4
    choices = [
        (TRAVELLER, 'Traveller'),
        (ECLIPSE_PHASE, 'Eclipse Phase'),
        (CALL_OF_CTHULHU, 'Call of Cthulhu'),
        (BLANK_CANVAS, 'Blank Canvas'),
    ]


class Topic(models.Model):
    class Meta:
        db_table = 'topic'
        unique_together = ('personality', 'key')
        indexes = [
            models.Index(name='parent_lookup', fields=['personality', 'parent'], include=['title']),
            models.Index(name='topic_key', fields=['personality', 'key'])
        ]

    personality = models.IntegerField(null=False, choices=Personalities.choices)
    title = models.TextField(null=False)
    key = models.TextField(null=False)
    text = models.TextField(null=True)
    alias_for = models.TextField(null=True)
    parent = models.TextField(null=True)
    page = models.TextField(null=True)
    wiki_slug = models.TextField(null=True)
    image = models.TextField(null=True)
    category = models.TextField(null=True)

    def __str__(self):
        return f'{self.title} ({self.key})'


class TopicAdminForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['key'].widget = TextInput()
        self.fields['title'].widget = TextInput()
        self.fields['alias_for'].widget = TextInput()
        self.fields['parent'].widget = TextInput()
        self.fields['page'].widget = TextInput()
        self.fields['wiki_slug'].widget = TextInput()
        self.fields['image'].widget = TextInput()
        self.fields['category'].widget = TextInput()

    class Meta:
        model = Topic
        exclude = []


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    form = TopicAdminForm
    list_display = ('key', 'title', 'personality')
    list_filter = ('personality', 'category')
    ordering = ('personality', 'key',)
