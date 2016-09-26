Template.adminPhotos.helpers({
  photoList: function() {
    return weddingPhotos.find({}, { sort: { date: -1 } });
  },

  photoClass: function() {
    if (this.deleted) return 'photo-removed';
    if (this.public)  return 'photo-public';
    if (this.ready)   return 'photo-ready';
    return 'photo-error';
  },

  isDeleted: function() {
    return (this.deleted) ? true : false;
  }

});

Template.adminPhotos.events({
  'click .delete': function() {
    Meteor.call('deletePhoto', { photo_id: this._id });
  },

  'click .public': function() {
    Meteor.call('togglePhoto', { photo_id: this._id });
  },

  'click .rotate': function() {
    Meteor.call('rotatePhoto', { photo_id: this._id });
  },

  'click .remove': function() {
    Meteor.call('removePhoto', { photo_id: this._id });
  },

});