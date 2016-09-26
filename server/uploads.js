/////////////////////////////////////////////////////////////////////////////////
// CollectionFS - SERVER                                                       //
/////////////////////////////////////////////////////////////////////////////////

Slingshot.createDirective("uploader", Slingshot.S3Storage, {
  bucket: "strassis",
  acl:    "public-read",

  authorize: function () {
    //Deny uploads if user is not logged in.
    if (!this.userId) {
      throw new Meteor.Error("Login Required", "Please login before uploading files!");
    }
    return true;
  },

  key: function (file, metaContext) {

    var filename = file.name.replace(/[^A-z0-9-_\.]/g, '').toLowerCase();

    weddingPhotos.update(metaContext.photo_id, {
      $set: {
        filename:   filename,
        size:       file.size,
        filetype:   file.type,
        ready:      (metaContext.thumb) ? false : true
      }
    });

    if (metaContext.thumb) {
      return 'media/' + metaContext.photo_id + '-thumb';
    }else{
      return 'media/' + metaContext.photo_id;
    }
  }
});
