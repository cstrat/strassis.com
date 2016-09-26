
Template.adminTop.onCreated(function() {
  document.title = weddingData.findOne().publicData.appname + " [admin]";
});
