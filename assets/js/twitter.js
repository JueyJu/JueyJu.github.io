window.twttr = (function(d, s, id) {
  var t, js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);
  return window.twttr || (t = {
    _e: [],
    ready: function(f) {
      t._e.push(f)
    }
  });
}(document, "script", "twitter-wjs"));
  
$(document).ready(function(){
  $('.modal-body a').hover(function(){
    $('.modal-body a')
    .css('background-color', '#0c7abf');
  },
  function(){
    $('.modal-body a')
    .css('background-color', '#1b95e0');
  })
})