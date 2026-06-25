window.theme = window.theme || {};
theme.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];
    $(document).on('shopify:section:load', this._onSectionLoad.bind(this)).on('shopify:section:unload', this._onSectionUnload.bind(this)).on('shopify:section:select', this._onSelect.bind(this)).on('shopify:section:deselect', this._onDeselect.bind(this)).on('shopify:block:select', this._onBlockSelect.bind(this)).on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};
theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
    _createInstance: function(container, constructor) {
        var $container = $(container);
        var id = $container.attr('data-section-id');
        var type = $container.attr('data-section-type');
        constructor = constructor || this.constructors[type];
        if (_.isUndefined(constructor)) {
            return;
        }
        var instance = _.assignIn(new constructor(container), {
            id: id,
            type: type,
            container: container
        });
        this.instances.push(instance);
    },
    _onSectionLoad: function(evt) {
        var container = $('[data-section-id]', evt.target)[0];
        if (container) {
            this._createInstance(container);
        }
    },
    _onSectionUnload: function(evt) {
        this.instances = _.filter(this.instances, function(instance) {
            var isEventInstance = instance.id === evt.detail.sectionId;
            if (isEventInstance) {
                if (_.isFunction(instance.onUnload)) {
                    instance.onUnload(evt);
                }
            }
            return !isEventInstance;
        });
    },
    _onSelect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
            instance.onSelect(evt);
        }
    },
    _onDeselect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
            instance.onDeselect(evt);
        }
    },
    _onBlockSelect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
            instance.onBlockSelect(evt);
        }
    },
    _onBlockDeselect: function(evt) {
        var instance = _.find(this.instances, function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
            instance.onBlockDeselect(evt);
        }
    },
    register: function(type, constructor) {
        this.constructors[type] = constructor;
        $('[data-section-type=' + type + ']').each(function(index, container) {
            this._createInstance(container, constructor);
        }.bind(this));
    }
});
window.slate = window.slate || {};
slate.rte = {
    wrapTable: function(options) {
        options.$tables.wrap('<div class="' + options.tableWrapperClass + '"></div>');
    },
    wrapIframe: function(options) {
        options.$iframes.each(function() {
            $(this).wrap('<div class="' + options.iframeWrapperClass + '"></div>');
            this.src = this.src;
        });
    }
};
window.slate = window.slate || {};
slate.a11y = {
    pageLinkFocus: function($element) {
        var focusClass = 'js-focus-hidden';
        $element.first().attr('tabIndex', '-1').focus().addClass(focusClass).one('blur', callback);

        function callback() {
            $element.first().removeClass(focusClass).removeAttr('tabindex');
        }
    },
    focusHash: function() {
        var hash = window.location.hash;
        if (hash && document.getElementById(hash.slice(1))) {
            this.pageLinkFocus($(hash));
        }
    },
    bindInPageLinks: function() {
        $('a[href*=#]').on('click', function(evt) {
            this.pageLinkFocus($(evt.currentTarget.hash));
        }.bind(this));
    },
    trapFocus: function(options) {
        var eventName = options.namespace ? 'focusin.' + options.namespace : 'focusin';
        if (!options.$elementToFocus) {
            options.$elementToFocus = options.$container;
        }
        options.$container.attr('tabindex', '-1');
        options.$elementToFocus.focus();
        $(document).off('focusin');
        $(document).on(eventName, function(evt) {
            if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
                options.$container.focus();
            }
        });
    },
    removeTrapFocus: function(options) {
        var eventName = options.namespace ? 'focusin.' + options.namespace : 'focusin';
        if (options.$container && options.$container.length) {
            options.$container.removeAttr('tabindex');
        }
        $(document).off(eventName);
    }
};
theme.Currency = (function() {
    var moneyFormat = '${{amount}}';

    function formatMoney(cents, format) {
        if (typeof cents === 'string') {
            cents = cents.replace('.', '');
        }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = format || moneyFormat;

        function formatWithDelimiters(number, precision, thousands, decimal) {
            thousands = thousands || ',';
            decimal = decimal || '.';
            if (isNaN(number) || number === null) {
                return 0;
            }
            number = (number / 100.0).toFixed(precision);
            var parts = number.split('.');
            var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
            var centsAmount = parts[1] ? decimal + parts[1] : '';
            return dollarsAmount + centsAmount;
        }
        switch (formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
            case 'amount_no_decimals_with_space_separator':
                value = formatWithDelimiters(cents, 0, ' ');
                break;
        }
        return formatString.replace(placeholderRegex, value);
    }
    return {
        formatMoney: formatMoney
    };
})();
slate.Variants = (function() {
    function Variants(options) {
        this.$container = options.$container;
        this.product = options.product;
        this.singleOptionSelector = options.singleOptionSelector;
        this.originalSelectorId = options.originalSelectorId;
        this.enableHistoryState = options.enableHistoryState;
        this.currentVariant = this._getVariantFromOptions();
        $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
    }
    Variants.prototype = _.assignIn({}, Variants.prototype, {
        _getCurrentOptions: function() {
            var currentOptions = _.map($(this.singleOptionSelector, this.$container), function(element) {
                var $element = $(element);
                var type = $element.attr('type');
                var currentOption = {};
                if (type === 'radio' || type === 'checkbox') {
                    if ($element[0].checked) {
                        currentOption.value = $element.val();
                        currentOption.index = $element.data('index');
                        return currentOption;
                    } else {
                        return false;
                    }
                } else {
                    currentOption.value = $element.val();
                    currentOption.index = $element.data('index');
                    return currentOption;
                }
            });
            currentOptions = _.compact(currentOptions);
            return currentOptions;
        },
        _getVariantFromOptions: function() {
            var selectedValues = this._getCurrentOptions();
            var variants = this.product.variants;
            var found = _.find(variants, function(variant) {
                return selectedValues.every(function(values) {
                    return _.isEqual(variant[values.index], values.value);
                });
            });
            return found;
        },
        _onSelectChange: function() {
            var variant = this._getVariantFromOptions();
            this.$container.trigger({
                type: 'variantChange',
                variant: variant
            });
            if (!variant) {
                return;
            }
            this._updateMasterSelect(variant);
            this._updateImages(variant);
            this._updatePrice(variant);
            this._updateSKU(variant);
            this.currentVariant = variant;
            if (this.enableHistoryState) {
                this._updateHistoryState(variant);
            }
        },
        _updateImages: function(variant) {
            var variantImage = variant.featured_image || {};
            var currentVariantImage = this.currentVariant.featured_image || {};
            if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
                return;
            }
            this.$container.trigger({
                type: 'variantImageChange',
                variant: variant
            });
        },
        _updatePrice: function(variant) {
            if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
                return;
            }
            this.$container.trigger({
                type: 'variantPriceChange',
                variant: variant
            });
        },
        _updateSKU: function(variant) {
            if (variant.sku === this.currentVariant.sku) {
                return;
            }
            this.$container.trigger({
                type: 'variantSKUChange',
                variant: variant
            });
        },
        _updateHistoryState: function(variant) {
            if (!history.replaceState || !variant) {
                return;
            }
            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
            window.history.replaceState({
                path: newurl
            }, '', newurl);
        },
        _updateMasterSelect: function(variant) {
            $(this.originalSelectorId, this.$container).val(variant.id);
        }
    });
    return Variants;
})();
window.theme = theme || {};
// RecoverPassword Page Login
theme.customerTemplates = (function() {
    function initEventListeners() {
        // Show reset password form
        $('#RecoverPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });

        // Hide reset password form
        $('#HideRecoverPasswordLink').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });
    }

    /* Show/Hide recover password form */
    function toggleRecoverPasswordForm() {
        $('#RecoverPasswordForm').toggleClass('hide');
        $('#CustomerLoginForm').toggleClass('hide');
    }

    /* Show reset password success message */
    function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
          return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
    }

    /* Show/hide customer address forms */
    function customerAddressForm() {
        var $newAddressForm = $('#AddressNewForm');

        if (!$newAddressForm.length) {
          return;
        }

        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify) {
            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(
                'AddressCountryNew',
                'AddressProvinceNew',
                {
                  hideElement: 'AddressProvinceContainerNew'
                }
            );
        }

        // Initialize each edit form's country/province selector
        $('.address-country-option').each(function() {
            var formId = $(this).data('form-id');
            var countrySelector = 'AddressCountry_' + formId;
            var provinceSelector = 'AddressProvince_' + formId;
            var containerSelector = 'AddressProvinceContainer_' + formId;

            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                hideElement: containerSelector
            });
        });

        // Toggle new/edit address forms
        $('.address-new-toggle').on('click', function() {
            $newAddressForm.toggleClass('hide');
        });

        $('.address-edit-toggle').on('click', function() {
            var formId = $(this).data('form-id');
            $('#EditAddress_' + formId).toggleClass('hide');
        });

        $('.address-delete').on('click', function() {
            var $el = $(this);
            var formId = $el.data('form-id');
            var confirmMessage = $el.data('confirm-message');

            // eslint-disable-next-line no-alert
            if (
                confirm(
                    confirmMessage || 'Are you sure you wish to delete this address?'
                )
            ) {
                Shopify.postLink('/account/addresses/' + formId, {
                    parameters: { _method: 'delete' }
                });
            }
        });
    }

    /* Check URL for reset password hash */
    function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
          toggleRecoverPasswordForm();
        }
    }

    return {
        init: function() {
            checkUrlHash();
            initEventListeners();
            resetPasswordSuccess();
            customerAddressForm();
        }
    };
})();
// RecoverPassword Popup Index
theme.customerloginTemplates = (function() {
    function initEventsListeners() {
        // Show reset password form
        $('#RecoversPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordFormIndex();
        });

        // Hide reset password form
        $('#HideRecoverPasswordIndex').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordFormIndex();
        });
    }

    /* Show/Hide recover password form */
    function toggleRecoverPasswordFormIndex() {
        $('#RecoverPasswordFormIndex').toggleClass('hide');
        $('#CustomerAccountForm .block-form-login').toggleClass('hide');
    }

    return {
        init: function() {
            initEventsListeners();
        }
    };
})();
window.theme = window.theme || {};
theme.Cart = (function() {
    var selectors = {
        edit: '.js-edit-toggle'
    };
    var config = {
        showClass: 'cart__update--show',
        showEditClass: 'cart__edit--active',
        cartNoCookies: 'cart--no-cookies'
    };

    function Cart(container) {
        this.$container = $(container);
        this.$edit = $(selectors.edit, this.$container);
        if (!this.cookiesEnabled()) {
            this.$container.addClass(config.cartNoCookies);
        }
        this.$edit.on('click', this._onEditClick.bind(this));
    }
    Cart.prototype = _.assignIn({}, Cart.prototype, {
        onUnload: function() {
            this.$edit.off('click', this._onEditClick);
        },
        _onEditClick: function(evt) {
            var $evtTarget = $(evt.target);
            var $updateLine = $('.' + $evtTarget.data('target'));
            $evtTarget.toggleClass(config.showEditClass);
            $updateLine.toggleClass(config.showClass);
        },
        cookiesEnabled: function() {
            var cookieEnabled = navigator.cookieEnabled;
            if (!cookieEnabled) {
                document.cookie = 'testcookie';
                cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
            }
            return cookieEnabled;
        }
    });
    return Cart;
})();
theme.Product = (function() {
    function Product(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        this.settings = {
            mediaQueryMediumUp: 'screen and (min-width: 750px)',
            mediaQuerySmall: 'screen and (max-width: 749px)',
            bpSmall: false,
            enableHistoryState: $container.data('enable-history-state') || false,
            namespace: '.slideshow-' + sectionId,
            sectionId: sectionId,
            sliderActive: false,
            zoomEnabled: false
        };
        this.selectors = {
            addToCart: '#AddToCart-' + sectionId,
            addToCartText: '#AddToCartText-' + sectionId,
            comparePrice: '#ComparePrice-' + sectionId,
            originalPrice: '#ProductPrice-' + sectionId,
            SKU: '.variant-sku',
            originalPriceWrapper: '.product-price__price-' + sectionId,
            originalSelectorId: '#ProductSelect-' + sectionId,
            productImageWraps: '.product-single__photo',
            productPrices: '.product-single__price-' + sectionId,
            productThumbImages: '.product-single__thumbnail--' + sectionId,
            productThumbs: '.product-single__thumbnails-' + sectionId,
            saleClasses: 'product-price__sale product-price__sale--single',
            saleLabel: '.product-price__sale-label-' + sectionId,
            singleOptionSelector: '.single-option-selector-' + sectionId
        };
        if (!$('#ProductJson-' + sectionId).html()) {
            return;
        }
        this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);
        this.settings.zoomEnabled = $(this.selectors.productImageWraps).hasClass('js-zoom-enabled');
        this._initBreakpoints();
        this._stringOverrides();
        this._initVariants();
        this._initImageSwitch();
        this._setActiveThumbnail();
    }
    Product.prototype = _.assignIn({}, Product.prototype, {
        _stringOverrides: function() {
            theme.productStrings = theme.productStrings || {};
            $.extend(theme.strings, theme.productStrings);
        },
        _initBreakpoints: function() {
            var self = this;
            enquire.register(this.settings.mediaQuerySmall, {
                match: function() {
                    if ($(self.selectors.productThumbImages).length > 3) {
                        self._initThumbnailSlider();
                    }
                    if (self.settings.zoomEnabled) {
                        $(self.selectors.productImageWraps).each(function() {
                            _destroyZoom(this);
                        });
                    }
                    self.settings.bpSmall = true;
                },
                unmatch: function() {
                    if (self.settings.sliderActive) {
                        self._destroyThumbnailSlider();
                    }
                    self.settings.bpSmall = false;
                }
            });
            enquire.register(this.settings.mediaQueryMediumUp, {
                match: function() {
                    if (self.settings.zoomEnabled) {
                        $(self.selectors.productImageWraps).each(function() {
                            _enableZoom(this);
                        });
                    }
                }
            });
        },
        _initVariants: function() {
            var options = {
                $container: this.$container,
                enableHistoryState: this.$container.data('enable-history-state') || false,
                singleOptionSelector: this.selectors.singleOptionSelector,
                originalSelectorId: this.selectors.originalSelectorId,
                product: this.productSingleObject
            };
            this.variants = new slate.Variants(options);
            this.$container.on('variantChange' + this.settings.namespace, this._updateAddToCart.bind(this));
            this.$container.on('variantImageChange' + this.settings.namespace, this._updateImages.bind(this));
            this.$container.on('variantPriceChange' + this.settings.namespace, this._updatePrice.bind(this));
            this.$container.on('variantSKUChange' + this.settings.namespace, this._updateSKU.bind(this));
        },
        _initImageSwitch: function() {
            if (!$(this.selectors.productThumbImages).length) {
                return;
            }
            var self = this;
            $(this.selectors.productThumbImages).on('click', function(evt) {
                evt.preventDefault();
                var $el = $(this);
                var imageId = $el.data('thumbnail-id');
                self._switchImage(imageId);
                self._setActiveThumbnail(imageId);
            });
        },
        _setActiveThumbnail: function(imageId) {
            var activeClass = 'active-thumb';
            if (typeof imageId === 'undefined') {
                imageId = $(this.selectors.productImageWraps + ":not('.hide')").data('image-id');
            }
            var $thumbnail = $(this.selectors.productThumbImages + "[data-thumbnail-id='" + imageId + "']");
            $(this.selectors.productThumbImages).removeClass(activeClass);
            $thumbnail.addClass(activeClass);
        },
        _switchImage: function(imageId) {
            var $newImage = $(this.selectors.productImageWraps + "[data-image-id='" + imageId + "']", this.$container);
            var $otherImages = $(this.selectors.productImageWraps + ":not([data-image-id='" + imageId + "'])", this.$container);
            $newImage.removeClass('hide');
            $otherImages.addClass('hide');
        },
        _initThumbnailSlider: function() {
            var options = {
                slidesToShow: 4,
                slidesToScroll: 3,
                infinite: false,
                prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
                nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
                responsive: [{
                    breakpoint: 321,
                    settings: {
                        slidesToShow: 3
                    }
                }]
            };
            $(this.selectors.productThumbs).slick(options);
            this.settings.sliderActive = true;
        },
        _destroyThumbnailSlider: function() {
            $(this.selectors.productThumbs).slick('unslick');
            this.settings.sliderActive = false;
        },
        _updateAddToCart: function(evt) {
            var variant = evt.variant;
            if (variant) {
                $(this.selectors.productPrices).removeClass('visibility-hidden').attr('aria-hidden', 'true');
                if (variant.available) {
                    $(this.selectors.addToCart).prop('disabled', false);
                    $(this.selectors.addToCartText).text(theme.strings.addToCart);
                } else {
                    $(this.selectors.addToCart).prop('disabled', true);
                    $(this.selectors.addToCartText).text(theme.strings.soldOut);
                }
            } else {
                $(this.selectors.addToCart).prop('disabled', true);
                $(this.selectors.addToCartText).text(theme.strings.unavailable);
                $(this.selectors.productPrices).addClass('visibility-hidden').attr('aria-hidden', 'false');
            }
        },
        _updateImages: function(evt) {
            var variant = evt.variant;
            var imageId = variant.featured_image.id;
            this._switchImage(imageId);
            this._setActiveThumbnail(imageId);
        },
        _updatePrice: function(evt) {
            var variant = evt.variant;
            $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
            if (variant.compare_at_price > variant.price) {
                $(this.selectors.comparePrice).html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat)).removeClass('hide');
                $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);
                $(this.selectors.saleLabel).removeClass('hide');
            } else {
                $(this.selectors.comparePrice).addClass('hide');
                $(this.selectors.saleLabel).addClass('hide');
                $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
            }
        },
        _updateSKU: function(evt) {
            var variant = evt.variant;
            $(this.selectors.SKU).html(variant.sku);
        },
        onUnload: function() {
            this.$container.off(this.settings.namespace);
        }
    });

    function _enableZoom(el) {
        var zoomUrl = $(el).data('zoom');
        $(el).zoom({
            url: zoomUrl
        });
    }

    function _destroyZoom(el) {
        $(el).trigger('zoom.destroy');
    }
    return Product;
})();
theme.Nov_Owlcarousel = (function() {
    function Nov_Owlcarousel(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slider = (this.slider = '#shopify-section-' + sectionId + ' .nov-owl-carousel');
        if ($('html').hasClass('lang-rtl'))
            var rtl = true;
        else
            var rtl = false;
        var autoplay = $(slider).data('autoplay'),
            autoplayTimeout = $(slider).data('autoplayTimeout'),
            items = $(slider).data('items'),
            margin = $(slider).data('margin'),
            nav = $(slider).data('nav'),
            dots = $(slider).data('dots'),
            loop = $(slider).data('loop'),
            items_tablet = $(slider).data('items_tablet'),
            items_mobile = $(slider).data('items_mobile'),
            center = $(slider).data('center'),
            start = $(slider).data('start');
        $(slider).owlCarousel({
            navText: ['<i class="zmdi zmdi-chevron-left"></i>', '<i class="zmdi zmdi-chevron-right"></i>'],
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
                    loop: true,
                    autoHeight: true,
                },
                768: {
                    items: items_tablet,
                },
                1200: {
                    items: items,
                    center: center
                },
            }
        });
    }
    return Nov_Owlcarousel;
})();
theme.Nov_Slickcarousel = (function() {
    function Nov_Slickcarousel(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slider = (this.slider = '#shopify-section-' + sectionId + ' .nov-slick-carousel');
        if ($('html').hasClass('lang-rtl'))
            var rtl = true;
        else
            var rtl = false;
        var autoplay = $(slider).data("autoplay"),
            autoplaytimeout = $(slider).data("autoplaytimeout"),
            infinite = $(slider).data("loop"),
            dots = $(slider).data("dots"),
            nav = $(slider).data("nav"),
            rows = $(slider).data("row"),
            rows_mobile = $(slider).data("row_mobile") ? $(slider).data("row_mobile") : 1,
            loop = $(slider).data('loop'),
            fade = $(slider).data("fade"),
            items = $(slider).data("items"),
            items_lg_desktop = $(slider).data("items_lg_desktop"),
            items_lg_tablet = $(slider).data("items_lg_tablet"),
            items_tablet = $(slider).data("items_tablet"),
            items_mobile = $(slider).data("items_mobile"),
            items_mobiles = $(slider).data("items_mobiles");
            custombutton = $(slider).data("custombutton");
            if (typeof custombutton != "undefined") {
              nav = false;
            }
        $(slider).slick({
            nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-long-arrow-right"></i></div>',
            prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-long-arrow-left"></i></div>',
            rtl: rtl,
            slidesToShow: items,
            slidesToScroll: 1,
            rows: rows,
            arrows: nav,
            dots: dots,
            infinite: infinite,
            fade: fade,
            responsive: [
                {
                    breakpoint: 1920,
                    settings: {
                        slidesToShow: items,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: items_lg_tablet,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: items_tablet,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: items_mobile,
                        slidesToScroll: 1,
                        rows: rows_mobile
                    }
                }
            ]
        });
        if (typeof custombutton != "undefined") {
            $('.prev_custom', '#shopify-section-' + sectionId).click(function(){
              $(slider).slick('slickPrev');
            })
            $('.next_custom', '#shopify-section-' + sectionId).click(function(){
               $(slider).slick('slickNext');
            })
        }
    }
    return Nov_Slickcarousel;
})();
theme.Nov_SliderShow = (function() {
    function Nov_SliderShow(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slideWrapper = (this.slideWrapper = '#shopify-section-' + sectionId + ' .main-slider');
        
        if($('html').hasClass('lang-rtl'))
            var rtl = true;
        else
            var rtl = false;

        var autoplay = $(slideWrapper).data('autoplay'),
            speed = $(slideWrapper).data('speed'),
            arrows = $(slideWrapper).data('arrows'),
            dots = $(slideWrapper).data('dots'),
            iframes = $(slideWrapper).find('.embed-player'),
            lazyImages = $(slideWrapper).find('.slide-image'),
            lazyCounter = 0;

        function postMessageToPlayer(player, command) {
            if (player == null || command == null) return;
            player.contentWindow.postMessage(JSON.stringify(command), "*");
        }

        function resizePlayer(iframes, ratio) {
            if (!iframes[0]) return;
            var win = $(".main-slider"),
            width = win.width(),
            playerWidth, height = win.height(),
            playerHeight, ratio = ratio || 16 / 9;
            iframes.each(function() {
                var current = $(this);
                if (width / ratio < height) {
                    playerWidth = Math.ceil(height * ratio);
                    current.width(playerWidth).height(height).css({
                        left: (width - playerWidth) / 2,
                        top: 0
                    });
                } else {
                    playerHeight = Math.ceil(width / ratio);
                    current.width(width).height(playerHeight).css({
                        left: 0,
                        top: (height - playerHeight) / 2
                    });
                }
            });
        }
        $(function() {

            $(slideWrapper).on("init", function(slick) {
                slick = $(slick.currentTarget);
                resizePlayer(iframes, 16 / 9);
                $(".caption-animate", '.slick-current').each(function() {
                    var caption = $(this).data("animate");
                    $(this).addClass(caption);
                });
                $('.slick-current').addClass('zoomimg');
                $('.slick-current').addClass('timer');
            });
            $(slideWrapper).on("beforeChange", function(event, slick) {
                slick = $(slick.$slider);
                $(".caption-animate", '.slick-current').each(function() {
                    var caption = $(this).data("animate");
                    $(this).removeClass(caption);
                });
                $('.slick-current').removeClass('zoomimg');
                $('.slick-current').removeClass('timer');
            });
            $(slideWrapper).on("afterChange", function(event, slick) {
                $(".caption-animate", '.slick-current').each(function() {
                    var caption = $(this).data("animate");
                    $(this).addClass(caption);
                });
                $('.slick-current').addClass('zoomimg');
                $('.slick-current').addClass('timer');
                slick = $(slick.$slider);
            });
            $(slideWrapper).on("lazyLoaded", function(event, slick, image, imageSource) {
                lazyCounter++;
                if (lazyCounter === lazyImages.length) {
                    lazyImages.addClass('show');
                }
            });

            $(slideWrapper).slick({
                fade: true,
                nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-long-arrow-right"></i></div>',
                prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-long-arrow-left"></i></div>',
                autoplay: autoplay,
                autoplaySpeed: speed,
                lazyLoad: "progressive",
                pauseOnHover: false,
                speed: 600,
                arrows: arrows,
                dots: dots,
                cssEase: "cubic-bezier(0.87, 0.03, 0.41, 0.9)",
                rtl: rtl
            });
        });
        $(window).on("resize.slickVideoPlayer", function() {
            resizePlayer(iframes, 16 / 9);
        });
    }
    return Nov_SliderShow;
})();
theme.callbackReview = function() {
    if ($(".shopify-product-reviews-badge").length > 0) {
        return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
    }
}
$(document).ready(function() {
    var sections = new theme.Sections();
    sections.register('cart-template', theme.Cart);
    sections.register('product', theme.Product);
    sections.register('product-template', theme.Product);
    sections.register('slideshow-section', theme.Nov_SliderShow);
    sections.register('nov-owl', theme.Nov_Owlcarousel);
    sections.register('nov-slick', theme.Nov_Slickcarousel);
});
theme.init = function() {
    theme.customerTemplates.init();
    theme.customerloginTemplates.init();
    var tableSelectors = '.rte table,' + '.custom__item-inner--html table';
    slate.rte.wrapTable({
        $tables: $(tableSelectors),
        tableWrapperClass: 'scrollable-wrapper'
    });
    slate.a11y.pageLinkFocus($(window.location.hash));
    $('.in-page-link').on('click', function(evt) {
        slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
    });
    $('a[href="#"]').on('click', function(evt) {
        evt.preventDefault();
    });
};
$(theme.init);