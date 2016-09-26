Template.adminSettings.events({
  'submit': function(e) {
    e.preventDefault();
    
    Meteor.call('saveSettings', {
      appname:        e.target[0].value,
      title:          e.target[1].value,
      subtitle:       e.target[2].value,
      adminName:      e.target[3].value,
      adminEmail:     e.target[4].value,
      adminPhone:     e.target[5].value,
      showInvitation: e.target[6].value,
      showGuestbook:  e.target[7].value,
      showPhotos:     e.target[8].value,
      showSeating:    e.target[9].value
    }, function(error, result) {
      if (!error && result) {
        alert('Update Successful!');
      }
    });

  }
});
