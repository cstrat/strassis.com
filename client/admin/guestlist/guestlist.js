Template.adminGuestlist.onCreated(function() {
  var self = this;

  // Guestcard Attributes
  self.openGuestcard = new ReactiveVar({  open:   false,
                                          _id:    null,
                                          extras: 0 });

  // Filter
  self.guestlistFilter = new ReactiveVar([]);

});

Template.adminGuestlist.helpers({

  guestlist: function() {
    var filterArray = Template.instance().guestlistFilter.get();
    if (filterArray.length == 0) {
      return weddingGuests.find({}, {sort: {'names.0.name': 1}});

    }else{
      return weddingGuests.find({ tags: { $all: filterArray } }, {sort: {'names.0.name': 1}});

    }
  },

  guestlistCount: function(options) {
    var filterArray = Template.instance().guestlistFilter.get();
    if (!options || filterArray.length == 0) {
      return weddingGuests.find({}, {sort: {'names.0.name': 1}}).count();

    }else{
      return weddingGuests.find({ tags: { $all: filterArray } }, {sort: {'names.0.name': 1}}).count();

    }
  },

  openGuestcard: function() {
    return Template.instance().openGuestcard.get().open;
  },

  openGuestcardID: function() {
    return Template.instance().openGuestcard.get()._id;
  },

  openGuestcardData: function() {
    if (Template.instance().openGuestcard.get()._id) {
      return weddingGuests.findOne(Template.instance().openGuestcard.get()._id);
    }else{
      return {}
    }
  },

  namePlus: function() {
    if (this.names.length > 1) {
      return this.names[0].name + ' (+' + (this.names.length - 1) + ')';
    }else{
      return this.names[0].name;
    }
  },

  nameList: function() {
    var nameList    = this.names || [];
    var blankNames  = Template.instance().openGuestcard.get().extras + 1;
    for (var x = 0; x < blankNames; x++) {
      nameList.push({name: "", comment: "", rsvp: null});
    }
    return nameList;
  },

  nameSelected: function() {
    if (this._id == Template.instance().openGuestcard.get()._id) {
      return ('selected');
    }
  },

  nameClass: function() {
    // Check if guestcard is missing data
    if (!this.email) {
      return ('missing-email not-yet-invited');
    }

    // Check that the user has created their account


    // If not, check status of invite/response
    var allRSVP = this.names.map(function(objName) {
      return objName.rsvp;
    });

    if (_.contains(allRSVP, null)) {

      if (!this.invited) {
        return ('not-yet-invited');
      }else{
        return ('not-responded');
      }

    }else{
      if (_.contains(allRSVP, false)) {
        if (_.contains(allRSVP, true)) {
          return ('mixed-response');
        }else{
          return ('all-not-attending');
        }
      }else{
        return ('all-attending');
      }
    }
  },

  accountCreated: function() {
    if (this.account_id) {
      return 'account-linked';
    }
  },

  rsvpResponse: function(rsvpCheck) {
    switch (rsvpCheck) {
      case "true":
        if (this.rsvp === true) {
          return { selected: "selected" };
        }
      break;
      case "false":
        if (this.rsvp === false) {
          return { selected: "selected" };
        }
      break;
      case "null":
        if (this.rsvp === null) {
          return { selected: "selected" };
        }
      break;
    }
  },

  tagList: function() {
    if (!this.tags) {
      return '';
    }

    return (this.tags.length > 0) ? this.tags.join(', ') : '';
  }

});

Template.adminGuestlist.events({

  'click .addGuest': function() {
    Template.instance().openGuestcard.set({ open: true, _id: null, extras: 0 });
  },

  'click .createAccounts': function() {
    // Send the filter list to the server and request all accounts get created.
    Meteor.call('createAccounts', {filter: Template.instance().guestlistFilter.get()});
  },

  'click .sendInvites': function() {
    // Send out emails to all the accounts that haven't recieved one yet.
    Meteor.call('sendInvites', {filter: Template.instance().guestlistFilter.get()});
  },

  'click .listOfGuests li': function() {
    if (Template.instance().openGuestcard.get()._id == this._id) {
      Template.instance().openGuestcard.set({ open: false, _id: null, extras: 0 });
    }else{
      Template.instance().openGuestcard.set({ open: true, _id: this._id, extras: 0 });
    }
  },

  'keyup .filterTags': function(e) {

    if (e.target.value.trim().length == 0) {
      Template.instance().guestlistFilter.set([]);

    }else{
      var filterArray = e.target.value.split(',');

      filterArray.forEach(function(tagStr, x) {
        filterArray[x] = tagStr.trim();
      });

      Template.instance().guestlistFilter.set(filterArray);
    }
  },

  'keypress .guestName': function() {
    // Check if that was the LAST of the blank Guest_Names
    var emptyNames = 0;
    $('.guestName').each(function(index) {
      if ($(this).val() == "") {
        emptyNames++;
      }
    });

    // Add a new name row
    if (emptyNames == 0) {
      var currentGC = Template.instance().openGuestcard.get();
      currentGC.extras++;
      Template.instance().openGuestcard.set(currentGC);
    }
  },

  'submit': function(e) {
    e.preventDefault();

    var saveObject    = {};
    var submittedForm = e.target.elements;
    var templateInst  = Template.instance();

    saveObject.id     = templateInst.openGuestcard.get()._id;
    saveObject.names  = [];

    /*
      FIXED BUG:
        Previoulsy had
        % if (submittedForm.guest_names.hasOwnProperty("length")) {
        However this started to fail with a recent update, there must have been a JS update.
    */

    if (submittedForm.guest_names.length) {
      var nameCount = submittedForm.guest_names.length;
      for (var x = 0; x < nameCount; x++) {
        // Names Array of Objects, convert the RSVP into True/False/NULL
        if (submittedForm.guest_names[x].value) {
          saveObject.names.push({
            name:     submittedForm.guest_names[x].value,
            comment:  submittedForm.guest_comments[x].value,
            rsvp:     (submittedForm.guest_rsvps[x].value === "null") ? null : (submittedForm.guest_rsvps[x].value === "true") ? true : false
          });
        }
      }

    }else{
      // Replicate the loop above, but for single value only
      saveObject.names.push({
        name:     submittedForm.guest_names.value,
        comment:  submittedForm.guest_comments.value,
        rsvp:     (submittedForm.guest_rsvps.value === "null") ? null : (submittedForm.guest_rsvps.value === "true") ? true : false
      });
    }

    // Split the tags up
    saveObject.tags       = submittedForm.guest_tags.value.split(',');
    saveObject.email      = submittedForm.guest_email.value;
    saveObject.phone      = submittedForm.guest_phone.value;
    saveObject.account_id = submittedForm.guest_linked.value;

    saveObject.tags.forEach(function(tag, position){
      saveObject.tags[position] = tag.toLowerCase().trim();
    });

    Meteor.call('saveGuestcard', saveObject, function(error, result) {
      if (result) {
        templateInst.openGuestcard.set({ open: true, _id: result, extras: 0 });
      }else{
        templateInst.openGuestcard.set({ open: false, _id: null, extras: 0 });
      }
    });

  },

  'click button.resetInvite': function() {
    Meteor.call('resetInvite', {guest_id: this._id}, function(error, result) {
      if (error) {
        alert(error);
      }
    });
  },

  'click button.sendInvite': function() {
    Meteor.call('sendInvite', {guest_id: this._id}, function(error, result) {
      if (error) {
        alert(error);
      }
    });
  },

  'click button.setupAccount': function() {
    Meteor.call('setupAccount', {guest_id: this._id}, function(error, result) {
      if (error) {
        alert(error);
      }
    });
  },

  'click button.sendReminder': function() {
    Meteor.call('sendReminder', this, function(error, result) {
      if (error) {
        alert(error);
      }else{
        if (result === 0) {
          alert('No Emails Sent!');
        }else{
          alert('Email Sent!');
        }
      }

    });
  },

  'click button.sendAllReminder': function() {
    Meteor.call('sendAllReminders', function(error, result) {
      if (error) {
        alert(error);
      }else{
        if (result === 0) {
          alert('No Emails Sent!');
        }else{
          alert('Email Sent: ' + result);
        }
      }

    });
  },

  'click button.emailGuestlist': function() {
    Meteor.call('emailGuestlist', function(error, result) {
      if (error) {
        alert(error);
      }else{
        alert('Email Sent!');
      }

    });
  },

  'click button.sendGroupMail': function() {
    var mailText    = $('#emailText').val();
    var mailSubject = $('#emailSubject').val();

    Meteor.call('sendGroupMail', {email: mailText, subject: mailSubject}, function(error, result) {
      if (error) {
        alert(error);
      }else{
        alert('Sent ' + result + ' emails!');
      }

    });

  }


});
