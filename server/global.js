/////////////////////////////////////////////////////////////////////////////////////////
// Override the enroll account URL                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
Accounts.urls.enrollAccount = function (token) {
    return Meteor.absoluteUrl('enroll/' + token);
};

/////////////////////////////////////////////////////////////////////////////////////////
// Setup default account                                                               //
/////////////////////////////////////////////////////////////////////////////////////////

// Default user account
if (Meteor.users.find().count() == 0) {
  var userID = Accounts.createUser({ email: 'neester@gmail.com' });
  Accounts.sendEnrollmentEmail(userID);
  Meteor.users.update(userID, {$set: { admin: true } });
  
}

// Default Wedding Data
if (weddingData.find().count() == 0) {
  weddingData.insert({});
}


