function getJSON(url, callback, err) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = JSON.parse(request.responseText);
      callback(data);
    } else {
      // We reached our target server, but it returned an error
      if (err) err();
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    if (err) err();
  };

  request.send();
}

module.exports = getJSON;