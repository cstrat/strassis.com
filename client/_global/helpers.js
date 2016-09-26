///////////////////////////////////////////////////////////////////////////////
// Global Helpers                                                            //
///////////////////////////////////////////////////////////////////////////////



// subReady - true/false for subscriptions being ready
Template.registerHelper('_subReady', function(subName) {
  if(subName) {
    return FlowRouter.subsReady(subName);
  } else {
    return FlowRouter.subsReady();
  }
});


Template.registerHelper('_weddingData', function() {
  return weddingData.findOne();
});

Template.registerHelper('_isEqual', function(val1, val2) {
  return (val1 == val2) ? {selected: 'selected'} : null;
});

Template.registerHelper('_fromNow', function(dateStr) {
  if (dateStr && moment(dateStr).isValid()) {
    return moment(dateStr).fromNow();
  }else{
    return ''; 
  }
});

Template.registerHelper('_name', function(account_id) {
  var guestcard = weddingGuests.findOne({account_id: account_id});
  return (guestcard) ? guestcard.names[0].name : '[Not Found]';
});
