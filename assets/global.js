$.cookie = function (key, value, options) {
   if (
      arguments.length > 1 &&
      (!/Object/.test(Object.prototype.toString.call(value)) ||
         value === null ||
         value === undefined)
   ) {
      options = $.extend({}, options);
      if (value === null || value === undefined) {
         options.expires = -1;
      }
      if (typeof options.expires === "number") {
         var days = options.expires,
            t = (options.expires = new Date());
         t.setDate(t.getDate() + days);
      }
      value = String(value);
      return (document.cookie = [
         encodeURIComponent(key),
         "=",
         options.raw ? value : encodeURIComponent(value),
         options.expires ? "; expires=" + options.expires.toUTCString() : "",
         options.path ? "; path=" + options.path : "",
         options.domain ? "; domain=" + options.domain : "",
         options.secure ? "; secure" : "",
      ].join(""));
   }
   options = value || {};
   var decode = options.raw
      ? function (s) {
           return s;
        }
      : decodeURIComponent;
   var pairs = document.cookie.split("; ");
   for (var i = 0, pair; (pair = pairs[i] && pairs[i].split("=")); i++) {
      if (decode(pair[0]) === key) return decode(pair[1] || "");
   }
   return null;
};

if (typeof Shopify === "undefined") {
   Shopify = {};
}
if (!Shopify.formatMoney) {
   Shopify.formatMoney = function (cents, format) {
      var value = "",
         placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
         formatString = format || this.money_format;
      if (typeof cents == "string") {
         cents = cents.replace(".", "");
      }

      function defaultOption(opt, def) {
         return typeof opt == "undefined" ? def : opt;
      }

      function formatWithDelimiters(number, precision, thousands, decimal) {
         precision = defaultOption(precision, 2);
         thousands = defaultOption(thousands, ",");
         decimal = defaultOption(decimal, ".");
         if (isNaN(number) || number == null) {
            return 0;
         }
         number = (number / 100.0).toFixed(precision);
         var parts = number.split("."),
            dollars = parts[0].replace(
               /(\d)(?=(\d\d\d)+(?!\d))/g,
               "$1" + thousands
            ),
            cents = parts[1] ? decimal + parts[1] : "";
         return dollars + cents;
      }
      switch (formatString.match(placeholderRegex)[1]) {
         case "amount":
            value = formatWithDelimiters(cents, 2);
            break;
         case "amount_no_decimals":
            value = formatWithDelimiters(cents, 0);
            break;
         case "amount_with_comma_separator":
            value = formatWithDelimiters(cents, 2, ".", ",");
            break;
         case "amount_no_decimals_with_comma_separator":
            value = formatWithDelimiters(cents, 0, ".", ",");
            break;
      }
      return formatString.replace(placeholderRegex, value);
   };
}

window.novtheme = window.novtheme || {};
var isLoggedIn;
isLoggedIn = false;
var current_width = $(window).width(),
   min_width = 768,
   responsive_mobile = current_width < min_width,
   flag_sticky = false;

var wishListsArr = localStorage.getItem("wishListsArr")
   ? JSON.parse(localStorage.getItem("wishListsArr"))
   : [];
localStorage.setItem("wishListsArr", JSON.stringify(wishListsArr));
if (wishListsArr.length) {
   wishListsArr = JSON.parse(localStorage.getItem("wishListsArr"));
}
novtheme.init = function () {
   novtheme.cacheSelectors();
   novtheme.eventBlockCart();
   novtheme.hoverAccount();
   novtheme.popupCart();
   novtheme.NoneThumbnailProductDetail();
   novtheme.VerticalThumbnailProductDetail();
   novtheme.ThumbnailProductDetail();
   novtheme.RelatedBlog();
   novtheme.load_canvas_menu();
   novtheme.NovTogglePage();
   novtheme.galery_image();
   novtheme.click_button_canvas_menu();
   novtheme.productImageSwitch();
   novtheme.goToTop();
   novtheme.goToTopMobile();
   novtheme.NovHeightBoxContent();
   novtheme.MenuSidebar();
   novtheme.NovToggleAction();
   novtheme.NovToggleSearch();
   novtheme.NovEventClickSearchMobile();
   novtheme.Product__Thumnail();
   novtheme.Product_Megamenu();
   novtheme.NovMediumToggle();
   novtheme.HideShowPassword();
   novtheme.tooltip();
   novtheme.CollectionPage();
   novtheme.NovAccordion();
   novtheme.variantName();
   novtheme.RunInstagram();
   if (current_width >= 992) {
      novtheme.StickyHeader(true);
      flag_sticky = true;
   }
};

//Tooltip, activated by hover event
novtheme.tooltip = function () {
   $("body").tooltip({
      selector: "[data-toggle='tooltip']",
      container: "body",
   });
};
novtheme.swapChildren = function (obj1, obj2) {
   var temp = obj2.children().detach();
   obj2.empty().append(obj1.children().detach());
   obj1.append(temp);
};
novtheme.toggleMobileStyles = function () {
   if (responsive_mobile) {
      $("*[id^='_desktop_']").each(function (idx, el) {
         var target = $("#" + el.id.replace("_desktop_", "_mobile_"));
         if (target) {
            novtheme.swapChildren($(el), target);
         }
      });
   } else {
      $("*[id^='_mobile_']").each(function (idx, el) {
         var target = $("#" + el.id.replace("_mobile_", "_desktop_"));
         if (target) {
            novtheme.swapChildren($(el), target);
         }
      });
   }
};
novtheme.toggleSticky = function (action) {
   if (action == true) {
      $("*[class^='contentsticky_']").each(function (idx, el) {
         var target = $(
            "." +
               el.classList["0"].replace("contentsticky_", "contentstickynew_")
         );
         if (target.length) {
            novtheme.swapChildren($(el), target);
         }
      });
   } else {
      $("*[class^='contentstickynew_']").each(function (idx, el) {
         var target = $(
            "." +
               el.classList["0"].replace("contentstickynew_", "contentsticky_")
         );
         if (target.length) {
            novtheme.swapChildren($(el), target);
         }
      });
   }
};

novtheme.StickyHeader = function (flag_sticky) {
   if ($(".site-header").hasClass("sticky-menu")) {
      if (flag_sticky == true) {
         var time;
         var height = $(".site-header").height();
         var flag = true;
         $(window).scroll(function () {
            if (time) clearTimeout(time);
            time = setTimeout(function () {
               if ($(window).scrollTop() > height) {
                  if (flag == true) {
                     $("#header-sticky").addClass("sticky-menu-active");
                     $(".site-header").css("height", height);
                     novtheme.toggleSticky(true);
                     flag = false;
                  }
               } else {
                  if (flag == false) {
                     $("#header-sticky").removeClass("sticky-menu-active");
                     novtheme.toggleSticky(false);
                     $(".site-header").css("height", "auto");
                     flag = true;
                  }
               }
            }, 100);
         });
      }
   }
};
var flag_sticky = false;
$(window).on("resize", function () {
   var _cw = current_width;
   var _mw = min_width;
   var _w = $(window).width();
   var _toggle = (_cw >= _mw && _w < _mw) || (_cw < _mw && _w >= _mw);
   responsive_mobile = _cw >= _mw;
   current_width = _w;
   if (_toggle) {
      novtheme.toggleMobileStyles();
      novtheme.load_canvas_menu();
      novtheme.NovTogglePage();
      novtheme.NovHeightBoxContent();
      novtheme.popupCart();
   }
   if (current_width <= 768) {
      if (flag_sticky == true) {
         novtheme.toggleSticky(false);
         $("#header-sticky").removeClass("sticky-menu-active");
      }
   } else {
   }
});
novtheme.popupCart = function (e) {
   $(document).on("click", ".popupCartClose", function (e) {
      e.preventDefault();
      $("#popup-Cart .jsPopupview").html("");
      $("#popup-Cart").modal("toggle");
   });
};
novtheme.click_button_canvas_menu = function () {
   $("#show-megamenu").on("click", function () {
      if ($(".canvas-menu").hasClass("active")) {
         $(".canvas-menu").removeClass("active");
         $("body").removeClass("canvasmenu-right");
         $(this).removeClass("close");
      } else {
         $(".canvas-menu").addClass("active");
         $("body").addClass("canvasmenu-right");
         $(this).addClass("close");
      }
      return false;
   });
};
novtheme.load_canvas_menu = function () {
   var $main_menu = $(".site-nav", "#AccessibleNav");
   if (current_width < 1366) {
      if ($("#canvas-main-menu").length < 1 && $main_menu.length > 0) {
         var $menu = $main_menu.parent().clone();
         $menu.attr("id", "canvas-main-menu");
         $($menu).find(".menu").removeAttr("id");
         $(".canvas-menu").append($menu);
         $menu.mmenu({
            offCanvas: false,
            navbar: {
               title: false,
            },
         });
         novtheme.remove_canvas_menu();
      }
   }
};
novtheme.remove_canvas_menu = function () {
   $(".canvas-header-box .close-box, .canvas-overlay").on("click", function () {
      $(".canvas-menu").removeClass("active");
      $("body").removeClass("canvasmenu-right");
      return false;
   });
};
novtheme.NoneThumbnailProductDetail = function () {
   if ($("html").hasClass("lang-rtl")) rtl = true;
   else rtl = false;
   var autoplay = $("#productThumbs .owl-carousel").data("autoplay");
   var autoplaytimeout = $("#productThumbs .owl-carousel").data(
      "autoplaytimeout"
   );
   var items = $("#productThumbs .owl-carousel").data("items");
   var margin = $("#productThumbs .owl-carousel").data("margin");
   var nav = $("#productThumbs .owl-carousel").data("nav");
   var dots = $("#productThumbs .owl-carousel").data("dots");
   var loop = $("#productThumbs .owl-carousel").data("loop");
   var items_tablet = $("#productThumbs .owl-carousel").data("items_tablet")
      ? $("#productThumbs .owl-carousel").data("items_tablet")
      : 3;
   var items_mobile = $("#productThumbs .owl-carousel").data("items_mobile")
      ? $("#productThumbs .owl-carousel").data("items_mobile")
      : 1;
   var center = $("#productThumbs .owl-carousel").data("center")
      ? $("#productThumbs .owl-carousel").data("center")
      : false;
   var start = $("#productThumbs .owl-carousel").data("start")
      ? $("#productThumbs .owl-carousel").data("start")
      : 0;
   $("#productThumbs .owl-carousel").owlCarousel({
      navText: [
         '<i class="zmdi zmdi-chevron-left"></i>',
         '<i class="zmdi zmdi-chevron-right"></i>',
      ],
      lazyLoad: true,
      lazyContent: true,
      loop: loop,
      autoplay: autoplay,
      autoplayTimeout: autoplaytimeout,
      items: items,
      margin: margin,
      rtl: rtl,
      dots: dots,
      nav: nav,
      center: center,
      responsive: {
         0: {
            items: 1,
            center: center,
            margin: 0,
         },
         576: {
            items: items_mobile,
            center: center,
            margin: 10,
         },
         768: {
            items: items_tablet,
            margin: 10,
         },
         992: {
            items: items,
            margin: margin,
         },
         1200: {
            items: items,
            startPosition: start,
            margin: margin,
         },
      },
   });
};
novtheme.VerticalThumbnailProductDetail = function () {
   if ($("html").hasClass("lang-rtl")) var rtl = true;
   else var rtl = false;
   $(".thumb_vertical_slick").slick({
      nextArrow:
         '<div class="arrow-next"><i class="zmdi zmdi-chevron-down"></i></div>',
      prevArrow:
         '<div class="arrow-prev"><i class="zmdi zmdi-chevron-up"></i></div>',
      infinite: false,
      slidesToShow: 5,
      slidesToScroll: 5,
      vertical: true,
      verticalSwiping: true,
      arrows: false,
      responsive: [
         {
            breakpoint: 1200,
            settings: {
               slidesToShow: 4,
               slidesToScroll: 4,
               arrows: false,
            },
         },
         {
            breakpoint: 992,
            settings: {
               arrows: false,
               slidesToShow: 4,
               slidesToScroll: 4,
            },
         },
         {
            breakpoint: 768,
            settings: {
               vertical: false,
               verticalSwiping: false,
               arrows: false,
               slidesToShow: 4,
               slidesToScroll: 4,
            },
         },
         {
            breakpoint: 480,
            settings: {
               vertical: false,
               verticalSwiping: false,
               arrows: false,
               slidesToShow: 3,
               slidesToScroll: 3,
            },
         },
      ],
   });
   if ($(window).width() > 991 && $(".template-product").length > 0) {
      $(window).on("mousewheel DOMMouseScroll wheel", function (e) {
         $(".thumb_vertical .proFeaturedImage .item.act").each(function () {
            var item = $(this),
               p = item.data("position"),
               hd = item.height() / 2,
               hu = item.height() - 150,
               srt = $(window).scrollTop(),
               y = e.originalEvent.deltaY,
               offset_top = item.offset().top;
            if (y > 0) {
               if (p < $(".proFeaturedImage .item").length) {
                  var npd = p + 1;
               } else {
                  var npd = p;
               }
               if (srt > offset_top + hd) {
                  item.removeClass("act");
                  $(
                     '.proFeaturedImage .item[data-position="' + npd + '"]'
                  ).addClass("act");
                  $('.thumbItem[data-position="' + p + '"]').removeClass(
                     "active"
                  );
                  $('.thumbItem[data-position="' + npd + '"]').addClass(
                     "active"
                  );
               }
            } else {
               if (p > 1) {
                  var npu = p - 1;
               } else {
                  var npu = p;
               }
               if (srt < offset_top - hd) {
                  item.removeClass("act");
                  $(
                     '.proFeaturedImage .item[data-position="' + npu + '"]'
                  ).addClass("act");
                  $('.thumbItem[data-position="' + p + '"]').removeClass(
                     "active"
                  );
                  $('.thumbItem[data-position="' + npu + '"]').addClass(
                     "active"
                  );
               }
            }
         });
      });
      $(".product-thumb_vertical .thumbItem").click(function () {
         var p = $(this).data("position");
         $(".product-thumb_vertical .thumbItem").removeClass("active");
         $(this).addClass("active");
         $(".proFeaturedImage .item").removeClass("act");
         $('.proFeaturedImage .item[data-position="' + p + '"]').addClass(
            "act"
         );
         var ost = $(".proFeaturedImage .item.act").offset().top;
         $("body,html").animate({ scrollTop: ost - 30 }, "normal");
      });
   }
   if ($(window).width() < 992) {
      if ($(document).width() <= 991) {
         $(".thumb_vertical .proFeaturedImage")
            .slick({
               slide: ".item",
               infinite: false,
               slidesToShow: 1,
               slidesToScroll: 1,
               adaptiveHeight: true,
            })
            .on("afterChange", function (e, o) {
               $("iframe").each(function () {
                  $(this)[0].contentWindow.postMessage(
                     '{"event":"command","func":"' +
                        "stopVideo" +
                        '","args":""}',
                     "*"
                  );
               });
               $("video").trigger("pause");
            });
         $(".thumb_vertical .proFeaturedImage").on(
            "afterChange",
            function (event, slick, currentSlide) {
               $("#productThumbs .thumb_vertical_slick").slick(
                  "slickGoTo",
                  currentSlide
               );
               $("#productThumbs .thumb_vertical_slick")
                  .find(".slick-slide.item-active")
                  .removeClass("item-active");
               $("#productThumbs .thumb_vertical_slick")
                  .find('.slick-slide[data-slick-index="' + currentSlide + '"]')
                  .addClass("item-active");
            }
         );

         $(".thumb_vertical .thumb_vertical_slick").on(
            "click",
            ".slick-slide",
            function (event) {
               event.preventDefault();
               var goToSingleSlide = $(this).data("slick-index");
               $(".thumb_vertical .proFeaturedImage").slick(
                  "slickGoTo",
                  goToSingleSlide
               );
            }
         );
      }
   }
};
novtheme.ThumbnailProductDetail = function () {
   var $FeaturedImage = $(".FeaturedImage_slick");
   var $ThumbImage = $("#productThumbs .thumb_slick");
   if ($("html").hasClass("lang-rtl")) var rtl = true;
   else var rtl = false;
   $FeaturedImage.slick({
      slide: ".item",
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: false,
      adaptiveHeight: true,
      infinite: false,
      useTransform: true,
      speed: 400,
      cssEase: "cubic-bezier(0.77, 0, 0.18, 1)",
      rtl: rtl,
   });

   var autoplay = $ThumbImage.data("autoplay"),
      autoplaytimeout = $ThumbImage.data("autoplaytimeout"),
      infinite = $ThumbImage.data("loop"),
      dots = $ThumbImage.data("dots"),
      nav = $ThumbImage.data("nav"),
      loop = $ThumbImage.data("loop"),
      fade = $ThumbImage.data("fade"),
      vertical = $ThumbImage.data("vertical"),
      verticalSwiping = $ThumbImage.data("vertical"),
      items = $ThumbImage.data("items"),
      items_lg = $ThumbImage.data("items_lg"),
      items_md = $ThumbImage.data("items_md"),
      items_sm = $ThumbImage.data("items_sm"),
      items_xs = $ThumbImage.data("items_xs");
   $ThumbImage
      .on("init", function (event, slick) {
         $(this).find(".slick-slide.slick-current").addClass("active");
      })
      .slick({
         slide: ".item",
         infinite: infinite,
         slidesToShow: items,
         slidesToScroll: 2,
         dots: dots,
         arrows: nav,
         rtl: rtl,
         vertical: vertical,
         verticalSwiping: verticalSwiping,
         focusOnSelect: false,
         responsive: [
            {
               breakpoint: 1920,
               settings: {
                  slidesToShow: items,
                  slidesToScroll: items,
               },
            },
            {
               breakpoint: 1200,
               settings: {
                  slidesToShow: items_lg,
                  slidesToScroll: items_lg,
               },
            },
            {
               breakpoint: 992,
               settings: {
                  slidesToShow: items_md,
                  slidesToScroll: items_md,
               },
            },
            {
               breakpoint: 768,
               settings: {
                  slidesToShow: items_sm,
                  slidesToScroll: items_sm,
                  verticalSwiping: false,
               },
            },
            {
               breakpoint: 576,
               settings: {
                  slidesToShow: items_xs,
                  slidesToScroll: items_xs,
                  vertical: false,
                  verticalSwiping: false,
               },
            },
         ],
      });

   $FeaturedImage.on("afterChange", function (event, slick, currentSlide) {
      $ThumbImage.slick("slickGoTo", currentSlide);
      $ThumbImage.find(".slick-slide.active").removeClass("active");
      $ThumbImage
         .find('.slick-slide[data-slick-index="' + currentSlide + '"]')
         .addClass("active");
      $("iframe").each(function () {
         $(this)[0].contentWindow.postMessage(
            '{"event":"command","func":"' + "stopVideo" + '","args":""}',
            "*"
         );
      });
      $("video").trigger("pause");
      // Type thumb all
      $(".thumb_all .thumbItem").removeClass("active");
      $('.thumb_all .thumbItem[data-position="' + currentSlide + '"]').addClass(
         "active"
      );
   });

   $ThumbImage.on("click", ".slick-slide", function (event) {
      event.preventDefault();
      var goToSingleSlide = $(this).data("slick-index");
      $FeaturedImage.slick("slickGoTo", goToSingleSlide);
   });
   // Type thumb all
   $(".thumb_all .thumbItem").on("click", function (event) {
      event.preventDefault();
      var position = $(this).data("position");
      $FeaturedImage.slick("slickGoTo", position);
   });
   $("[data-swatch-img]").on("click", function (event) {
      var dataimage = $(this).attr("data-img_src");
      var goToImage = $FeaturedImage
         .find('[data-image_src="' + dataimage + '"]')
         .data("slick-index");
      $FeaturedImage.slick("slickGoTo", goToImage);
   });
};
novtheme.RelatedBlog = function () {
   if ($("html").hasClass("lang-rtl")) rtl = true;
   else rtl = false;
   var $this = $(".BlogRelated .owl-carousel");
   var autoplay = $($this).data("autoplay");
   var autoplaytimeout = $($this).data("autoplaytimeout");
   var items = $($this).data("items");
   var margin = $($this).data("margin");
   var nav = $($this).data("nav");
   var dots = $($this).data("dots");
   var loop = $($this).data("loop");
   var items_tablet = $($this).data("items_tablet")
      ? $($this).data("items_tablet")
      : 3;
   var items_mobile = $($this).data("items_mobile")
      ? $($this).data("items_mobile")
      : 1;
   var center = $($this).data("center") ? $($this).data("center") : false;
   var start = $($this).data("start") ? $($this).data("start") : 0;
   $($this).owlCarousel({
      navText: [
         '<i class="fa fa-long-arrow-left"></i>',
         '<i class="fa fa-long-arrow-right"></i>',
      ],
      lazyLoad: true,
      lazyContent: true,
      loop: loop,
      autoplay: autoplay,
      autoplayTimeout: autoplaytimeout,
      items: items,
      margin: margin,
      rtl: rtl,
      dots: dots,
      nav: nav,
      responsive: {
         0: {
            items: items_mobile,
            center: center,
            margin: 15,
         },
         768: {
            items: items_tablet,
            margin: 15,
         },
         992: {
            items: items,
            margin: margin,
         },
         1200: {
            items: items,
            startPosition: start,
            margin: margin,
         },
      },
   });
};
novtheme.callbackReview = function () {
   if ($(".shopify-product-reviews-badge").length > 0) {
      return (
         window.SPR.registerCallbacks(),
         window.SPR.initRatingHandler(),
         window.SPR.initDomEls(),
         window.SPR.loadProducts(),
         window.SPR.loadBadges()
      );
   }
};
novtheme.productPage = function (options) {
   var moneyFormat = options.money_format,
      variant = options.variant,
      selector = options.selector;
   var $productImage = $("#ProductPhotoImg"),
      $addToCart = $("#AddToCart"),
      $productPrice = $(".price-product-template"),
      $comparePrice = $(".compareprice-product-template"),
      $quantityElements = $(".quantity-selector, label + .js-qty"),
      $quantity = $(".product-form__item--quantity"),
      $addToCartText = $("#AddToCartText");
   if (variant) {
      var form = $("#" + selector.domIdPrefix).parents("form");
      for (var i = 0, length = variant.options.length; i < length; i++) {
         var radioButton = form.find(
            '.swatch[data-option-index="' +
               i +
               '"] :radio[value="' +
               variant.options[i] +
               '"]'
         );
         if (radioButton.size()) {
            radioButton.get(0).checked = true;
         }
      }
      if (variant.featured_image) {
         var newImage = variant.featured_image;
         var element = $productImage[0];
         Shopify.Image.switchImage(
            newImage,
            element,
            function (src, imgObject, el) {
               $(".thumblist img").each(function () {
                  var idProductImage = $(this).parent().data("image");
                  if (idProductImage == src) {
                     $(this).parent().trigger("click");
                     var position = $(this).parents(".owl-item").index();
                     $(".thumblist .owl-carousel").trigger(
                        "to.owl.carousel",
                        position
                     );
                     return false;
                  }
               });
            }
         );
      }
      if (variant.available) {
         var d_qty = $("#productSelect :selected").data("qty");
         if (d_qty < 1) {
            $addToCartText.html("" + theme.strings.preorder + "");
         } else {
            $addToCartText.html("" + theme.strings.addToCart + "");
         }
         $addToCart.removeClass("disabled").prop("disabled", false);
         $quantity.show();
         $addToCart.removeClass("disabled").prop("disabled", false);
         $quantityElements.show();
         $(".group-quantity .control-label").show();
         $(".group-quantity").css("margin-top", "0");
         $("input").parent(".swatch-element").find(".sold").hide();
      } else {
         $quantity.hide();
         $addToCart.addClass("disabled").prop("disabled", true);
         $addToCartText.html("" + theme.strings.notify_me + "");
         $quantityElements.hide();
         $("input:not(:checked)")
            .parent(".swatch-element")
            .find(".sold")
            .hide();
         $("input:checked").parent(".swatch-element").find(".sold").show();
         $("input:checked")
            .parent(".swatch-element")
            .attr("data-toggle", "modal");
         $(".group-quantity .control-label").hide();
         $(".group-quantity").css("margin-top", "30px");
      }
      $productPrice.html(
         theme.Currency.formatMoney(variant.price, moneyFormat)
      );
      if (variant.compare_at_price > variant.price) {
         $comparePrice
            .html(
               theme.Currency.formatMoney(variant.compare_at_price, moneyFormat)
            )
            .show();
      } else {
         $comparePrice.hide();
      }
      if ($("#currencies").length != 0) {
         Currency.convertAll(
            shopCurrency,
            $("#currencies span.selected").attr("data-currency")
         );
      }
   } else {
      $quantity.removeClass("d-block");
      $addToCart.addClass("disabled").prop("disabled", true);
      $addToCartText.html("" + theme.strings.unavailable + "");
      $quantityElements.hide();
   }
};
novtheme.productImageSwitch = function () {
   if (novtheme.cache.$thumbImages.length) {
      $(".thumbItem").each(function () {
         var srcproFeatured = $("#ProductPhotoImg").attr("src");
         var srcthumnail = $(".product-single__thumbnail", this).attr(
            "data-image"
         );
      });
      novtheme.cache.$thumbImages.on("click", function (evt) {
         evt.preventDefault();
         var newImage = $(this).attr("data-image");
         $(".thumbItem").removeClass("active");
         $(this).parent().addClass("active");
         novtheme.switchImage(newImage, null, novtheme.cache.$productImage);
      });
   }
};
novtheme.switchImage = function (src, imgObject, el) {
   var $el = $(el);
   $el.attr("src", src);
};
novtheme.cacheSelectors = function () {
   novtheme.cache = {
      $html: $("html"),
      $body: $(document.body),
      $navigation: $("#AccessibleNav"),
      $mobileSubNavToggle: $(".mobile-nav__toggle"),
      $changeView: $(".change-view"),
      $productImage: $("#ProductPhotoImg"),
      $thumbImages: $("#productThumb").find("a.product-single__thumbnail"),
      $thumbImages: $("#productThumbs").find("a.product-single__thumbnail"),
      $thumbItem: $(".thumb_grid").find(".thumbItem"),

      $recoverPasswordLink: $("#RecoverPassword"),
      $hideRecoverPasswordLink: $("#HideRecoverPasswordLink"),
      $recoverPasswordForm: $("#RecoverPasswordForm"),

      $recoverPasswordIndex: $("#RecoverPasswordIndex"),
      $hideRecoverPasswordIndex: $("#HideRecoverPasswordIndex"),
      $recoverPasswordFormIndex: $("#RecoverPasswordFormIndex"),

      $customerLoginForm: $("#CustomerLoginForm"),
      $passwordResetSuccess: $("#ResetSuccess"),
   };
};
novtheme.eventBlockCart = function (e) {
   // Cart canvas
   $(".cart_canvas .open_header_cart_canvas").click(function () {
      $(".header-cart-canvas").addClass("active");
   });
   $(".close_canvas_cart").click(function () {
      $(".header-cart-canvas").removeClass("active");
   });

   // Hover Cart
   if (!("ontouchstart" in document)) {
      $(".cart_dropdown .header-cart").hover(function () {
         if (!$(".cart_dropdown #cart-info").is(":visible")) {
            $(".cart_dropdown #cart-info").slideDown("fast");
         }
      });
      $(".cart_dropdown #cart_block").mouseleave(function () {
         $(".cart_dropdown #cart-info").slideUp("fast");
      });
   } else {
      //mobile
      $(".cart_dropdown .header-cart").click(function () {
         if ($("#cart-info").is(":visible")) {
            $("#cart-info").slideUp("fast");
         } else {
            $("#cart-info").slideDown("fast");
         }
      });
   }
};
novtheme.hoverAccount = function (e) {
   if ($(window).width() > 1199) {
      $(".site-header_myaccount").hover(
         function () {
            $(".site-header_myaccount").addClass("show");
            $(".account-list").addClass("show");
         },
         // Event two mouse out remove class
         function () {
            $(".site-header_myaccount").removeClass("show");
            $(".account-list").removeClass("show");
         }
      );
   }
};
novtheme.NovToggleAction = function () {
   $(document).on("click", function (f) {
      if ($(f.target).is(".nov_sideward") == false) {
         $(".nov-toggle").removeClass("active");
         $(".nov-toggle .nov-toggle-btn").removeClass("act");
         $(".canvas-overlay").removeClass("act");
      }
      if ($(f.target).is(".nov-toggle .nov-toggle-btn") == true) {
         $(".nov-toggle").removeClass("active");
         $(".nov-toggle .nov-toggle-btn").removeClass("act");
         $(".canvas-overlay").removeClass("act");
      }
   });
};
novtheme.NovToggleSearch = function () {
   $(".search-toggle").on("click.break", function (event) {
      var wrapper = $(".overlay-search");
      wrapper.addClass("open");
      $(".site-header").addClass("open");
      $("#header-sticky").addClass("open");
      $("body").addClass("open");
      $(".search-bar__form .search-bar__input").focus();
   });
   $(".close-search", ".overlay-search").on("click.break", function (event) {
      var wrapper = $(".overlay-search");
      wrapper.removeClass("open");
      $(".site-header").removeClass("open");
      $("#header-sticky").removeClass("open");
      $("body").removeClass("open");
   });
};
novtheme.NovTogglePage = function () {
   $(".nov-toggle-page").on("click", function (e) {
     $('.icon-cart').trigger('click');
      /*var target = $(this).data("target");
      $("body").hasClass("show-boxpage")
         ? $("body").removeClass("show-boxpage")
         : $("body").addClass("show-boxpage");
      $(target).hasClass("active")
         ? $(target).removeClass("active")
         : $(target).addClass("active");*/
      e.preventDefault();
   });
   $(".box-header .close-box").on("click", function (e) {
      $("body").removeClass("show-boxpage");
      $(this).parents(".mobile-boxpage").removeClass("active");
      $(".back-box", "#mobile-pageaccount").removeClass("active");
      $("#mobile-pageaccount").find(".box-content").removeClass("active");
      e.preventDefault();
   });
   $(".links-currency, .links-language").on("click", function (e) {
      var target_link = $(this).data("target"),
         title_box = $(this).data("titlebox");
      $("#mobile-pageaccount").find(".box-content").removeClass("active");
      $(".title-box", "#mobile-pageaccount").html(title_box);
      $(".back-box", "#mobile-pageaccount").addClass("active");
      $(target_link).hasClass("active")
         ? $(target_link).removeClass("active")
         : $(target_link).addClass("active");
      e.preventDefault();
   });
   $(".back-box", "#mobile-pageaccount").on("click", function (e) {
      var titlebox_parent = $("#mobile-pageaccount").data("titlebox-parent");
      $("#mobile-pageaccount").find(".box-content").removeClass("active");
      $(".title-box", "#mobile-pageaccount").html(titlebox_parent);
      $(this).removeClass("active");
      e.preventDefault();
   });
};
novtheme.NovHeightBoxContent = function () {
   var height = $(window).outerHeight(),
      boxheight = $(".box-header").outerHeight(),
      menubottom = $("#stickymenu_bottom_mobile").outerHeight();
   $(".box-content", ".mobile-boxpage").each(function () {
      $(this).outerHeight(height - 45);
   });
};
novtheme.NovEventClickSearchMobile = function () {
   $("#stickymenu_bottom_mobile .js-btn-search").click(function () {
      $("#mobile_search .search-header__input").focus();
      $("body,html").animate(
         {
            scrollTop: 0,
         },
         "normal"
      );
   });
};
novtheme.goToTop = function () {
   var timer;
   $(window).scroll(function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
         if ($(window).scrollTop() >= 200) {
            $("#_desktop_back_top").fadeIn();
         } else {
            $("_desktop_back_top").fadeOut();
         }
      }, 300);
   });
   $("#_desktop_back_top").click(function () {
      $("body,html").animate({ scrollTop: 0 }, "normal");
      return !1;
   });
};
novtheme.goToTopMobile = function () {
   if ($(window).width() < 768) {
      var timer;
      $(window).scroll(function () {
         if (timer) clearTimeout(timer);
         timer = setTimeout(function () {
            $("#back_top").fadeIn();
         }, 200);
      });
      $("#back_top").click(function () {
         $("body,html").animate(
            {
               scrollTop: 0,
            },
            "normal"
         );
         return !1;
      });
   }
};
novtheme.PopupNewletter = function () {
   var date = new Date();
   var minutes = 60;
   date.setTime(date.getTime() + minutes * 60 * 1000);
   if (
      $.cookie("popupNewLetterStatus_new") != "closed" 
     /*&&
      $("body").outerWidth() > 768*/
   ) {
      $("#popup-subscribe").modal({
         show: !0,
      });
   }
   $.cookie("popupNewLetterStatus_new", "closed", {
      expires: date,
      path: "/",
   });
   $("input.no-view").change(function () {
      if ($("input.no-view").prop("checked") == 1) {
         $.cookie("popupNewLetterStatus_new", "closed", {
            expires: date,
            path: "/",
         });
      } else {
         $.cookie("popupNewLetterStatus_new", "", {
            expires: date,
            path: "/",
         });
      }
   });
};
novtheme.PopupBundle = function () {
   var date = new Date();
   var minutes = 60;
   date.setTime(date.getTime() + minutes * 60 * 1000);
   if ( $.cookie("popupNewLetterStatus") != "closed" 
       /*&&  $("body").outerWidth() > 768 */
      ) {
   /*if ( $.cookie("popupNewLetterStatus") != "closed" ) {*/
      /*$("#popup-bundle").modal({
         show: !0,
      });*/
     $("#popup-subscribe").modal({
         show: !0,
      });
   }
   $.cookie("popupNewLetterStatus", "closed", {
      expires: date,
      path: "/",
   });
   $("input.no-view").change(function () {
      if ($("input.no-view").prop("checked") == 1) {
         $.cookie("popupNewLetterStatus", "closed", {
            expires: date,
            path: "/",
         });
      } else {
         $.cookie("popupNewLetterStatus", "", {
            expires: date,
            path: "/",
         });
      }
   });
    /*$('#popup-bundle').find('.close').click(function(){
       $("#popup-subscribe").modal({
         show: !0,
      });
   });*/
  
};
novtheme.variantName = function () {
   if ($(".template-product .thumb_grid").length > 0) {
      var val = $(
         '.swatch[data-option-index="0"] .swatch-element input:checked'
      )
         .parent()
         .data("value");
      $('.thumbItem[data-variant="' + val + '"]').addClass("show");

      $('.swatch[data-option-index="0"] .swatch-element label').on(
         "click",
         function () {
            var value = $(this).parent().data("value");
            $(".thumbItem").removeClass("show");
            $('.thumbItem[data-variant="' + value + '"]').addClass("show");
         }
      );
   }
};
novtheme.MenuSidebar = function () {
   if ($(window).width() < 768) {
      $(".filter-item_title").click(function () {
         $(".filter-item_content").slideUp();
         if ($(this).hasClass("add")) {
            $(this).next().slideUp();
            $(this).removeClass("add");
         } else {
            $(this).next().slideDown();
            $(".filter-item_title").removeClass("add");
            $(this).addClass("add");
         }
      });
   }
};
//Thumnail Slick Product Deal
novtheme.Product__Thumnail = function () {
   $(".product-thumb .item-product").each(function (index) {
      var asNavFor_nav = $(".thumnailslider-for", this).data("asnavfornav");
      var autoplay = $(".thumnailslider-nav", this).data("autoplay");
      var autoplayTimeout = $(".thumnailslider-nav", this).data(
         "autoplayTimeout"
      );
      var items = $(".thumnailslider-nav", this).data("items");
      var items_lg_tablet = $(".thumnailslider-nav", this).data(
         "items_lg_tablet"
      );
      var items_tablet = $(".thumnailslider-nav", this).data("items_tablet");
      var items_mobile = $(".thumnailslider-nav", this).data("items_mobile");
      var items_mobiles = $(".thumnailslider-nav", this).data("items_mobiles");
      var margin = $(".thumnailslider-nav", this).data("margin");
      var nav = $(".thumnailslider-nav", this).data("nav");
      var dots = $(".thumnailslider-nav", this).data("dots");
      var loop = $(".thumnailslider-nav", this).data("loop");
      var vertical = $(".thumnailslider-nav", this).data("vertical");
      var position = $(".thumnailslider-nav", this)
         .find(".selected")
         .data("position-image");
      var asNavFor_for = $(".thumnailslider-nav", this).data("asnavforfor");
      if ($("html").hasClass("lang-rtl")) var rtl = true;
      else var rtl = false;
      $(asNavFor_for, this).slick({
         rtl: rtl,
         slidesToShow: 1,
         slidesToScroll: 1,
         arrows: false,
         dots: false,
         fade: true,
         loop: false,
         arrows: false,
         asNavFor: asNavFor_nav,
      });
      $(asNavFor_nav, this).slick({
         rtl: rtl,
         slidesToShow: items,
         slidesToScroll: 1,
         asNavFor: asNavFor_for,
         centerMode: false,
         loop: false,
         focusOnSelect: true,
         dots: false,
         arrows: false,
         responsive: [
            {
               breakpoint: 1920,
               settings: {
                  slidesToShow: items,
               },
            },
            {
               breakpoint: 1200,
               settings: {
                  slidesToShow: items_lg_tablet,
               },
            },
            {
               breakpoint: 992,
               settings: {
                  slidesToShow: items_tablet,
               },
            },
            {
               breakpoint: 768,
               settings: {
                  slidesToShow: items_mobile,
               },
            },
            {
               breakpoint: 576,
               settings: {
                  slidesToShow: items_mobiles,
               },
            },
         ],
      });
   });
};
novtheme.Product_Megamenu = function () {
   var $this = $(".novmenu_product");
   var autoplay = $($this).data("autoplay");
   var autoplaytimeout = $($this).data("autoplaytimeout");
   var dots = $($this).data("dots");
   var nav = $($this).data("nav");
   $($this).slick({
      nextArrow:
         '<div class="arrow-next"><i class="fa fa-long-arrow-left"></i></div>',
      prevArrow:
         '<div class="arrow-prev"><i class="fa fa-long-arrow-right"></i></div>',
      lazyLoad: true,
      autoplay: autoplay,
      autoplaytimeout: 5000,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: nav,
      dots: dots,
      infinite: true,
      fade: false,
      responsive: {
         0: {
            items: 1,
         },
         768: {
            items: 1,
         },
         992: {
            items: 1,
         },
         1200: {
            items: 1,
         },
      },
   });
};
novtheme.RunInstagram = function () {
   if ($(".nov-image-centered").length > 0) {
      var winHeight = $(window).height();
      var Event = false,
         offset_top = $(".nov-image-centered").offset().top,
         distance = offset_top - winHeight;
      $(window).on("scroll", function () {
         var currentPosition = $(document).scrollTop();
         if (currentPosition > distance && Event === false) {
            Event = true;
            setTimeout(function () {
               $(".nov-image-centered").addClass("ins-animate");
            }, 1000);
         }
      });
   }
};
novtheme.NovAccordion = function () {
   $(".nov-accordion__title").click(function () {
      if ($(this).hasClass("act")) {
         $(this).removeClass("act"),
            $(this).parent().find(".nov-accordion__content").slideUp();
      } else {
         $(this)
            .parents(".nov-accordion")
            .find(".nov-accordion__title")
            .removeClass("act"),
            $(this)
               .parents(".nov-accordion")
               .find(".nov-accordion__content")
               .slideUp(),
            $(this).addClass("act"),
            $(this).parent().find(".nov-accordion__content").slideDown();
      }
   });
};
novtheme.CollectionPage = function () {
   if (localStorage.getItem("view_collection")) {
      $(".collection__product-content").attr(
         "data-grid",
         localStorage.getItem("view_collection")
      );
      $(".gridlist-toggle a").removeClass("active");
      $(
         '.gridlist-toggle [data-type="' +
            localStorage.getItem("view_collection") +
            '"]'
      ).addClass("active");
   }
   $(".gridlist-toggle a").click(function (e) {
      e.preventDefault();
      var typeview = $(this).data("type");
      if (!$(this).hasClass("active")) {
         $(".collection__product-content").attr("data-grid", typeview);
         $(".gridlist-toggle a").removeClass("active");
         $(this).addClass("active");
      }
      localStorage.setItem(
         "view_collection",
         $(".collection__product-content").attr("data-grid")
      );
   });

   $(".filter_button").click(function () {
      $(".sidebar-filter").addClass("active");
      $(".sidebar-overlay").addClass("act");
   });
   if ($(document).width() < 992) {
      $(".collection__product-content").attr("data-grid", "grid-3");
      $(".gridlist-toggle a").removeClass("active");
      $(".gridlist-toggle #grid-3").addClass("active");
   }
   if ($(document).width() < 768) {
      $(".collection__product-content").attr("data-grid", "grid-2");
      $(".gridlist-toggle a").removeClass("active");
      $(".gridlist-toggle #grid-2").addClass("active");
   }
   // Click filter sort by
   var text = $(
      '#FacetsWrapperDesktop [name="sort_by"] [selected="selected"]'
   ).text();
   $("[data-sortby-filter] .sort-by__label").text(text);
   $("[data-sortby-item]").click(function () {
      var valuesort = $(this).attr("value");
      var newtext = $(this).text();
      $("[data-sortby-filter] .sort-by__label").text(newtext);
      $('[name="sort_by"]').val(valuesort);
      const form = document.querySelector("facet-filters-form");
      form.onSubmitHandlerSortBy(event, form.querySelector("form"));
   });
   if ($(".reset_price").length) {
      window.onload = function () {
         var min = $(".min_price .money").text().slice(1),
            max = $(".max_price .money").text().slice(1),
            m = $(".filter-max__price").data("max"),
            n = $(".filter-max__price .money").text().slice(1),
            x = m / n;
         $(".facets__price")
            .find("input")
            .first()
            .val(Math.round(min))
            .attr({ max: Math.round(max), "data-value": Math.round(max * x) });
         $(".facets__price")
            .find("input")
            .last()
            .val(Math.round(max))
            .attr({
               max: Math.round(n),
               min: Math.round(min),
               "data-value": Math.round(max * x),
            });
      };
   }
};
$(document).ready(function () {
   var d = $(this),
      mobile = false;
   $(novtheme.init);
   if (responsive_mobile) {
      novtheme.toggleMobileStyles();
   }
   if ($("#popup-subscribe").length) {
      $(window).on("load", function () {
         /*var timer = window.setTimeout(novtheme.PopupNewletter(), 2000);*/
         var timer = window.setTimeout(novtheme.PopupBundle(), 2000);
      });
   }
   // var timer = window.setTimeout(novtheme.PopupBundle(), 3000);
   if ($("#popupAlert").length) {
      $(window).on("load", function () {
         $("#popupAlert").modal();
      });
   }
   $(window).on("resize", function () {
      if (d.width() <= 980 && mobile == false) {
         mobile = true;
      } else if (d.width() > 980) {
         mobile = false;
      }
   });

   $(window).load(function () {
      var loader = $(".preloader_nov");
      if (loader.length) {
         //$(window).on("beforeunload", function () {
            loader.fadeIn(500, function () {
               loader.children().fadeIn(500);
            });
         //});
         loader.fadeOut(1500);
         loader.children().fadeOut(1500);
      }
   });

   // verical menu
   if ($(document).width() > 767) {
      $(".vertical_menu .show_sub, .ver_menu .show_mor").click(function (e) {
         $(this)
            .parent()
            .each(function () {
               e.preventDefault();
            });
         if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            $(this)
               .parent()
               .parent(".site-nav--has-dropdown")
               .children(".site-nav__dropdown, .dropdown_menu")
               .slideUp(300);
            $(this)
               .children()
               .addClass("zmdi-caret-right")
               .removeClass("zmdi-caret-down");
         } else {
            $(this)
               .addClass("active")
               .parent()
               .parent(".site-nav--has-dropdown")
               .children(".site-nav__dropdown, .dropdown_menu")
               .slideDown(300);
            $(this)
               .children()
               .addClass("zmdi-caret-down")
               .removeClass("zmdi-caret-right");
         }
         $(".vertical_menu .show_sub, .ver_menu .show_mor")
            .not(this)
            .removeClass("active")
            .parent()
            .parent(".site-nav--has-dropdown")
            .children(".site-nav__dropdown, .dropdown_menu")
            .slideUp(300);
         $(".vertical_menu .show_sub, .ver_menu .show_mor")
            .not(this)
            .children()
            .removeClass("zmdi-caret-down")
            .addClass("zmdi-caret-right");
      });
   }

   if ($(document).width() > 767) {
      $("#AccessibleNav .site-nav__childlist-item .show_sub").click(
         function () {
            if ($(this).hasClass("active")) {
               $(this).removeClass("active");
               $(this)
                  .parents(".site-nav__childlist-item")
                  .children(".site-nav__dropdown-children")
                  .slideUp(300);
               $(this)
                  .children()
                  .addClass("zmdi-caret-right")
                  .removeClass("zmdi-caret-down");
            } else {
               $(this).addClass("active");
               $(this)
                  .parents(".site-nav__childlist-item")
                  .children(".site-nav__dropdown-children")
                  .slideDown(300);
               $(this)
                  .children()
                  .addClass("zmdi-caret-down")
                  .removeClass("zmdi-caret-right");
            }
            $("#AccessibleNav .site-nav__childlist-item .show_sub")
               .not(this)
               .children()
               .removeClass("zmdi-caret-down")
               .addClass("zmdi-caret-right");
         }
      );
   }

   // mobile vertical sidebar
   $(".btn-mobile_vertical_menu").click(function () {
      $("#_mobile_vertical_menu").addClass("active");
      $("#_mobile_sidebarmenu_content").addClass("active");
      $(".sidebar-overlay").addClass("act");
   });

   // vertical dropdown
   if ($(window).width() <= 1199 && $(window).width() >= 768) {
      $(".vertical_dropdown").click(function () {
         if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            $(".ver_menu").removeClass("active");
         } else {
            $(this).addClass("active");
            $(".ver_menu").addClass("active");
            $(".sidebar-overlay").addClass("act");
         }
      });
   }

   var show_more = $(".vertical_menu").data("count_showmore");

   if ($(".vertical_menu>ul>li").length > show_more) {
      $(".vertical_menu .show_more").removeClass("hidden");
   }
   $(".vertical_menu .show_more").click(function () {
      if ($(this).hasClass("active")) {
         $(this).removeClass("active");
      } else {
         $(this).addClass("active");
      }
      if ($(".vertical_menu>ul>li").hasClass("hide")) {
         $(".vertical_menu>ul>li.hide").slideToggle(300);
      }
   });

   if ($(document).width() > 767) {
      $(".site-header_myaccount").click(function () {
         $(this).addClass("active");
         $(".sidebar-overlay").addClass("act");
         $(".account-list").addClass("active");
         $("#_desktop_cart").removeClass("active");
      });
      /*$(".header-cart").click(function () {
         $(".sidebar-overlay").addClass("act");
         $("#_desktop_cart").addClass("active");
         $(".account-list").removeClass("active");
      });*/
      $(".close_account .zmdi-close").click(function () {
         $(this).removeClass("active");
         $(".sidebar-overlay").removeClass("act");
         $(".account-list").removeClass("active");
      });
      $(".close_cart .zmdi-close").click(function () {
         $(".sidebar-overlay").removeClass("act");
         $("#_desktop_cart").removeClass("active");
      });
   }

   $(".sidebar-overlay").click(function () {
      $(this).removeClass("act");
      $("#_mobile_vertical_menu").removeClass("active");
      $(".vertical_toggle").removeClass("active");
      $(".btn_active").css("opacity", "1");
      if ($(document).width() >= 992) {
         $("#_desktop_vertical_menu").slideUp(450);
      }
      $(".vertical_dropdown").removeClass("active");
      $(".sidebar_menu").removeClass("active");
      $(".sidebar-filter").removeClass("active");
      $(".ver_menu").removeClass("active");
      $(".site-header_myaccount").removeClass("active");
      $(".account-list").removeClass("active");
      $("#_desktop_cart").removeClass("active");
   });

   //Related Product
   if ($("html").hasClass("lang-rtl")) rtl = true;
   else rtl = false;
   var autoplay = $(".owl-relatedproduct").data("autoplay");
   var autoplayTimeout = $(".owl-relatedproduct").data("autoplayTimeout");
   var items = $(".owl-relatedproduct").data("items");
   var margin = $(".owl-relatedproduct").data("margin");
   var nav = $(".owl-relatedproduct").data("nav");
   var dots = $(".owl-relatedproduct").data("dots");
   var loop = $(".owl-relatedproduct").data("loop");
   var items_tablet = $(".owl-relatedproduct").data("items_tablet")
      ? $(".owl-relatedproduct").data("items_tablet")
      : 3;
   var items_mobile = $(".owl-relatedproduct").data("items_mobile")
      ? $(".owl-relatedproduct").data("items_mobile")
      : 1;
   var center = $(".owl-relatedproduct").data("center")
      ? $(".owl-relatedproduct").data("center")
      : false;
   var start = $(".owl-relatedproduct").data("start")
      ? $(".owl-relatedproduct").data("start")
      : 0;
   $(".owl-relatedproduct").owlCarousel({
      navText: [
         '<i class="zmdi zmdi-chevron-left"></i>',
         '<i class="zmdi zmdi-chevron-right"></i>',
      ],
      lazyLoad: true,
      lazyContent: true,
      loop: loop,
      autoplay: autoplay,
      autoplayTimeout: autoplayTimeout,
      items: items,
      margin: margin,
      rtl: rtl,
      dots: dots,
      nav: nav,
      responsive: {
         0: {
            items: items_mobile,
            center: center,
            margin: 10,
         },
         768: {
            items: items_tablet,
            margin: 30,
         },
         992: {
            items: 4,
            margin: 30,
         },
         1200: {
            items: items,
            startPosition: start,
            margin: 30,
         },
         1440: {
            items: items,
            startPosition: start,
            margin: margin,
         },
      },
   });
   checkClasses();
   $(".owl-relatedproduct").on("translated.owl.carousel", function (event) {
      checkClasses();
   });

   function checkClasses() {
      var total = $(".owl-relatedproduct .owl-stage .owl-item.active").length;
      $(".owl-relatedproduct .owl-stage .owl-item").removeClass(
         "firstActiveItem lastActiveItem"
      );
      $(".owl-relatedproduct .owl-stage .owl-item.active").each(function (
         index
      ) {
         if (index === 0) {
            $(this).addClass("firstActiveItem");
         }
         if (index === total - 1 && total > 1) {
            $(this).addClass("lastActiveItem");
         }
      });
   }
   $(".menu_button").click(function () {
      $(".sidebar_menu").addClass("active");
      $(".sidebar-overlay").addClass("act");
   });
   $(".close-menu").click(function () {
      $(".sidebar_menu").removeClass("active");
      $(".sidebar-overlay").removeClass("act");
   });
   novtheme.NovMediumToggle = function () {
      $(".card-header").on("click", function (e) {
         $(this).hasClass("active")
            ? $(this).removeClass("active")
            : $(this).addClass("active");
      });
   };
   novtheme.HideShowPassword = function () {
      $(".hide_show_password").show();
      $(".hide_show_password span").addClass("show");

      $(".hide_show_password span").click(function () {
         if ($(this).hasClass("show")) {
            $(this).html('<i class="zmdi zmdi-eye"></i>');
            $('input[name="customer[password]"]').attr("type", "text");
            $(this).removeClass("show");
         } else {
            $(this).html('<i class="zmdi zmdi-eye-off"></i>');
            $('input[name="customer[password]"]').attr("type", "password");
            $(this).addClass("show");
         }
      });

      $('form button[type="submit"]').on("click", function () {
         $(".hide_show_password span").text("Show").addClass("show");
         $(".hide_show_password")
            .parent()
            .find('input[name="customer[password]"]')
            .attr("type", "password");
      });
   };
   $(".group-quantity .btnProductWishlist").click(function () {
      if ($(this).hasClass("whislist-added")) {
         $("#popup-Wishlist").removeClass("novload");
      } else {
         $("#popup-Wishlist").addClass("novload");
      }
   });
   novtheme.galery_image = function () {
      $('[data-fancybox="gallery"]').fancybox({
         buttons: [
            "slideShow",
            "thumbs",
            "zoom",
            "fullScreen",
            "share",
            "close",
         ],
         loop: false,
         protect: true,
      });
   };

   $(".product-swatch-color a").click(function (e) {
      e.preventDefault();
      var data_image_variant = $(this).data("image-variant");
      var src_img = $(this)
         .parents(".item-product")
         .find(".product__thumbnail");
      src_img.attr("srcset", data_image_variant);
      $(this)
         .parents(".item-product")
         .find(".product__thumbnail-second")
         .addClass("hidden");
      $(this)
         .parents(".item-product")
         .find(".product__thumbnail")
         .addClass("block");
      $(this)
         .parent(".swatch-element")
         .addClass("act")
         .siblings()
         .removeClass("act");
   });
   $(".product-swatch-color").each(function () {
      var n = $(this).children(".swatch-element").length - 3;
      if ($(this).children(".swatch-element").length > 3) {
         $(this).find(".number").text(n);
         $(this).find(".show_more").show();
      }
      $(this).find(".swatch-element:gt(2)").addClass("hide");
      $(this)
         .children(".show_more")
         .click(function () {
            if ($(this).hasClass("active")) {
               $(this).parent().find(".hide").hide();
               $(this).removeClass("active");
               $(this).parent().find(".number").show();
            } else {
               $(this).parent().find(".hide").show();
               $(this).addClass("active");
               $(this).parent().find(".number").hide();
            }
         });
   });

   $(".btnsold_out").click(function () {
      $(".note").addClass("d-none");
      $(".loading").addClass("d-block");
      $(".loading i").addClass("fa-spinner");
      setTimeout(RemoveClass, 500);
   });

   // Accordion footer mobile
   $(".show_footer").click(function (e) {
      if ($(this).hasClass("adds")) {
         $(this).removeClass("adds");
         $(this)
            .parents(".footer-block")
            .find(".block-content.adc")
            .slideUp(300);
      } else {
         $(".show_footer").removeClass("adds");
         $(".footer-block .block-content.adc").slideUp(300);
         $(this).addClass("adds");
         $(this)
            .parents(".footer-block")
            .find(".block-content.adc")
            .slideDown(300);
      }
   });

   $(".no-view").click(function () {
      if ($(".contact-form").hasClass("add")) {
         $(".contact-form").removeClass("add");
      } else {
         $(".contact-form").addClass("add");
      }
   });

   function RemoveClass() {
      $(".note").removeClass("d-none");
      $(".loading").removeClass("d-block");
      $(".loading i").removeClass("zmdi-hc-spin");
   }

   if ($(window).width() > 767) {
      var $productImageZoom = $(".image-zoom");
      $productImageZoom.trigger("zoom.destroy");
      $productImageZoom
         .wrap('<span style="display:inline-block"></span>')
         .css("display", "block")
         .parent()
         .zoom({
            url: $(this).find("img").attr("data-zoom"),
         });
   }

   new WOW().init();
});
