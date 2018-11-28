# Hyperlinked Related Fields

Ember Django Adapter has support for Django REST Framework's
[HyperlinkedRelatedField](http://www.django-rest-framework.org/api-guide/relations/#hyperlinkedrelatedfield).
URLs in a json hash for `hasMany` and `belongsTo` relationship fields will automatically be
retrieved and added to the store.

This feature has limited use without some configuration because related records
are returned as multiple URLs which produces multiple requests. Sending multiple
requests becomes a performance bottleneck when there are more than a few related
URLs in the json hash.

For example, this blog post json hash shows how a `hasMany` relationship is
serialized by the default configuration of `HyperlinkedRelatedField(many=True)`:


```json
{
    "id": 11, 
    "title": "title 11", 
    "body": "post 11", 
    "comments": [
        "http://example.com/api/comments/9/", 
        "http://example.com/api/comments/10/", 
        "http://example.com/api/comments/11/"
    ]
}
```

As alluded to previously, related records can be retrieved in a single request
by creating a custom `ViewSet` that allows the related records to be retrieved
from a nested URL.
 
For example, the blog post json hash would now have a single URL for the
related comments instead of one URL per related record:

```json
{
    "id": 11, 
    "title": "title 11", 
    "body": "post 11", 
    "comments": "http://example.com/api/posts/11/comments/"
}
```

**Note:** It is also possible to use the [Coalesce Find Requests](coalesce-find-requests.md)
feature to retrieve related records in a single request, however, this is the preferred
solution.

## Models, Serializers and Router

We can create a blog post hash with the related comments URL by using the
following models, serializers and router:

```python
# models.py

class Post(models.Model):
    title = models.CharField(max_length=100)
    body = models.TextField()


class Comment(models.Model):
    body = models.TextField()
    post = models.ForeignKey('Post', related_name='comments')


# serializers.py

class PostSerializer(serializers.HyperlinkedModelSerializer):
    comments = serializers.HyperlinkedIdentityField(view_name='post-comments')

    class Meta:
        model = Post
        fields = ('id', 'title', 'body', 'comments')


class CommentSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Comment
        fields = ('id', 'body', 'post')
        
# urls.py

router = DefaultRouter()
router.register(r'posts', PostViewSet)
urlpatterns = router.urls
```

## ViewSet

The nested comments URL is achieved by adding a [@detail_route](www.django-rest-framework.org/api-guide/routers/)
decorator on the `comments` method of the `PostViewSet`. The related comments
are manually retrieved from the database and serialized.

```python
# views.py

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.all()

    @detail_route()
    def comments(self, request, pk=None):
        post = self.get_object()
        serializer = CommentSerializer(post.comments.all(), context={'request': request}, many=True)
        return Response(serializer.data)
```

For example, retrieving the comments `@detail_route` using this nested URL
`http://example.com/api/posts/11/comments/` returns all of the related comments
for post 11.

```json
[
    {
        "id": 9,
        "body": "comment 9",
        "post": "http://example.com/api/posts/11/"
    },
    {
        "id": 14,
        "body": "comment 14",
        "post": "http://example.com/api/posts/11/"
    }
]
```

## Write Operations

In this example, the comments `@detail_route` is read-only. If you need to perform
write operations on the specific related records (e.g. create, update or delete
specific comments), you would need to add a top level API with the required operations
for the related model (e.g.`CommentViewSet` on the `/api/comments/` resource).
