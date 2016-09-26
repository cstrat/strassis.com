// Collections
weddingData   = new Mongo.Collection('data');
weddingGuests = new Mongo.Collection('guests');
weddingPhotos = new Mongo.Collection('photos');

/*

weddingData
 |
 |- publicData
 |      |- title
 |      |- subtitle
 |      |- imgHeader
 |      |- imgBackground
 |      |- adminName
 |      |- adminEmail
 |      |- adminPhone
 |- privateData
 |      |-
 |      |-
 |      |-
 |      |-
 |      |-
 |      |-
 |      |-
 |      |-
 |



weddingGuests
 |
 |- account_id
 |- email
 |- mobile
 |- names[]
     |- name
     |- rsvp
     |- comment
 |- dates
     |- added
     |- invited
 |- tags[x]
 |- invited (t/f)


weddingPhotos
 |
 |- account_id (uploader)
 |- dateUploaded
 |- status (approved/pending)
 |- thumbnail
 |- tags[x]

*/
