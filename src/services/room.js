export function sendMessage(db, id, msgData) {
  db.collection('rooms')
    .where('id', '==', id)
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        var data = doc.data();

        db.collection('rooms')
          .doc(doc.id)
          .update({ messages: data.messages.concat(msgData) });
      });
    });
}
