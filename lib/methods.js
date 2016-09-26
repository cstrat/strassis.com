///////////////////////////////////////////////////////////////////////////////
// Server Methods                                                            //
///////////////////////////////////////////////////////////////////////////////

Meteor.methods({

  'saveSettings': function(input) {
    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // Check that only the right inputs are submitted
    check(input, {
      appname:          String,
      title:            String,
      subtitle:         String,
      adminName:        String,
      adminEmail:       String,
      adminPhone:       String,
      showInvitation:   String,
      showGuestbook:    String,
      showPhotos:       String,
      showSeating:      String
    });

    var WD = weddingData.findOne();

    var privateDataObject = {
      invitationPage: WD.privateData.invitationPage,
      display: {
        invitation:   (input.showInvitation == "true") ? true : false,
        guestbook:    (input.showGuestbook  == "true") ? true : false,
        photos:       (input.showPhotos     == "true") ? true : false,
        seating:      (input.showSeating    == "true") ? true : false
      }
    }

    var publicDataObject = {
      welcomePage:    WD.publicData.welcomePage,
      appname:        input.appname,
      title:          input.title,
      subtitle:       input.subtitle,
      adminName:      input.adminName,
      adminEmail:     input.adminEmail,
      adminPhone:     input.adminPhone,
    }

    weddingData.update(weddingData.findOne()._id, {
      $set: {
        privateData:  privateDataObject,
        publicData:   publicDataObject
      }
    });

    return true;
  },

  'saveContent': function(input) {

    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // Check that only the right inputs are submitted
    check(input, {
      pageName:   String,
      newContent: String
    });

    switch (input.pageName) {
      case 'welcome':
        weddingData.update(weddingData.findOne()._id, {
          $set: { 'publicData.welcomePage': input.newContent }
        });
      break;
      case 'invite':
        weddingData.update(weddingData.findOne()._id, {
          $set: { 'privateData.invitationPage': input.newContent }
        });
      break;
    }

    return true;
  },


  'saveGuestcard': function(input) {

    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // Check that only the right inputs are submitted
    /*
    check(input, {
      id:               Match.Optional(String),
      account_id:       Match.Optional(String),
      names:            [Object],
      tags:             [String],
      email:            Match.Optional(String),
      phone:            Match.Optional(String)
    });
    */

    // Remember the ID, but strip it off the object (the keyname is not formatted correctly)
    var inputID = input.id;
    delete input.id;

    // Sort the 'tags'
    input.tags = input.tags.sort();

    // Check linked ID
    if (input.account_id) {
      var linkedAccount = Meteor.users.findOne(input.account_id);
      if (!linkedAccount) {
        input.account_id = "";
      }
    }

    // Clean up the email address
    input.email = input.email.toLowerCase().trim();

    // If this is an EDIT
    if (inputID) {
      // Get Current Document
      var curDoc = weddingGuests.findOne(inputID);

      if (!curDoc) {
        throw new Meteor.Error('not-found', 'You are trying to update a record which does not exist.');

      }else{
        // Append the other data to the guestcard
        input.invited       = curDoc.invited  || false;
        input.dates         = curDoc.dates    || {};
        input.dates.updated = new Date();
      }

      // If request to delete the guestcard
      if (input.names.length == 0) {
        weddingGuests.remove(inputID);

        // If there is an attached account, remove it!
        // To keep an attached account, just unlink it before deleting the guestcard
        if (curDoc.account_id) {
          Meteor.users.remove(curDoc.account_id);
        }

        return null;

      // Update the guestcard
      }else{

        // Update user account if email has changed!
        if (curDoc.email != input.email && curDoc.account_id) {
          Meteor.users.update(curDoc.account_id, {$set: { 'emails.0.address': input.email }});
        }

        weddingGuests.update(inputID, input);
        return inputID;

      }

    // This is a new guestcard!
    }else{
      // Add some standard data
      input.dates = {
        created: new Date(),
        updated: new Date(),
        setup: null,
        invited: null
      }

      input.invited = false;

      var newGuestcardID = weddingGuests.insert(input);
      return newGuestcardID;
    }
  },


  'createAccounts': function(input) {
    // This function will create new accounts for all the users who don't have one yet.
    // input.filter is an array of tags which should set the scope for the account creation.

    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // 1. Get a list of accounts which need to be created (only ones that have an email and haven't already got an account)
    var userCollections = (input.filter.length > 0) ? weddingGuests.find({ tags: { $all: input.filter }, account_id: "", email: { $ne: "" } }).fetch() :
                                                      weddingGuests.find({ account_id: "", email: { $ne: "" } }).fetch();

    // 2. Loop over them, and set them up.
    if (Meteor.isServer) {
      userCollections.forEach(function(curUser) {
        var account_id = Accounts.createUser({email: curUser.email});
        weddingGuests.update(curUser._id, {
          $set: {
            account_id: account_id,
            'dates.setup': new Date()
          }
        });
      });
    }
  },

  'sendInvites': function(input) {
    // This function is similar to the one above (createAccounts) in that it operates on a filtered view of the guestlist
    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // 1. Get a list of accounts which need to be created (only ones who haven't already been invited, and only ones with an account)
    var userCollections = (input.filter.length > 0)
                          ? weddingGuests.find({ tags: { $all: input.filter }, invited: false, account_id: { $ne: "" } }).fetch()
                          : weddingGuests.find({ invited: false, account_id: { $ne: "" } }).fetch();

    // 2. Loop over them, and set them up.
    userCollections.forEach(function(curUser) {
      weddingGuests.update(curUser._id, {
        $set: {
          invited: true,
          'dates.invited': new Date()
        }
      });
      if (Meteor.isServer) {
        Accounts.sendEnrollmentEmail(curUser.account_id);
      }
    });
  },


  'updateRSVP': function(input) {
    // Update the current users RSVP for this person
    if (!Meteor.userId()) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // Check name is correct
    var guestcard = weddingGuests.findOne({account_id: this.userId});

    if (guestcard) {
      if (input.hasOwnProperty('rsvp')) {
        input.rsvp = (input.rsvp == "true") ? true : (input.rsvp == "false") ? false : null;
        weddingGuests.update({_id: input.invite_id, "names.name": input.name}, {$set: {"names.$.rsvp": input.rsvp}});
      }
      if (input.hasOwnProperty('comment')) {
        weddingGuests.update({_id: input.invite_id, "names.name": input.name}, {$set: {"names.$.comment": input.comment}});
      }
    }
  },


  'uploadPhoto': function(input) {
    // Must be logged in.
    if (!Meteor.userId()) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // Check user tags see if they are 'approved'
    var autopost = true;
    if (_.contains(weddingGuests.findOne({account_id: this.userId}).tags, 'shadowban')) {
      autopost = false;
    }

    // Create photo db entry
    var photoID = weddingPhotos.insert({
      account_id: Meteor.userId(),
      rotate:     0,
      public:     autopost,
      date:       new Date()
    });

    return photoID;
  },

  'togglePhoto': function(input) {
    // Must be logged in.
    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // Find the photo to toggle.
    var selectedPhoto = weddingPhotos.findOne({_id: input.photo_id});

    if (selectedPhoto) {
      weddingPhotos.update(selectedPhoto._id, {$set: {public: !selectedPhoto.public} });
      return true;
    }else{
      throw new Meteor.Error('404', 'Photo Not Found!');
    }
  },


  'deletePhoto': function(input) {
    // Must be logged in.
    if (!Meteor.userId()) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // You can only delete your own photos, or be admin
    if (!Meteor.user().admin) {
      var selectedPhoto = weddingPhotos.findOne({_id: input.photo_id, account_id: Meteor.userId()});
    }else{
      var selectedPhoto = weddingPhotos.findOne({_id: input.photo_id});
    }

    if (selectedPhoto) {
      if (selectedPhoto.ready) {
        weddingPhotos.update(selectedPhoto._id, {$set: {deleted: !selectedPhoto.deleted}});
      }else{
        weddingPhotos.remove(selectedPhoto._id);
      }
      return true;

    }else{
      throw new Meteor.Error('404', 'Photo Not Found!');
    }
  },

  'removePhoto': function(input) {
    // Must be logged in.
    if (!Meteor.userId()) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // You can only remove your own photos, or be admin
    if (!Meteor.user().admin) {
      var selectedPhoto = weddingPhotos.findOne({_id: input.photo_id, account_id: Meteor.userId()});
    }else{
      var selectedPhoto = weddingPhotos.findOne({_id: input.photo_id});
    }

    if (selectedPhoto) {
      weddingPhotos.remove(selectedPhoto._id);
      return true;

    }else{
      throw new Meteor.Error('404', 'Photo Not Found!');
    }
  },

  'rotatePhoto': function(input) {
    // Must be logged in.
    if (!Meteor.userId()) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    // You can only rotate your own photos, or be admin
    if (!Meteor.user().admin) {
      var selectedPhoto = weddingPhotos.findOne({_id: input.photo_id, account_id: Meteor.userId()});
    }else{
      var selectedPhoto = weddingPhotos.findOne({_id: input.photo_id});
    }

    if (selectedPhoto) {
      if (!selectedPhoto.hasOwnProperty('rotate') || selectedPhoto.rotate == 3) {
        weddingPhotos.update(selectedPhoto._id, { $set: {rotate: 0 }});
      }else{
        weddingPhotos.update(selectedPhoto._id, { $inc: {rotate: 1 }});
      }
      return true;
    }else{
      throw new Meteor.Error('404', 'Photo Not Found!');
    }
  },

  'resetInvite': function(input) {
    // Must be logged in.
    if (!Meteor.user() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }
    weddingGuests.update(input.guest_id, {  $set: {
                                              invited: false,
                                              'dates.invited': null
                                            }
                                          });
  },

  'sendInvite': function(input) {
    // Must be logged in.
    if (!Meteor.user() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    var invitedGuest = weddingGuests.findOne({_id: input.guest_id, account_id: {$ne: ""} });
    if (invitedGuest) {
      weddingGuests.update(invitedGuest._id, {
          $set: {
            invited: true,
            'dates.invited': new Date()
          }
        });
      if (Meteor.isServer) {
        Accounts.sendEnrollmentEmail(invitedGuest.account_id);
      }
    }

  },

  'setupAccount': function(input) {
    // Must be logged in.
    if (!Meteor.user() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    var invitedGuest = weddingGuests.findOne({_id: input.guest_id, account_id: "" });
    if (Meteor.isServer && invitedGuest) {
      var account_id = Accounts.createUser({email: invitedGuest.email});
      weddingGuests.update(invitedGuest._id, {
        $set: {
          account_id: account_id,
          'dates.setup': new Date()
        }
      });
    }
  },


  'pleaseResetPassword': function(strEmail) {
    var foundUser = Meteor.users.findOne({ 'emails.0.address': strEmail.toLowerCase() });
    if (foundUser) {
      Accounts.sendResetPasswordEmail(foundUser._id);
      return true;
    }else{
      throw new Meteor.Error('no-user', 'That email address is not registered!');
    }
  }


});
