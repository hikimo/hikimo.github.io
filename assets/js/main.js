$(window).bind('load', () => {
  $('.pre-loader').fadeOut('normal');
});

new TypeIt('#heroTitle', {
  speed: 100,
  loop: true,
  waitUntilVisible: true
}).type("Hi, I'm Hikki!")
.pause(1000)
.delete()
.pause(500)
.type("I'm a Front-end Developer..")
.pause(1000)
.delete()
.pause(500)
.type("Also, I'm glad to help you!")
.pause(1000)
.go();

// Fixed navbar
$(window).on('scroll', () => {
  let scroll = $(window).scrollTop();

  if(scroll > $(window).height() * 1.00) {
    $('.navbar').addClass('fixed-nav');
    $('.floating-button').fadeIn('normal');
  } else {
    $('.navbar').removeClass('fixed-nav');
    $('.floating-button').fadeOut('normal');
  }
})

function openMenu() {
  if ($('.navbar-toggler').hasClass('collapsed'))
    $('.ham').removeClass('active');
  $('.ham').toggleClass('active');
}

function sendMail() {
  let mail = $('#email').val();
  let subject = $('#subject').val();
  let message = $('#message').val();
  if(mail == "" || subject == "" || message == "") {
    $('.toast').toast({delay: 3500});
    $('.toast').toast('show');
  } else {
    window.location.href = 'mailto:ranggaprastio123@gmail.com?subject=' +
    subject + ' from ( ' + mail + ' )&body=' + message;
  }
}