///////////////////////////////////////////////////////////////////////////////
// Public Routes                                                             //
///////////////////////////////////////////////////////////////////////////////


FlowRouter.route('/enroll/:token', {
  subscriptions: function() {
    // Subscribe to the Public Wedding Data
    this.register('weddingData', Meteor.subscribe('data'));
  },
  
  action: function() {
    BlazeLayout.render('publicLayout', { top:  "publicTop",
                                        main: "enroll"});
  }
});

var publicRoutes = FlowRouter.group({
  subscriptions: function() {
    // Subscribe to the Public Wedding Data
    this.register('weddingData', Meteor.subscribe('data'));

  },

  triggersEnter: [
    function(context, redirect) {
      // Check if logged in, and go next()
      if (Meteor.userId()) {
        redirect("/invitation");
      }
    }
  ]
});

publicRoutes.route('/', {
  action: function() {
    BlazeLayout.render('publicLayout', { top:  "publicTop",
                                        main: "welcome"});
  }
});

publicRoutes.route('/login', {
  action: function() {
    BlazeLayout.render('publicLayout', { top:  "publicTop",
                                        main: "login"});
  }
});

publicRoutes.route('/reset', {
  action: function() {
    BlazeLayout.render('publicLayout', { top:  "publicTop",
                                        main: "reset"});
  }
});




///////////////////////////////////////////////////////////////////////////////
// Private Routes                                                            //
///////////////////////////////////////////////////////////////////////////////

var privateRoutes = FlowRouter.group({
  subscriptions: function() {
    // Subscribe to the Public Wedding Data
    this.register('weddingData',    Meteor.subscribe('data'));
    this.register('weddingGuests',  Meteor.subscribe('guests'));
    this.register('weddingPhotos',  Meteor.subscribe('photos'));

  },

  triggersEnter: [
    function(context, redirect) {
      // Check if logged in, and go next()
      if (!Meteor.userId()) {
        redirect('/login');
      }
    }
  ]
});

privateRoutes.route('/invitation', {
  action: function() {
    BlazeLayout.render('privateLayout', {  top:    "privateTop", 
                                          main:   "invitation",
                                          bottom: "privateBottom" });
  }
});

privateRoutes.route('/photos', {
  action: function() {
    BlazeLayout.render('privateLayout', {  top:    "privateTop",
                                          main:   "photos",
                                          bottom: "privateBottom" });
  }
});

privateRoutes.route('/guestbook', {
  action: function() {
    BlazeLayout.render('privateLayout', {  top:    "privateTop",
                                          main:   "guestbook",
                                          bottom: "privateBottom" });
  }
});

privateRoutes.route('/seating', {
  action: function() {
    BlazeLayout.render('privateLayout', {  top:    "privateTop",
                                          main:   "seating",
                                          bottom: "privateBottom" });
  }
});

privateRoutes.route('/logout', {
  action: function() {
    BlazeLayout.render('privateLayout', {  top:    "privateTop",
                                          main:   "logout",
                                          bottom: "" });
  }
});




///////////////////////////////////////////////////////////////////////////////
// Admin Routes                                                              //
///////////////////////////////////////////////////////////////////////////////

var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  subscriptions: function() {
    // Subscribe to the Public Wedding Data
    this.register('weddingData',    Meteor.subscribe('data',    {admin: true}));
    this.register('weddingGuests',  Meteor.subscribe('guests',  {admin: true}));
    this.register('weddingPhotos',  Meteor.subscribe('photos',  {admin: true}));
  },

  triggersEnter: [
    function(context, redirect) {
      if (!Meteor.userId()) {
        redirect('/login');
      }else if (!Meteor.users.findOne().admin) {
        redirect('/invitation');
      }
    }
  ]
});

adminRoutes.route('/', {
  action: function() {
    BlazeLayout.render('adminLayout', {  top:  "adminTop",
                                        main: "adminOverview" });
  }
});

adminRoutes.route('/guestbook', {
  action: function() {
    BlazeLayout.render('adminLayout', {  top:  "adminTop",
                                        main: "adminGuestbook" });
  }
});

adminRoutes.route('/guestlist', {
  action: function() {
    BlazeLayout.render('adminLayout', {  top:  "adminTop",
                                        main: "adminGuestlist" });
  }
});

adminRoutes.route('/content', {
  action: function() {
    BlazeLayout.render('adminLayout', {  top:  "adminTop",
                                        main: "adminContent" });
  }
});

adminRoutes.route('/photos', {
  action: function() {
    BlazeLayout.render('adminLayout', {  top:  "adminTop",
                                        main: "adminPhotos" });
  }
});

adminRoutes.route('/settings', {
  action: function() {
    BlazeLayout.render('adminLayout', {  top:  "adminTop",
                                        main: "adminSettings" });
  }
});




///////////////////////////////////////////////////////////////////////////////
// Not Found Route                                                           //
///////////////////////////////////////////////////////////////////////////////
FlowRouter.notFound = {
  action: function() {
    // 404 Page
    BlazeLayout.render('publicLayout', { top:  "publicTop",
                                        main: "notFound"});
  }
};


///////////////////////////////////////////////////////////////////////////////
// Account Action Activities                                                 //
///////////////////////////////////////////////////////////////////////////////

Accounts.onResetPasswordLink(function(token, done) {
  FlowRouter.go('/enroll/' + token);
});

