window.controller = undefined;
var recordedGestures = {}; // Save gestures into a hashmap

$(function() {
  window.controller = Leap.loop({optimizeHMD: true}, function(frame) {
    if(frame.hands.length === 1){
      // console.log(fingerHash(0, frame.hands[0].pinky));
      var hash = handToHash(frame.hands[0]);
      $.each(recordedGestures, function(recordedGestureHash, letter) {
        if (hashCompare(hash, recordedGestureHash)) {
          $('.current-letter').text(letter);
        }
      });
    }
  });
  $(document).keydown(function(e) {
    // Record gesture on spacebar press
    if(e.keyCode === 32){
      if(window.controller.lastValidFrame.hands.length !== 1){
        return alert('There are currently no hands in the frame. Try again.');
      }
      var letter = prompt('What letter are you trying to record?');
      if(letter){
        hash = handToHash(window.controller.lastValidFrame.hands[0]);
        recordedGestures[hash] = letter;
        $('.recorded-letters').append('<strong>' + letter + ': </strong>' + hash + '<br><br>');
      }
    }
  });
  setInterval(function() {
    $('.current-letter').text('');
  }, 5000);
});

// Converts hand position into a hash of it's position/orientation
function handToHash(hand) {
  var pitch = hand.pitch().toFixed(1)
  var roll = hand.roll().toFixed(1);
  var yaw = hand.yaw().toFixed(1);
  var hash = 'r:' + roll + 'p:' + pitch + 'y:' + yaw;
  $.each(hand.fingers, function(i, finger) {
    hash += fingerHash(i, finger);
  });
  return hash;
}

// Hash the finger positioning to detect more granular positioning
function fingerHash(i, finger){
  var hash = 'f' + i + ':';
  $.each(finger.direction, function(j, direction) {
    hash += direction.toFixed(1);
  });
  return hash;
}

function hashCompare(h1, h2) {
  var h1_values = h1.match(/(-?[0-9]\.[0-9])/ig);
  var h2_values = h2.match(/(-?[0-9]\.[0-9])/ig);
  var delta = 0;

  for (var h1_val, h2_val, this_delta, i = h1.length - 1; i >= 0; i--) {
    h1_val = Number(h1_values[i]);
    h2_val = Number(h2_values[i]);
    this_delta = Math.abs(h1_val - h2_val);
    delta += this_delta;

    if(delta > 1 || this_delta > 0.4){
      return false;
    }
  }
  return true;
}
