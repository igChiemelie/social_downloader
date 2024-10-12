M.AutoInit();
$('input#articleTitle').characterCounter();
// $('.datepicker').pickadate({
//     selectMonths: true,
//     selectYears: 200, 
//     format: 'yyyy/mm/dd'
// });

$('.dropdown-trigger').dropdown({
    coverTrigger: false
});

$(document).ready(function() {
    
    $(".tap-target").tapTarget();
    $(".open-tap-target").click(function() {
      $(".tap-target").tapTarget("open");
    });
    // $(".close-tap-target").click(function() {
    //   $(".tap-target").tapTarget("close");
    // });
    $("#menu").click(function() {
      $(".tap-target").tapTarget("open");
    //   $(".tap-target").tapTarget("open");
    });
});
  
  
let picka = $(".datepicker").datepicker({
    selectMonths: true,
    selectYears: 1,
    format: 'yyyy-mm-d',
    setDefaultDate: true,
});

$('#goToReg').on('click', (e) => {
    e.preventDefault();

    $('#loginCard').addClass('hide');
    $('#regCard').removeClass('hide');
});
$('#goToLogin').on('click', (e) => {
    e.preventDefault();

    $('#regCard').addClass('hide');
    $('#loginCard').removeClass('hide');
});

