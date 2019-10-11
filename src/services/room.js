export function sendMessage(db, id, msgData) {
  db.collection('rooms')
    .doc(id)
    .get()
    .then(function(doc) {
      var data = doc.data();

      db.collection('rooms')
        .doc(doc.id)
        .update({ messages: data.messages.concat(msgData) });
    });
}
