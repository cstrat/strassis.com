///////////////////////////////////////////////////////////////////////////////
// Publications                                                              //
///////////////////////////////////////////////////////////////////////////////



Meteor.publish('data', function () {
  // Only publish private data to logged in users!
  if (!this.userId) {
    return weddingData.find({}, {fields: { privateData: 0 }});
  }else{
    return weddingData.find({}, {fields: { publicData: 1, privateData: 1 }});
  }
});



Meteor.publish('guests', function (options) {
  // Not logged in, no publish here!
  if (!this.userId) {
    this.ready();

  }else{
    // If request is for all records, and user is admin - publish that!!
    if (options && options.admin && Meteor.users.findOne(this.userId).admin) {
      return weddingGuests.find();

    // Otherwise publish only that users guestlist document, minus a few fields
    }else{
      return weddingGuests.find({ account_id: this.userId }, { fields: { tags: 0, invited: 0, dates: 0 } });

    }
  }
});


Meteor.publish('photos', function (options) {
  // Only publish public photos and ones submitted by this user
  if (!this.userId) {
    this.ready();
  }else{
    if (options && options.admin && Meteor.users.findOne(this.userId).admin) {
      return weddingPhotos.find();

    }else{
      return weddingPhotos.find({   ready: true,
                                    deleted:  {
                                      $ne: true
                                    },
                                    $or:  [ { public: true },
                                            { account_id: this.userId } ]},
                                  {
                                    fields: {
                                      _id:          1,
                                      date:         1,
                                      ready:        1,
                                      account_id:   1,
                                      public:       1,
                                      rotate:       1
                                    }
                                  });

    }
  }
});


Meteor.publish(null, function() {
  if (this.userId) {
    return Meteor.users.find(this.userId, {fields: {_id: 1, emails: 1, admin: 1}})
  }else{
    this.ready();
  }
});