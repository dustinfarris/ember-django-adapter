from django.db import models


class Comment(models.Model):
    body = models.TextField()
    post = models.ForeignKey('Post')


class Post(models.Model):
    title = models.CharField(max_length=100)
    body = models.TextField()
