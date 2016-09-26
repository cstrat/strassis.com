
Template.adminContent.onCreated(function() {
  var self = this;
  self.textContent = new ReactiveVar({ md: '', dirty: false });
});

Template.adminContent.onRendered(function() {
  var suggestedHeight = $(window).height() - $('textarea').offset().top - ($('button').outerHeight() * 3);
  if (suggestedHeight < 300) {
    suggestedHeight = 300;
  }
  $('textarea').height(suggestedHeight);
});

Template.adminContent.helpers({

  contentPreview: function() {
    return Template.instance().textContent.get().md;
  }

});

Template.adminContent.events({

  'keyup textarea': function(e) {
    return Template.instance().textContent.set({ md: e.target.value, dirty: true });
  },

  'change select': function(e) {
    switch (e.target.value) {
      case 'blank':
        Template.instance().textContent.set({ md: '', dirty: false });
        $('textarea').val('');

      break;
      case 'welcome':
        var loadText = weddingData.findOne().publicData.welcomePage;
        Template.instance().textContent.set({ md: loadText, dirty: false });
        $('textarea').val(loadText);

      break;
      case 'invite':
        var loadText = weddingData.findOne().privateData.invitationPage;
        Template.instance().textContent.set({ md: loadText, dirty: false });
        $('textarea').val(loadText);

      break;
    }
  },


  'click button': function() {
    // Save the content online!
    Meteor.call('saveContent', {
      pageName:   $('select').val(),
      newContent: $('textarea').val()
    }, function(error) {
      if (error) {
        alert(error);
      }
    })

  }

});