(function ($) {
   var wishListsArr = localStorage.getItem("wishListsArr")
      ? JSON.parse(localStorage.getItem("wishListsArr"))
      : [];
   localStorage.setItem("wishListsArr", JSON.stringify(wishListsArr));
   if (wishListsArr.length) {
      wishListsArr = JSON.parse(localStorage.getItem("wishListsArr"));
   }

   $(".swatch :radio").change(function () {
      var optionIndex = $(this).closest(".swatch").attr("data-option-index");
      var optionValue = $(this).val();
      $(this)
         .closest("form")
         .find(".single-option-selector")
         .eq(optionIndex)
         .val(optionValue)
         .trigger("change");
   });

   Shopify.optionsMap = {};
   Shopify.updateOptionsInSelector = function (selectorIndex) {
      switch (selectorIndex) {
         case 0:
            var key = "root";
            var selector = $(".single-option-selector:eq(0)");
            break;
         case 1:
            var key = $(".single-option-selector:eq(0)").val();
            var selector = $(".single-option-selector:eq(1)");
            break;
         case 2:
            var key = $(".single-option-selector:eq(0)").val();
            key += " / " + $(".single-option-selector:eq(1)").val();
            var selector = $(".single-option-selector:eq(2)");
      }

      var initialValue = selector.val();
      selector.empty();
      var availableOptions = Shopify.optionsMap[key];
      if (availableOptions && availableOptions.length) {
         for (var i = 0; i < availableOptions.length; i++) {
            var option = availableOptions[i];
            var newOption = $("<option></option>").val(option).html(option);
            selector.append(newOption);
         }
         $(
            '.swatch[data-option-index="' + selectorIndex + '"] .swatch-element'
         ).each(function () {
            if (
               $.inArray($(this).attr("data-value"), availableOptions) !== -1
            ) {
               $(this)
                  .removeClass("soldout")
                  .find(":radio")
                  .removeAttr("disabled", "disabled")
                  .removeAttr("checked");
               $(this).removeAttr("data-toggle", "modal");
               $(this).removeAttr("data-target", "#Form_newletter");
               var d_qty = $("#productSelect :selected").data("qty");
               if (d_qty < 1) {
                  $("#AddToCartText").html("" + theme.strings.preorder + "");
               } else {
                  $("#AddToCartText").html("" + theme.strings.addToCart + "");
               }
            } else {
               $(this)
                  .addClass("soldout")
                  .find(":radio")
                  .removeAttr("checked")
                  .attr("disabled", "disabled");
               $(this).attr("data-toggle", "modal");
               $(this).attr("data-target", "#Form_newletter");
               var ValueFirst = $(this)
                  .parent()
                  .find(".swatch-element:first")
                  .data("value");
               $(this)
                  .parents(".watch_availabel")
                  .find(".variant_current")
                  .text(ValueFirst);
            }
         });
         $(".selectorVariants .swatch-element").click(function () {
            $(".selectorVariants .swatch-element").removeClass("act");
            $(this).addClass("act");
            var d_qty = $("#productSelect :selected").data("qty");
            if (d_qty < 1) {
               $("#AddToCartText").html("" + theme.strings.preorder + "");
            } else {
               $("#AddToCartText").html("" + theme.strings.addToCart + "");
            }
         });
         if ($.inArray(initialValue, availableOptions) !== -1) {
            selector.val(initialValue);
         }
         selector.trigger("change");
      }
   };
   Shopify.linkOptionSelectors = function (product) {
      for (var i = 0; i < product.variants.length; i++) {
         var variant = product.variants[i];
         if (variant.available) {
            Shopify.optionsMap["root"] = Shopify.optionsMap["root"] || [];
            Shopify.optionsMap["root"].push(variant.option1);
            Shopify.optionsMap["root"] = Shopify.uniq(
               Shopify.optionsMap["root"]
            );
            if (product.options.length > 1) {
               var key = variant.option1;
               Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
               Shopify.optionsMap[key].push(variant.option2);
               Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
            }
            if (product.options.length === 3) {
               var key = variant.option1 + " / " + variant.option2;
               Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
               Shopify.optionsMap[key].push(variant.option3);
               Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
            }
         }
      }
      Shopify.updateOptionsInSelector(0);
      if (product.options.length > 1) Shopify.updateOptionsInSelector(1);
      if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
      jQuery(".single-option-selector:eq(0)").change(function () {
         Shopify.updateOptionsInSelector(1);
         if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
         return true;
      });
      jQuery(".single-option-selector:eq(1)").change(function () {
         if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
         return true;
      });
   };

   $(document).ready(function () {
      $(document).ajaxStart(function () {
         nuranium.isAjaxLoading = !0;
      });

      $(document).ajaxStop(function () {
         nuranium.isAjaxLoading = !1;
      });
      nuranium.init();
      $("#popup-subscribe i.zmdi-close").on("click", function () {
         $(this).parents("#popup-subscribe").modal("hide");
      });
      var t = {
         shop: vinovathemes.main_info.shop,
         purchase_code: vinovathemes.main_info.lic,
         shopify_domain: vinovathemes.main_info.domain,
         status: vinovathemes.main_info.status,
      };
      nuranium.validLicense(t);
   });

   var nuranium = {
      validLicense: function (t) {
         $.ajax({
            url: "https://vinovathemes.com/license/check_license.php",
            type: "post",
            data: t,
            success: function (t) {
               var a = JSON.parse(t);
               if (
                  ($("#Nov_purchasecode").on("contextmenu", function (t) {
                     t.preventDefault();
                  }),
                  !1 == a.status)
               )
                  return (
                     $("#Nov_purchasecode").removeClass("hide hidden"),
                     $("#Nov_purchasecode-waring").html(a.msg),
                     !1
                  );
               a.status &&
                  ($("#Nov_purchasecode-waring").html(a.msg).slideDown(250),
                  setTimeout(function () {
                     $("#Nov_purchasecode").remove();
                  }, 1e3));
            },
         });
      },
      isAjaxLoading: !1,
      init: function () {
         this.closeModal();
         this.novProductTabs();

         this.initNovWishListIcons();
         this.doAddOrRemoveWishlist();
         this.doAddOrRemoveWishlistProduct();

         if (
            $("body").hasClass("template-page") &&
            $(".wishlist-page").length
         ) {
            this.initNovWishListsPage();
         }

         this.ajaxProductAddToCart();
         this.ajaxAddToCart();
         this.ajaxChangeFromCart();
         this.initMiniCart();
         this.ajaxRemoveFromCart();
         this.initQuickView();
         this.initQuickVariants();
         this.changeQuantityPageCart();
         this.initCollapseSidebarBlock();
      },

      initCollapseSidebarBlock: function () {
         $(document).on("click", ".facets__label", (t) => {
            var a = $(t.currentTarget),
               o = a.parent().find(".facets__content");
            a.hasClass("act")
               ? (a.removeClass("act"), o.slideUp())
               : (a.addClass("act"), o.slideDown());
         });
      },
      initSwatchColor: function () {
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

         $(".section-collection-tabs .product-swatch-color").each(function () {
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
                     $(this).parent(".swatch-element").removeClass("act");
                     $(this).parent().find(".hide").hide();
                     $(this).removeClass("active");
                     $(this).parent().find(".number").show();
                  } else {
                     $(this).parent(".swatch-element").addClass("act");
                     $(this).parent().find(".hide").show();
                     $(this).addClass("active");
                     $(this).parent().find(".number").hide();
                  }
               });
         });
      },

      closeModal: function () {
         $(".close-modal, .overlay").click(function () {
            $(".loading-modal").css({
               opacity: "0",
               visibility: "hidden",
               transform: "translateX(410px)",
               transition: "all 0.3s",
            });
         });
      },

      novProductTabs: function () {
         var productTabs = $("[data-product-tabs]");

         productTabs.each(function () {
            var self = $(this),
               listTabs = self.find(".list-product-tabs"),
               tabLink = listTabs.find("[data-product-tabTop]"),
               tabContent = self.find("[data-product-TabContent]"),
               linkActive = self.find(".list-product-tabs .tab-links.active"),
               activeTab = self.find(
                  ".product-tabs-content .tab-content.active"
               );

            nuranium.doAjaxNovProductTabs(
               linkActive.data("href"),
               activeTab.find(".loading"),
               activeTab.find(".products-grid")
            );

            tabLink.off("click").on("click", function (e) {
               e.preventDefault();
               e.stopPropagation();

               if ($(this).hasClass("active")) {
                  return;
               }

               if (!$(this).hasClass("active")) {
                  var curTab = $(this),
                     curTabContent = $(curTab.data("target"));

                  tabLink.removeClass("active");
                  tabContent.removeClass("active");

                  if (
                     !curTabContent
                        .find(".products-grid")
                        .hasClass("slick-initialized")
                  ) {
                     nuranium.doAjaxNovProductTabs(
                        curTab.data("href"),
                        curTabContent.find(".loading"),
                        curTabContent.find(".products-grid")
                     );
                  }

                  curTab.addClass("active");
                  curTabContent.addClass("active");
               }
            });
         });
      },

      doAjaxNovProductTabs: function (handle, loadingElement, curTabContent) {
         $.ajax({
            type: "GET",
            url: window.router + handle,
            success: function (data) {
               loadingElement.hide();

               if (
                  handle == "/collections/?view=json" ||
                  handle == "/collections/?view=new-json"
               ) {
               } else {
                  curTabContent.html($(data).find(".grid-item").html());
                  if (curTabContent.hasClass("collection-carousel")) {
                     if (!curTabContent.hasClass("slick-initialized")) {
                        nuranium.initNovProductTabsSlider(
                           curTabContent.parent()
                        );
                     }
                  } else {
                     var row = curTabContent.data("items");
                     switch (row) {
                        case 1:
                           var _class = "col-lg-12";
                           break;
                        case 2:
                           var _class = "col-lg-6";
                           break;
                        case 3:
                           var _class = "col-lg-4";
                           break;
                        case 4:
                           var _class = "col-lg-3";
                           break;
                        case 5:
                           var _class = "col-lg-5";
                           break;
                        case 6:
                           var _class = "col-lg-2";
                           break;
                     }
                  }

                  curTabContent.find(".grid-item").addClass(_class);

                  /*Currency.convertAll(
                     shopCurrency,
                     $("#currencies span.selected").attr("data-currency")
                  );*/

                  nuranium.initNovWishListIcons();
                  nuranium.initSwatchColor();
                  if ($(".jdgm-widget .jdgm-prev-badge").length) {
                     jdgm.customizeBadges();
                  }
               }
            },
         });
      },

      initNovProductTabsSlider: function (tabslider) {
         tabslider.each(function () {
            var self = $(this),
               productGrid = self.find(".products-grid"),
               t = !!$("html").hasClass("lang-rtl");

            if (productGrid.not(".slick-initialized")) {
               productGrid.slick({
                  nextArrow:
                     '<div class="arrow-next"><i class="zmdi zmdi-chevron-right" aria-hidden="true"></i></div>',
                  prevArrow:
                     '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left" aria-hidden="true"></i></i></div>',
                  rtl: t,
                  slidesToShow:
                     (productGrid.data("loop"), productGrid.data("items")),
                  slidesToScroll:
                     (productGrid.data("loop"), productGrid.data("items")),
                  rows: productGrid.data("row"),
                  arrows: productGrid.data("nav"),
                  dots: productGrid.data("dots"),
                  infinite: productGrid.data("loop"),
                  adaptiveHeight: !0,
                  responsive: [
                     {
                        breakpoint: 1920,
                        settings: {
                           slidesToShow:
                              (productGrid.data("loop"),
                              productGrid.data("items")),
                           slidesToScroll:
                              (productGrid.data("loop"),
                              productGrid.data("items")),
                        },
                     },
                     {
                        breakpoint: 1439,
                        settings: {
                           slidesToShow: productGrid.data("items_lg_desktop"),
                           slidesToScroll: productGrid.data("items_lg_desktop"),
                        },
                     },
                     {
                        breakpoint: 1200,
                        settings: {
                           slidesToShow: productGrid.data("items_lg_tablet"),
                           slidesToScroll: productGrid.data("items_lg_tablet"),
                        },
                     },
                     {
                        breakpoint: 992,
                        settings: {
                           slidesToShow: productGrid.data("items_tablet"),
                           slidesToScroll: productGrid.data("items_tablet"),
                        },
                     },
                     {
                        breakpoint: 768,
                        settings: {
                           slidesToShow: productGrid.data("items_mobile"),
                           slidesToScroll: productGrid.data("items_mobile"),
                           arrows: true,
                        },
                     },
                     {
                        breakpoint: 480,
                        settings: {
                           slidesToShow: productGrid.data("items_mobiles"),
                           slidesToScroll: productGrid.data("items_mobiles"),
                           arrows: !1,
                           arrows: true,
                        },
                     },
                  ],
               });
            }
         });
      },

      initNovWishListsPage: function () {
         if (typeof Storage !== "undefined") {
            if (wishListsArr.length <= 0) {
               return;
            }

            wishListsArr.forEach(function (item) {
               nuranium.createNovWishListTplItem(item);
            });
         } else {
            alert("Storage no support!");
         }
      },

      initNovWishListIcons: function () {
         if (!wishListsArr.length) {
            return;
         }

         for (var i = 0; i < wishListsArr.length; i++) {
            var icon = $('[data-product-handle="' + wishListsArr[i] + '"]');
            icon.addClass("whislist-added");
            icon.find(".wishlist-text").text(theme.strings.remove_wishlist);
         }

         if (typeof Storage !== "undefined") {
            if (wishListsArr.length <= 0) {
               return;
            }

            setTimeout(function () {
               wishListsArr.forEach(function (item) {
                  nuranium.setNovAddedForWishlistIcon(item);
               });
            }, 500);
         } else {
            alert("Storage no support!");
         }
      },

      setNovAddedForWishlistIcon: function (ProductHandle) {
         var wishlistElm = $('[data-product-handle="' + ProductHandle + '"]'),
            idxArr = wishListsArr.indexOf(ProductHandle);

         if (idxArr >= 0) {
            wishlistElm.addClass("whislist-added");
            wishlistElm
               .find(".wishlist-text")
               .text(theme.strings.remove_wishlist);
         } else {
            wishlistElm.removeClass("whislist-added");
            wishlistElm
               .find(".wishlist-text")
               .text(theme.strings.add_to_wishlist);
         }
      },

      doAddOrRemoveWishlist: function () {
         var iconWishLists = ".item-product [data-icon-wishlist]";

         $(document)
            .off("click.addOrRemoveWishlist", iconWishLists)
            .on("click.addOrRemoveWishlist", iconWishLists, function (e) {
               e.preventDefault();

               var self = $(this),
                  productId = self.data("id"),
                  ProductHandle = self.data("product-handle"),
                  idxArr = wishListsArr.indexOf(ProductHandle);

               if (!self.hasClass("whislist-added")) {
                  self.addClass("whislist-added");
                  self
                     .find(".wishlist-text")
                     .text(theme.strings.remove_wishlist);

                  var title = self
                     .parents(".item-product")
                     .find(".product__title")
                     .html();
                  var image = self
                     .parents(".item-product")
                     .find(".product__thumbnail")
                     .attr("srcset");

                  $(".loading-modal").find(".product-title").html(title);
                  $(".loading-modal").find(".product-image").attr("src", image);
                  $(".loading-modal").find(".btn-wishlist").show();
                  $(".loading-modal").css({
                     display: "block",
                     opacity: "1",
                     visibility: "initial",
                     transform: "translateX(0)",
                     transition: "all 0.3s",
                  });
                  setTimeout(function () {
                     $(".loading-modal").css({
                        opacity: "0",
                        visibility: "hidden",
                        transform: "translateX(410px)",
                        transition: "all 0.3s",
                     });
                  }, 5000);

                  if ($("[data-wishlist-container]").length) {
                     nuranium.createNovWishListTplItem(ProductHandle);
                  }

                  wishListsArr.push(ProductHandle);
                  localStorage.setItem(
                     "wishListsArr",
                     JSON.stringify(wishListsArr)
                  );
               } else {
                  self.removeClass("whislist-added");
                  self
                     .find(".wishlist-text")
                     .text(theme.strings.add_to_wishlist);

                  if (
                     $('[data-wishlist-added="wishlist-' + productId + '"]')
                        .length
                  ) {
                     $(
                        '[data-wishlist-added="wishlist-' + productId + '"]'
                     ).remove();
                  }

                  wishListsArr.splice(idxArr, 1);
                  localStorage.setItem(
                     "wishListsArr",
                     JSON.stringify(wishListsArr)
                  );
               }

               nuranium.setNovAddedForWishlistIcon(ProductHandle);
            });
      },
      doAddOrRemoveWishlistProduct: function () {
         var iconWishLists = ".product-single a[data-icon-wishlist]";

         $(document)
            .off("click.addOrRemoveWishlist", iconWishLists)
            .on("click.addOrRemoveWishlist", iconWishLists, function (e) {
               e.preventDefault();

               var self = $(this),
                  productId = self.data("id"),
                  ProductHandle = self.data("product-handle"),
                  idxArr = wishListsArr.indexOf(ProductHandle);

               if (!self.hasClass("whislist-added")) {
                  self.addClass("whislist-added");
                  self
                     .find(".wishlist-text")
                     .text(theme.strings.remove_wishlist);

                  var title = self
                     .parents(".product-single")
                     .find(".product-single__title")
                     .html();
                  var image = self
                     .parents(".product-single")
                     .find(".product-single__photos .thumblist .thumbItem img")
                     .attr("src");
                  $(".loading-modal").find(".product-title").html(title);
                  $(".loading-modal").find(".product-image").attr("src", image);
                  $(".loading-modal").find(".btn-wishlist").show();
                  $(".loading-modal").css({
                     opacity: "1",
                     visibility: "initial",
                     transform: "translateX(0)",
                     transition: "all 0.3s",
                  });
                  $(".loading-modal").addClass("novload");
                  setTimeout(function () {
                     $(".loading-modal").css({
                        opacity: "0",
                        visibility: "hidden",
                        transform: "translateX(410px)",
                        transition: "all 0.3s",
                     });
                     $(".loading-modal").removeClass("novload");
                  }, 5000);

                  if ($("[data-wishlist-container]").length) {
                     novtheme.createNovWishListTplItem(ProductHandle);
                  }

                  wishListsArr.push(ProductHandle);
                  localStorage.setItem(
                     "wishListsArr",
                     JSON.stringify(wishListsArr)
                  );
               } else {
                  self.removeClass("whislist-added");
                  self
                     .find(".wishlist-text")
                     .text(theme.strings.add_to_wishlist);

                  if (
                     $('[data-wishlist-added="wishlist-' + productId + '"]')
                        .length
                  ) {
                     $(
                        '[data-wishlist-added="wishlist-' + productId + '"]'
                     ).remove();
                  }

                  wishListsArr.splice(idxArr, 1);
                  localStorage.setItem(
                     "wishListsArr",
                     JSON.stringify(wishListsArr)
                  );
               }

               novtheme.setNovAddedForWishlistIcon(ProductHandle);
            });
      },
      createNovWishListTplItem: function (ProductHandle) {
         var wishListCotainer = $("[data-wishlist-container]");

         jQuery.getJSON(
            window.router + "/products/" + ProductHandle + ".js",
            function (product) {
               var productHTML = "",
                  price_min = Shopify.formatMoney(
                     product.price_min,
                     "${{amount}}"
                  );

               productHTML +=
                  '<div class="grid-item" data-wishlist-added="wishlist-' +
                  product.id +
                  '">';
               productHTML +=
                  '<div class="inner item-product row align-items-center" data-product-id="product-' +
                  product.handle +
                  '">';
               productHTML +=
                  '<div class="column_content col-xl-5 col-lg-5 col-md-4 col-sm-12 col-xs-12"><div class="product-image">';
               productHTML +=
                  '<a href="' +
                  product.url +
                  '" class="product-grid-image" data-collections-related="/collections/all?view=related">';
               productHTML +=
                  '<img src="' +
                  product.featured_image +
                  '" alt="' +
                  product.featured_image.alt +
                  '">';
               productHTML += "</a></div>";
               productHTML += '<div class="product-info">';
               productHTML += '<div class="product-title">';
               productHTML +=
                  '<a href="' +
                  product.url +
                  '" title="' +
                  product.title +
                  '">' +
                  product.title +
                  "</a></div></div></div>";
               productHTML +=
                  '<div class="column_content col-xl-3 col-lg-3 col-md-2 col-sm-12 col-xs-12 text-center"><div class="price-box">' +
                  price_min +
                  "</div></div>";
               productHTML +=
                  '<div class="column_content col-xl-2 col-lg-2 col-md-3 col-sm-12 col-xs-12 text-center"><a class="btn whislist-added" href="#" data-product-handle="' +
                  product.handle +
                  '" data-icon-wishlist data-id="' +
                  product.id +
                  '"><i class="fa fa-trash-o" aria-hidden="true"></i>' +
                  theme.strings.remove +
                  "</a></div>";
               productHTML +=
                  '<div class="column_content col-xl-2 col-lg-2 col-md-3 col-sm-12 col-xs-12 text-center">';
               productHTML +=
                  '<form action="/cart/add" method="post" class="variants formAddToCart" id="-' +
                  product.id +
                  '" data-id="product-actions-' +
                  product.id +
                  '" enctype="multipart/form-data">';

               if (product.available) {
                  if (product.variants.length == 1) {
                     productHTML +=
                        '<button class="hover_x btn btnAddToCart" type="submit" data-form-id="#-' +
                        product.id +
                        '" data-pid="' +
                        product.variants[0].id +
                        '" ><span>' +
                        theme.strings.addToCart +
                        '</span><i class="zmdi zmdi-long-arrow-right"></i></button><input type="hidden" name="id" value="' +
                        product.variants[0].id +
                        '" />';
                  }
                  if (product.variants.length > 1) {
                     productHTML +=
                        '<a class="btn btnAddToCart btnChooseVariant" title="' +
                        product.title +
                        '" href="javascript:void(0);" data-url="' +
                        product.url +
                        '?view=json"><i class="zmdi zmdi-check"></i><span>' +
                        theme.strings.select_options +
                        "</span></a>";
                  }
               } else {
                  productHTML +=
                     '<button class="btn btnAddToCart" type="button" disabled="disabled">' +
                     theme.strings.soldOut +
                     "</button>";
               }

               productHTML += "</form></div>";

               productHTML += "</div></div>";

               wishListCotainer.append(productHTML);
            }
         );
      },

      ajaxAddToCart: function () {
         $(document).on("click", "button.btnAddToCart", function (e) {
            e.preventDefault();
            var $this = $(this),
               variant_id = $this.data("pid");
            $this.addClass("btn-loading");
            $this.parent().addClass("fix_nt_tt");
            $("body").addClass("loading");
            $.ajax({
               type: "POST",
               url: "/cart/add.js",
               data: { quantity: 1, id: variant_id },
               dataType: "json",
               success: function (cart) {
                  $.get("/cart?view=json", function (data) {
                     $("#cart-info").html(data);
                  }).always(function () {
                     /*Currency.convertAll(
                        shopCurrency,
                        $("#currencies span.selected").attr("data-currency")
                     );*/

                     //nuranium.initAddToCart(cart.image, cart.title);

                     nuranium.updateMiniCart();

                     //nuranium.PopupAddToCart();

                     nuranium.initQuickVariants();

                     $this
                        .removeAttr("disabled")
                        .css("pointer-events", "auto")
                        .removeClass("btn-loading");
                     $("body").removeClass("loading");

                     $(document).find(".quickviewClose").trigger("click");
                  });
               },
               error: function (XMLHttpRequest, textStatus) {
                  $this.removeClass("btn-loading");
               },
            }).done(function () {
               $("body").removeClass("loading");
            });
         });
      },

      initAddToCart: function (image, title) {
         $.ajax({
            url: "/cart/?view=upsell",
            dataType: "html",
            type: "GET",
            beforeSend: function () {
               $("body").addClass("cart_popup_opened");
               $("body").addClass("loading");
               $("#jas-wrapper").after(
                  '<div class="loader"><div class="loader-inner"></div></div>'
               );
            },
            success: function (data) {
               $.magnificPopup.open({
                  items: {
                     src:
                        '<div class="nov-with-anim product-quickview popup-quick-view cart__popup cart__popup_upsell"><div id="content_cart__popup_nt">' +
                        data +
                        "</div></div>",
                     type: "inline",
                  },
                  removalDelay: 500,
                  closeMarkup: '<i class="zmdi zmdi-hc-fw zmdi-close"></i>',
                  callbacks: {
                     beforeOpen: function () {
                        this.st.mainClass = "nov-move-horizontal";
                     },
                     open: function () {
                        nuranium.PopupAddToCart();
                        nuranium.initQuickVariants();
                        /*Currency.convertAll(
                           shopCurrency,
                           $("#currencies span.selected").attr("data-currency")
                        );*/
                     },
                     change: function () {},
                     close: function () {
                        if ($("body").hasClass("template-cart")) {
                          console.log('A');
                           window.location.reload();
                        } else {
                          console.log('B');
                           $("body").removeClass("cart_popup_opened");
                           $("body").removeClass("open_quick_variants");
                           $("body").removeClass("loading");
                           $("#content_cart__popup_nt").empty();
                        }
                     },
                  },
               });
            },
            complete: function () {
               nuranium.PopupAddToCart();
               /*Currency.convertAll(
                  shopCurrency,
                  $("#currencies span.selected").attr("data-currency")
               );*/
               $(".loader").remove();
            },
            error: function () {
               $(".loader").remove();
            },
         }).done(function () {
            $("body").removeClass("loading");
         });
      },

      updateMiniCart: function () {
         Shopify.getCart(function (cart) {
            nuranium.doUpdateMiniCart(cart);
         });
      },

      doUpdateMiniCart: function (cart) {
         $("#CartCount").text(cart.item_count);
         $(".cart-popup-heading span").html(
            "There are " + cart.item_count + " item(s) in your cart"
         );
      },

      ajaxChangeFromCart: function () {
         $(document).on("change", ".cart__popup-qty--input", function (e) {
            e.preventDefault();
         });
      },

      PopupAddToCart: function () {
         function PopupUpdateCart(_id, new_qty) {
            $(".cart__popup").addClass("loading");
            $.ajax({
               type: "POST",
               url: "/cart/change.js",
               data: "quantity=" + new_qty + "&id=" + _id,
               dataType: "json",
               success: function (cart) {
                  jQuery
                     .get("/cart?view=up_ajax", function (data) {
                        data = jQuery(data);
                        var sdata = jQuery(data);
                        var t_html = jQuery(sdata.get(0)).html(),
                           t_threshold = jQuery(sdata.get(2)).html(),
                           t_total = $(".cart__popup #" + _id).find(
                              ".cart__popup-total .amount"
                           );

                        $(".cart__popup #" + _id)
                           .find(".cart__popup-qty--input")
                           .val(new_qty);

                        var price = parseFloat(t_total.data("price")) * new_qty;
                        t_total.html(
                           Shopify.formatMoney(price, theme.moneyFormat)
                        );
                       console.log('t_html', t_html);
                        $("#cart__popup_total").html(t_html);
                        $("#threshold_bar_popup").html(t_threshold);
                     })
                     .always(function () {
                        /*Currency.convertAll(
                           shopCurrency,
                           $("#currencies span.selected").attr("data-currency")
                        );*/
                        $(".cart__popup").removeClass("loading");
                     });

                  $.get("/cart?view=json", function (data) {
                     $("#cart-info").html(data);
                  }).always(function () {
                     /*Currency.convertAll(
                        shopCurrency,
                        $("#currencies span.selected").attr("data-currency")
                     );*/
                     nuranium.updateMiniCart();
                  });
               },
               error: function (XMLHttpRequest, textStatus) {
                  $(".cart__popup").removeClass("loading");
               },
            });
         }

         $(document).on("click", ".cart__popup-qty", function (e) {
            e.preventDefault();

            var $this = $(this),
               $qty = $this.siblings(".cart__popup-qty--input"),
               $id = $qty.attr("data-id"),
               $qtyinput = parseFloat($qty.val()),
               $step = parseFloat($qty.attr("step")),
               $min = parseFloat($qty.attr("min")),
               $max = parseFloat($qty.attr("max"));

            if ($this.hasClass("cart__popup-qty--plus")) {
               var $newqty = $qtyinput + $step;
               if ($newqty > $max && $max > 0) {
                  $qty.val($max);
                  return;
               }
            } else if ($this.hasClass("cart__popup-qty--minus")) {
               var $newqty = $qtyinput - $step;
               if ($newqty === 0) {
                  var last_qty = parseInt($qty.attr("value"));
                  $qty.val(last_qty);
                  $this
                     .parents(".cart__popup-item")
                     .find(".cart__popup-remove")
                     .trigger("click");
                  return;
               } else if ($newqty < $min) {
                  return;
               } else if ($qtyinput < 0) {
                  alert("Invalid");
                  return;
               }
            }

            PopupUpdateCart($id, $newqty);
         });

         $(document).on("click", ".cart__popup-remove", function (e) {
            e.preventDefault();

            $(".cart__popup").addClass("loading");

            var $this = $(this),
               $qty = $this
                  .siblings(".cart__popup-quantity")
                  .find(".cart__popup-qty--input"),
               $id = $this.find("a").attr("data-product-id"),
               $qtyinput = parseInt($qty.val());
            $ptitle = $this
               .parent(".cart__popup-item")
               .find(".cart__popup-title a")
               .text();

            $(".cart__popup").addClass("loading");

            $.ajax({
               type: "POST",
               url: "/cart/change.js",
               data: "quantity=0&id=" + $id,
               dataType: "json",
               success: function (cart) {
                  jQuery
                     .get("/cart?view=up_ajax", function (data) {})
                     .always(function (data) {
                        data = jQuery(data);
                        var sdata = jQuery(data);
                        var t_html = jQuery(sdata.get(0)).html(),
                           t_threshold = jQuery(sdata.get(2)).html();
                        $("#cart__popup_total").html(t_html);
                        $("#threshold_bar_popup").html(t_threshold);
                        $(".cart__popup #" + $id).addClass("hide");
                        if ($qtyinput > 0) {
                           $("#" + $id + " input").val($qtyinput);
                        } else {
                           $(".cart__popup #" + $id + " input").val(1);
                        }

                        /*Currency.convertAll(
                           shopCurrency,
                           $("#currencies span.selected").attr("data-currency")
                        );*/

                        $(".cart__popup .cart-message").html(
                           '<i class="fa fa-trash-o"></i> <strong>' +
                              $ptitle +
                              "</strong> - has been removed into your shopping cart."
                        );

                        $(".cart__popup .cart-message")
                           .removeClass("removed")
                           .addClass("removed");

                        $(".cart__popup").removeClass("loading");

                        $this.parents(".cart__popup-item").remove();
                     });

                  $.get("/cart?view=json", function (data) {
                     $("#cart-info").html(data);
                  }).always(function () {
                     /*Currency.convertAll(
                        shopCurrency,
                        $("#currencies span.selected").attr("data-currency")
                     );*/

                     nuranium.updateMiniCart();
                  });
               },
            });
         });
      },

      initMiniCart: function () {
         jQuery.getJSON("/cart.js", function (cart) {
           console.log('INIT CART'+cart.item_count);
            $("#CartCount").text(cart.item_count);
            $("#cart-info").html("");
            if (cart.item_count > 0) {
               var html = "";
               html +=
                  '<form action="/cart" method="post" class="cart ajaxcart">';
               html += '<div class="ajaxcart__inner">';
               for (var i = 0; i < cart.items.length; i++) {
                  var image = Shopify.resizeImage(cart.items[i].image, "small");
                  var price = Shopify.formatMoney(
                     cart.items[i].price,
                     theme.moneyFormat
                  );

                  html +=
                     '<div class="ajaxcart__product" data-line="' + i + '">';
                  html += '<div class="media">';
                  html +=
                     '<a href="' +
                     cart.items[i].url +
                     '"><img class="d-flex product-image" src="' +
                     image +
                     '" alt="' +
                     cart.items[i].title +
                     '" title="' +
                     cart.items[i].title +
                     '"></a>';
                  html += '<div class="media-body">';
                  html +=
                     '<a class="product-name" href="' +
                     cart.items[i].url +
                     '">';
                  html +=
                     '<span class="title">' +
                     cart.items[i].product_title +
                     "</span>";
                  if (cart.items[i].variant_title)
                     html +=
                        '<span class="bt_s">' +
                        cart.items[i].variant_title +
                        "</span>";
                  html += "</a>";
                  html += '<div class="mb-5"></div>';
                  html +=
                     '<span class="product-price"><span class="money">' +
                     price +
                     "</span></span>";
                  html +=
                     '<span class="quantity"> x ' +
                     cart.items[i].quantity +
                     "</span>";
                  html +=
                     '<a class="remove-from-cart" rel="nofollow" href="#" title="remove from cart" data-line="' +
                     i +
                     '" data-product-id="' +
                     cart.items[i].id +
                     '"><i class="fa fa-trash-o" aria-hidden="true"></i></a>';
                  html += "</div>";
                  html += "</div>";
                  html += "</div>";
               }
               html += "</div>";

               var price = cart.total_price;
               var freeshipping_value = theme.freeshipping_value;
               if (theme.show_free_shipping == true) {
                  if (
                     parseFloat(price / 100) < parseFloat(freeshipping_value)
                  ) {
                     var price_remain = (
                        parseFloat(freeshipping_value) - parseFloat(price / 100)
                     ).toFixed(0);

                     html += '<div id="threshold_bar_popup_minicart" class="AAAA">';
                     html += '<div class="cart_threshold">';
                     html +=
                        '<div class="threshold_spend">' +
                        theme.strings.spend +
                        " " +
                        Shopify.formatMoney(
                           price_remain * 100,
                           theme.moneyFormat
                        ) +
                        " " +
                        theme.strings.spend__html +
                        "</div>";
                     html += '<div class="threshold_bar">';
                     html +=
                        '<span class="animate" style="width:' +
                        (price / freeshipping_value).toFixed(0) +
                        '%!important">';
                     html +=
                        "<span>" +
                        (price / freeshipping_value).toFixed(0) +
                        "%</span>";
                     html += "</span>";
                     html += "</div>";
                     html += "</div>";
                     html += "</div>";
                  } else {
                     html += '<div id="threshold_bar_popup_minicart" class="B">';
                     html += '<div class="threshold_bar hide">';
                     html +=
                        '<span class="animate" style="width: 100% !important;">100%</span>';
                     html += "</div>";
                     html += '<p class="content_threshold threshold_congrats">';
                     html +=
                        "<span>" +
                        theme.strings.content_threshold +
                        '</span><i class="zmdi zmdi-truck"></i>';
                     html += "</p>";
                     html += "</div>";
                  }
               }

               html += '<div class="ajaxcart__footer">';
               html +=
                  '<div class="subtotal d-flex align-items-center justify-content-between">';
               html += "<label>" + theme.strings.total + "</label>";
               html +=
                  '<span class="money">' +
                  Shopify.formatMoney(cart.total_price, theme.moneyFormat) +
                  "</span>";
               html += "</div>";
               html +='<div class="cart-bottom"> <ul class="sales_points newul"> <li class="sales_point"> <span class="icon-and-text"> <img src="https://5203b3-0b.myshopify.com/cdn/shop/files/21-05-2024_4-00-10_PM_220x.jpg"> <span>Vegan Friendly</span> </span> </li> <li class="sales_point"> <span class="icon-and-text"> <img src="https://5203b3-0b.myshopify.com/cdn/shop/files/21-05-2024_4-01-45_PM_220x.jpg"> <span>Cruelty Free</span> </span> </li> <li class="sales_point"> <span class="icon-and-text"> <img src="https://5203b3-0b.myshopify.com/cdn/shop/files/21-05-2024_4-06-37_PM_220x.jpg"> <span>Sustainable</span> </span> </li> <li class="sales_point"> <span class="icon-and-text"> <img src="https://5203b3-0b.myshopify.com/cdn/shop/files/21-05-2024_4-09-00_PM_220x.jpg"> Paraben Free </span> </li> </ul> </div>';
               html += '<div class="btn_submit">';
               html +=
                  '<button type="submit" class="hover_x btn cart__checkout" name="checkout"><span>' +
                  theme.strings.check_out +
                  '</span><i class="zmdi zmdi-long-arrow-right"></i></button>';
               html +=
                  '<a href="/cart" class="hover_x btn"><span>' +
                  theme.strings.view_cart +
                  '</span><i class="zmdi zmdi-long-arrow-right"></i></a>';
               html += "</div>";
               html += "</div>";
               html += "</form>";
               $("#cart-info").append(html);

               /*Currency.convertAll(
                  shopCurrency,
                  $("#currencies span.selected").attr("data-currency")
               );*/
            } else {
               var link_collection = $(".link_to_collection_cart_empty").html();
               var html = "";
               html += '<div class="cart cart_empty">';
               html +=
                  '<div class="empty_title text-center mt-60">' +
                  theme.strings.cart_empty +
                  "</div>";
               html += '<div class="text-center mt-40 block_link_cart">';
               html += "" + link_collection + "";
               html += "</div>";
               html += "</div>";
               $("#cart-info").append(html);
            }
         });
      },

      ajaxProductAddToCart: function () {
         $(document).on("click", ".product-form__cart-submit", function (e) {
            e.preventDefault();
            var $this = $(this);
            $(this)
               .attr("disabled", "disabled")
               .css("pointer-events", "none")
               .addClass("btn--loader-active");
            $.ajax({
               type: "POST",
               url: "/cart/add.js",
               data: $this.parents("form").serialize(),
               dataType: "json",
               success: function (cart) {
                  $.get("/cart?view=json", function (data) {
                     $("#cart-info").html(data);
                  }).always(function () {
                     /*Currency.convertAll(
                        shopCurrency,
                        $("#currencies span.selected").attr("data-currency")
                     );*/

                     nuranium.initAddToCart(cart.image, cart.title);

                     nuranium.updateMiniCart();

                     nuranium.PopupAddToCart();

                     $this
                        .removeAttr("disabled")
                        .css("pointer-events", "auto")
                        .removeClass("btn--loader-active");

                     $(document).find(".quickviewClose").trigger("click");
                  });
               },
               complete: function () {
                  $("body").removeClass("cart_popup_opened");
                  $("body").removeClass("loading");
                  $(".nov-close, .cart_popup_opened .nov-ready").on(
                     "click",
                     function () {
                        if ($("body").hasClass("template-cart")) {
                           window.location.reload();
                        }
                     }
                  );
               },
            }).done(function () {
               $("body").removeClass("loading");
            });
         });
      },

      initQuickView: function () {
         $(document).on("click", ".btnProductQuickview", function (e) {
            e.preventDefault();

            var $this = $(this);

            $.ajax({
               beforeSend: function () {
                  $this.addClass("btn-loading");
                  $("body").addClass("open_gl_quick_view");
                  $("body").addClass("loading");
               },
               url: $this.attr("data-url"),
               success: function (data) {
                  $.magnificPopup.open({
                     items: {
                        src:
                           '<div class="nov-with-anim popup-quick-view" id="content_quickview">' +
                           data +
                           "</div>",
                        type: "inline",
                     },
                     removalDelay: 500,
                     closeMarkup: '<i class="zmdi zmdi-hc-fw zmdi-close"></i>',
                     callbacks: {
                        beforeOpen: function () {
                           this.st.mainClass = "nov-move-horizontal";
                        },
                        open: function () {
                           if ($("html").hasClass("lang-rtl")) rtl = true;
                           else rtl = false;
                           var autoplay = $(
                              "#productThumbs .owl-carousel"
                           ).data("autoplay");
                           var autoplayTimeout = $(
                              "#productThumbs .owl-carousel"
                           ).data("autoplayTimeout");
                           var items = $("#productThumbs .owl-carousel").data(
                              "items"
                           );
                           var margin = $("#productThumbs .owl-carousel").data(
                              "margin"
                           );
                           var nav = $("#productThumbs .owl-carousel").data(
                              "nav"
                           );
                           var dots = $("#productThumbs .owl-carousel").data(
                              "dots"
                           );
                           var loop = $("#productThumbs .owl-carousel").data(
                              "loop"
                           );
                           var items_tablet = $(
                              "#productThumbs .owl-carousel"
                           ).data("items_tablet")
                              ? $("#productThumbs .owl-carousel").data(
                                   "items_tablet"
                                )
                              : 3;
                           var items_mobile = $(
                              "#productThumbs .owl-carousel"
                           ).data("items_mobile")
                              ? $("#productThumbs .owl-carousel").data(
                                   "items_mobile"
                                )
                              : 1;
                           var center = $("#productThumbs .owl-carousel").data(
                              "center"
                           )
                              ? $("#productThumbs .owl-carousel").data("center")
                              : false;
                           var start = $("#productThumbs .owl-carousel").data(
                              "start"
                           )
                              ? $("#productThumbs .owl-carousel").data("start")
                              : 0;
                           $("#productThumbs .owl-carousel").owlCarousel({
                              navText: [
                                 '<i class="fa fa-long-arrow-left"></i>',
                                 '<i class="fa fa-long-arrow-right"></i>',
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
                           Shopify.PaymentButton.init();

                           /*Currency.convertAll(
                              shopCurrency,
                              $("#currencies span.selected").attr(
                                 "data-currency"
                              )
                           );*/

                           jQuery(function () {
                              jQuery(".swatch :radio").change(function () {
                                 var optionIndex = jQuery(this)
                                    .closest(".swatch")
                                    .attr("data-option-index");
                                 var optionValue = jQuery(this).val();
                                 var sku = jQuery(this).data("sku");
                                 jQuery(this)
                                    .closest("form")
                                    .find(".single-option-selector")
                                    .eq(optionIndex)
                                    .val(optionValue)
                                    .trigger("change");

                                 jQuery(this)
                                    .parents(".watch_availabel")
                                    .find("span.variant_current")
                                    .text(optionValue);
                                 $("#content_quickview .variant-sku").text(sku);
                              });
                           });
                           $('.swatch-element[data-toggle="modal"]').click(
                              function () {
                                 $(".nov-bg").css("opacity", "0");
                                 $("#content_quickview").css("opacity", "0");
                              }
                           );
                           $("#Form_newletter").on(
                              "hidden.bs.modal",
                              function () {
                                 $(".nov-bg").css("opacity", "0.8");
                                 $("#content_quickview").css("opacity", "1");
                              }
                           );
                        },
                        close: function () {
                           $("#content_quickview").empty();
                           $("body").removeClass("open_gl_quick_view");
                           $("body").removeClass("cart_popup_opened");
                           $("body").removeClass("open_quick_variants");
                           $("body").removeClass("loading");
                        },
                     },
                  });
               },
               complete: function () {
                  Shopify.PaymentButton.init();
               },
            }).done(function () {
               $this.removeClass("btn-loading");
               $("body").removeClass("loading");
            });
         });
      },

      initQuickVariants: function () {
         $(document).on("click", ".btnChooseVariant", function (e) {
            e.preventDefault();

            var $this = $(this);

            $.ajax({
               beforeSend: function () {
                  $this.addClass("btn-loading");
                  $("body").addClass("open_quick_variants");
                  $("body").addClass("loading");
               },
               url: $this.attr("data-url"),
               success: function (data) {
                  $.magnificPopup.open({
                     items: {
                        src:
                           '<div class="nov-with-anim popup-quick-view" id="content_variants">' +
                           data +
                           "</div>",
                        type: "inline",
                     },
                     removalDelay: 500,
                     closeMarkup: '<i class="zmdi zmdi-hc-fw zmdi-close"></i>',
                     callbacks: {
                        beforeOpen: function () {
                           this.st.mainClass = "nov-move-horizontal";
                        },
                        open: function () {
                           /*Currency.convertAll(
                              shopCurrency,
                              $("#currencies span.selected").attr(
                                 "data-currency"
                              )
                           );*/

                           jQuery(function () {
                              jQuery(".swatch :radio").change(function () {
                                 var optionIndex = jQuery(this)
                                    .closest(".swatch")
                                    .attr("data-option-index");
                                 var optionValue = jQuery(this).val();
                                 jQuery(this)
                                    .closest("form")
                                    .find(".single-option-selector")
                                    .eq(optionIndex)
                                    .val(optionValue)
                                    .trigger("change");

                                 $(this)
                                    .parents(".watch_availabel")
                                    .find("span.variant_current")
                                    .text(optionValue);
                              });
                           });
                           $('.swatch-element[data-toggle="modal"]').click(
                              function () {
                                 $(".nov-bg").css("opacity", "0");
                                 $("#content_variants").css("opacity", "0");
                              }
                           );
                           $("#Form_newletter").on(
                              "hidden.bs.modal",
                              function () {
                                 $(".nov-bg").css("opacity", "0.8");
                                 $("#content_variants").css("opacity", "1");
                              }
                           );

                           nuranium.PopupAddToCart();
                        },
                        close: function () {
                           if ($("body").hasClass("template-cart")) {
                              window.location.reload();
                           } else {
                              $("#content_variants").empty();
                              $("body").removeClass("open_quick_variants");
                              $("body").removeClass("cart_popup_opened");
                              $("body").removeClass("loading");
                           }
                        },
                     },
                  });
               },
               complete: function () {
                  Shopify.PaymentButton.init();

                  jQuery(function () {
                     jQuery(".swatch :radio").change(function () {
                        var optionIndex = jQuery(this)
                           .closest(".swatch")
                           .attr("data-option-index");
                        var optionValue = jQuery(this).val();
                        jQuery(this)
                           .closest("form")
                           .find(".single-option-selector")
                           .eq(optionIndex)
                           .val(optionValue)
                           .trigger("change");

                        $(this)
                           .parents(".watch_availabel")
                           .find("span.variant_current")
                           .text(optionValue);
                     });
                  });
               },
            }).done(function () {
               $this.removeClass("btn-loading");
               $("body").removeClass("loading");
            });
         });
      },

      ajaxRemoveFromCart: function () {
         $("#cart-info").on("click", ".remove-from-cart", function (e) {
            e.preventDefault();

            var $this = $(this),
               $id = $this.attr("data-product-id");

            $.ajax({
               type: "POST",
               url: "/cart/change.js",
               data: "quantity=0&id=" + $id,
               dataType: "json",
               success: function (cart) {
                  if ($("body").hasClass("template-cart")) {
                     window.location.reload();
                  } else {
                     nuranium.initMiniCart();
                  }
               },
            });
         });
      },

      changeQuantityPageCart: function () {
         function ShopifyCartChange(variant_id, quantity, callback) {
            var params = {
               type: "POST",
               url: "/cart/change.js",
               data: "quantity=" + quantity + "&line=" + variant_id,
               dataType: "json",
               success: function (cart) {
                  if (typeof callback === "function") {
                     callback(cart);
                  }
               },
               error: function (XMLHttpRequest, textStatus) {},
            };
            jQuery.ajax(params);
         }

         $(document).on(
            "change keyup",
            ".cart__qty-input, .cart__popup-qty--input",
            function () {
               var $this = $(this);
               var line = $this.data("line"),
                  val = parseInt($this.val()),
                  price = $this.data("price"),
                  max = $this.attr("max");
               if (isNaN(val)) return 0;

               max = isNaN(parseInt(max)) ? 9999 : parseInt(max);
               if (val > max) {
                  $this.attr("value", max).val(max);
               }
               val = val > max ? max : val;

               if (val <= 0) {
                  $this.closest("tr").remove();
               }

               ShopifyCartChange(line, val, function (res) {
                  $(".cart__subtotal").html(
                     Shopify.formatMoney(res.total_price, theme.moneyFormat)
                  );

                  $this
                     .parents(".cart_item")
                     .find(".product-subtotal")
                     .html(Shopify.formatMoney(price * val, theme.moneyFormat));

                  $("#CartCount").html(res.item_count);

                  $(".cart__heading span").html(
                     "There are " + res.item_count + " items in your cart"
                  );

                  /*Currency.convertAll(
                     shopCurrency,
                     $("#currencies span.selected").attr("data-currency")
                  );*/

                  jQuery.get("/cart?view=ship", function (data) {
                     $("#threshold_bar_popup").html(data);
                     setTimeout(function () {
                        /*Currency.convertAll(
                           shopCurrency,
                           $("#currencies span.selected").attr("data-currency")
                        );*/
                     }, 200);
                  });
                  $.get("/cart?view=json", function (data) {
                     $("#cart-info").html(data);
                  }).always(function () {
                     /*Currency.convertAll(
                        shopCurrency,
                        $("#currencies span.selected").attr("data-currency")
                     );*/
                     nuranium.updateMiniCart();
                  });
               });
            }
         );

         $(document).on("click", ".plus, .minus", function () {
            var $qty = $(this).closest(".cart__qty").find(".cart__qty-input"),
               currentVal = parseFloat($qty.val()),
               max = parseFloat($qty.attr("max")),
               min = parseFloat($qty.attr("min")),
               step = $qty.attr("step");

            if (!currentVal || currentVal === "" || currentVal === "NaN")
               currentVal = 0;
            if (max === "" || max === "NaN") max = "";
            if (min === "" || min === "NaN") min = 0;
            if (
               step === "any" ||
               step === "" ||
               step === undefined ||
               parseFloat(step) === "NaN"
            )
               step = 1;

            if ($(this).is(".plus")) {
               if (max && currentVal >= max) {
                  $qty.val(max);
               } else {
                  $qty.val(currentVal + parseFloat(step));
               }
            } else {
               if (min && currentVal <= min) {
                  $qty.val(min);
               } else if (currentVal > 0) {
                  $qty.val(currentVal - parseFloat(step));
               }
            }
            $qty.trigger("change");
         });

         $(document).on(
            "click",
            ".quick_view-qty-plus, .quick_view-qty-minus",
            function () {
               var $qty = $(this)
                     .closest(".quick_view_qty")
                     .find('input[name="quantity"]'),
                  currentVal = parseFloat($qty.val()),
                  max = parseFloat($qty.attr("max")),
                  min = parseFloat($qty.attr("min")),
                  step = $qty.attr("step");

               if (!currentVal || currentVal === "" || currentVal === "NaN")
                  currentVal = 0;
               if (max === "" || max === "NaN") max = "";
               if (min === "" || min === "NaN") min = 0;
               if (
                  step === "any" ||
                  step === "" ||
                  step === undefined ||
                  parseFloat(step) === "NaN"
               )
                  step = 1;

               if ($(this).is(".quick_view-qty-plus")) {
                  if (max && currentVal >= max) {
                     $qty.val(max);
                  } else {
                     $qty.val(currentVal + parseFloat(step));
                  }
               } else {
                  if (min && currentVal <= min) {
                     $qty.val(min);
                  } else if (currentVal > 0) {
                     $qty.val(currentVal - parseFloat(step));
                  }
               }
            }
         );
      },
   };
})(jQuery);
