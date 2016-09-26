/////////////////////////////////////////////////////////////////////////////////////////
// Reminder Email Template                                                             //
/////////////////////////////////////////////////////////////////////////////////////////
Meteor.methods({

  'sendAllReminders': function(input) {
    // Must be admin.
    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    this.unblock();
    console.log('# BEGIN EMAIL LOG');

    var emailCount = 0;
    // Only send reminder emails to those invited!
    // Only send reminder to people who haven't had one before
    weddingGuests.find({ invited: true, 'dates.reminder': { '$exists': false } }).fetch().forEach(function(curUser) {
      Meteor.call('sendReminder', curUser);
      emailCount++;
    });

    console.log('# END EMAIL LOG');

    if (emailCount > 0) {
      weddingData.update(weddingData.findOne()._id, { $set: { 'privateData.dates.reminderLastSent': new Date() } });
    }

    return emailCount;

  },

  'sendReminder': function(input) {
    // Must be admin.
    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    if (!input) {
      throw new Meteor.Error('bad input', 'This method expects a user object as input!');
    }

    weddingGuests.update(input._id, {
      $set: {
        'dates.reminder': new Date()
      }
    });

    // Days Left
    var daysLeft      = moment(new Date('2015-10-17')).diff(new Date(), 'days');
    var daysLeftSept  = moment(new Date('2015-9-17')).diff(new Date(), 'days');
    var guestName     = input.names[0].name;
    var RSVP_RESPONSE = "";
    var RSVP_RESPONSE_HTML = "";

    input.names.forEach(function(guestInfo) {
      if (guestInfo.name) {
        RSVP_RESPONSE  += '-- ' + guestInfo.name;
        RSVP_RESPONSE  += (guestInfo.rsvp == true) ? ' will attend!' : (guestInfo.rsvp == false) ? ' will *NOT* attend' : ' is undecided';
        RSVP_RESPONSE  += (guestInfo.rsvp != true) ? '' : (guestInfo.comment != '') ? ' [comment: ' + guestInfo.comment + ']' : '';

        RSVP_RESPONSE_HTML = RSVP_RESPONSE;

        RSVP_RESPONSE  += '\n';
        RSVP_RESPONSE_HTML += '<br>\n';
      }
    });

    Email.send({
      to:       input.email,
      from:     'strassis.com <rsvp@strassis.com>',
      subject:  '#strassis: Reminder & Update',
      text:     "Hi " + guestName + ",\n"
              + "Just a friendly reminder that our wedding is quickly approaching and we are finalising details with the venue.\n"
              + "We would like to have our numbers confirmed by the 17th of September (" + daysLeftSept + " days from now).\n"
              + "If you or one of your guests has any special dietary requirements, please make sure to let us know.\n\n"
              + "Your RSVP response as of right now:\n"
              + RSVP_RESPONSE + "\n\n"
              + "You can update this response anytime by visiting http://strassis.com/ and logging in. If you've forgotten your password you can reset it there too.\n\n"

              + "While you are there please feel free to upload a couple photos of yourself or photos you have with us, we really want a nice collection of photos of all of you!\n\n"
              + "If you would like to add the date to your calendar, download this calendar file: http://strassis.com/strassis_wedding.ics\n\n"

              + "Thank you,\n"
              + "❤ Nicole and Chris",

      html:     "<strong>Hi " + guestName + "</strong>,<br>\n"
              + "Just a friendly reminder that our wedding is quickly approaching and we are finalising details with the venue.<br>\n"
              + "We would like to have our numbers confirmed by the 17th of September (<i>" + daysLeftSept + " days from now</i>).<br>\n"
              + "If you or one of your guests has any special dietary requirements, please make sure to let us know.<br>\n<br>\n"
              + "Your RSVP response as of right now:<br>\n"
              + RSVP_RESPONSE_HTML + "<br>\n<br>\n"
              + "You can update this response anytime by visiting <a href=\"http://strassis.com/\">strassis.com</a> and logging in. If you've forgotten your password you can reset it there too.<br>\n<br>\n"

              + "While you are there please feel free to upload a couple photos of yourself or photos you have with us, we really want a nice collection of photos of all of you!<br>\n<br>\n"
              + "If you would like to add the date to your calendar, <a href=\"http://strassis.com/strassis_wedding.ics\">download this calendar file</a>.<br>\n<br>\n"

              + "Thank you,<br>\n"
              + "❤ Nicole and Chris"
    })

    console.log(': ' + input.email);

  },


  'emailGuestlist': function() {
    // Must be admin.
    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    var guestlistString = "Guestlist: \n\n";

    // Get guestlist
    weddingGuests.find().fetch().forEach(function(curUser) {
      curUser.names.forEach(function(invitee) {
        if (invitee.rsvp)
          guestlistString += invitee.name  + ' - ' + invitee.comment + '\n'
      });
    });

    Email.send({
      to:       'rsvp@strassis.com',
      from:     'strassis.com <rsvp@strassis.com>',
      subject:  '#strassis: Guestlist Export',
      text:     guestlistString
    });

  },

  'sendGroupMail': function(input) {
    // Must be admin.
    if (!Meteor.userId() || !Meteor.user().admin) {
      throw new Meteor.Error('unauthorised', 'You are not authorised to make changes!');
    }

    this.unblock();
    console.log('# BEGIN EMAIL LOG');

    var emailCount = 0;
    var mailText = input.email;
    var customMail = '';
    // Only send reminder emails to those invited!
    // Only send reminder to people who haven't had one before
    weddingGuests.find({ 'names.rsvp': true }).fetch().forEach(function(curUser) {
      customMail = mailText.replace('%name%', curUser.names[0].name);

      Email.send({
        to:       curUser.email,
        from:     'strassis.com <rsvp@strassis.com>',
        subject:  '#strassis: ' + input.subject,
        text:     customMail
      });

      //console.log(curUser.email, input.subject, customMail);
      emailCount++;
    });

    return emailCount;

  }


});



/////////////////////////////////////////////////////////////////////////////////////////
// Enrollment & Reset Templates                                                        //
/////////////////////////////////////////////////////////////////////////////////////////
Accounts.emailTemplates.siteName  = '#strasssis'; //weddingData.findOne().publicData.appname;
Accounts.emailTemplates.from      = "strassis.com <rsvp@strassis.com>";

Accounts.emailTemplates.enrollAccount.subject = function (user) {
    return "#strassis: Wedding Invitation!";
};

Accounts.emailTemplates.enrollAccount.html = function(user, url) {
  var enrolledName = weddingGuests.findOne({account_id: user._id}).names[0].name;

  return "<strong>Hi " + enrolledName + "</strong>,<br>\n"
        + "You should have already received a wedding invitation from us &mdash; if not, it is on the way.<br>\n"
        + "Below you will find a link which will take you to our wedding website.<br>\n"
        + "When you click that link you will be asked to setup your password, your account is linked to this email address.<br>\n"
        + "Once you've set up your account, you will have access to RSVP and get all the details for the event. There is also a section where you can upload photos.<br>\n"
        + "Please login and RSVP as soon as possible.<br>\n<br>\n"
        + "The link is below:<br>\n<br>\n"
        + "<a href=\"" + url + "\">#strassis.com</a><br>\n<br>\n<br>\n"
        + "Thank you,<br>\n"
        + "❤ Nicole and Chris";
}

Accounts.emailTemplates.enrollAccount.text = function (user, url) {
  var enrolledName = weddingGuests.findOne({account_id: user._id}).names[0].name;

   return "Hi " + enrolledName + ",\n"
        + "You should have already received a wedding invitation from us - if not, it is on the way.\n"
        + "Below you will find a link which will take you to our wedding website.\n"
        + "When you click that link you will be asked to setup your password, your account is linked to this email address.\n"
        + "Once you've set up your account, you will have access to RSVP and get all the details for the event. There is also a section where you can upload photos.\n"
        + "Please login and RSVP as soon as possible.\n\n"
        + "The link is below:\n\n"
        + url + "\n\n\n"
        + "Thank you,\n"
        + "❤ Nicole and Chris";
};


Accounts.emailTemplates.resetPassword.subject = function (user) {
    return "#strassis: Reset Password!";
};

Accounts.emailTemplates.resetPassword.html = function(user, url) {
  var accountName = weddingGuests.findOne({account_id: user._id}).names[0].name;

  return "<strong>Hi " + accountName + "</strong>,<br>\n"
        + "To reset your account password just click the link below and set a new one.<br>\n<br>\n"
        + "<a href=\"" + url + "\">#strassis.com</a><br>\n<br>\n<br>\n"
        + "Thank you,<br>\n"
        + "❤ Nicole and Chris";
}

Accounts.emailTemplates.resetPassword.text = function (user, url) {
  var accountName = weddingGuests.findOne({account_id: user._id}).names[0].name;

   return "Hi " + accountName + ",\n"
        + "To reset your account password just click the link below and set a new one.\n\n"
        + url + "\n\n\n"
        + "Thank you,\n"
        + "❤ Nicole and Chris";
};
