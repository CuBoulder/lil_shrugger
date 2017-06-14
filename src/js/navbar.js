
/**
 * Import navbar HTML and insert into DOM of pages.
 *
 * @type {Element}
 */
var link = document.querySelector('link[href="src/partials/navbar.html"]');
var content = link.import;
var el = content.querySelector('.navbar.navbar-default');
document.querySelector('.atlas-navbar').appendChild(el.cloneNode(true));


/**
 * Sets up routing for the navbar menu.
 *
 * @type {Vue}
 */
var navbarRoutes = new Vue({
  el: '#routes',
  data: {
    routes: routes
  }
});

/**
 * Places environment label in navbar.
 */
$(document).ready(function () {
  $(".btn-select").each(function (e) {
    var value = $(this).find("ul li.selected").html();
    if (value != undefined) {
      $(this).find(".btn-select-input").val(value);
      $(this).find(".btn-select-value").html(value);
    }
  });
});

/**
 * Changes selected environment in navbar.
 */
$(document).on('click', '.btn-select', function (e) {
  e.preventDefault();
  var ul = $(this).find("ul");
  if ($(this).hasClass("active")) {
    if (ul.find("li").is(e.target)) {
      var target = $(e.target);
      target.addClass("selected").siblings().removeClass("selected");
      var value = target.html();
      $(this).find(".btn-select-input").val(value);
      $(this).find(".btn-select-value").html(value);
      getSiteRecords(value);
    }
    ul.hide();
    $(this).removeClass("active");
  }
  else {
    $('.btn-select').not(this).each(function () {
      $(this).removeClass("active").find("ul").hide();
    });
    ul.slideDown(300);
    $(this).addClass("active");
  }
});

/**
 * Hides and shows environment select list on navebar.
 */
$(document).on('click', function (e) {
  var target = $(e.target).closest(".btn-select");
  if (!target.length) {
    $(".btn-select").removeClass("active").find("ul").hide();
  }
});
