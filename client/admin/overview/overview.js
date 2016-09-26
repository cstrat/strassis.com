Template.adminOverview.helpers({

  invitesCreated: function() {
    return weddingGuests.find().count();
  },

  invitesSent: function() {
    return weddingGuests.find({invited: true}).count();
  },

  invitesRegistered: function() {
    return weddingGuests.find({account_id: {$ne: ""}}).count();
  },

  peopleAdded: function() {
    var peopleAdded = 0;
    weddingGuests.find().fetch().forEach(function(guestcard) {
      peopleAdded += guestcard.names.length;
    });
    return peopleAdded;
  },

  peopleResponded: function() {
    var peopleResponded = 0;
    weddingGuests.find().fetch().forEach(function(guestcard) {
      guestcard.names.forEach(function(guestName) {
        if (guestName.rsvp !== null) {
          peopleResponded++;
        }
      });
    });
    return peopleResponded;
  },

  noResponse: function() {
    var peopleNoResponse = 0;
    weddingGuests.find().fetch().forEach(function(guestcard) {
      guestcard.names.forEach(function(guestName) {
        if (guestName.rsvp === null) {
          peopleNoResponse++;
        }
      });
    });
    return peopleNoResponse;
  },

  willAttend: function() {
    var peopleAttending = 0;
    weddingGuests.find().fetch().forEach(function(guestcard) {
      guestcard.names.forEach(function(guestName) {
        if (guestName.rsvp === true) {
          peopleAttending++;
        }
      });
    });
    return peopleAttending;
  },

  willNotAttend: function() {
    var peopleNotAttending = 0;
    weddingGuests.find().fetch().forEach(function(guestcard) {
      guestcard.names.forEach(function(guestName) {
        if (guestName.rsvp === false) {
          peopleNotAttending++;
        }
      });
    });
    return peopleNotAttending;
  }
});