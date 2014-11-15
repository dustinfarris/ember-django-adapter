# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


def add_post_data(apps, schema_editor):
    Post = apps.get_model('crud', 'Post')
    for i in range(1, 21):
        Post.objects.create(title='post title {0}'.format(i), body='post body {0}'.format(i))


class Migration(migrations.Migration):

    dependencies = [
        ('crud', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_post_data),
    ]
