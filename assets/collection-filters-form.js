class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;
      FacetFiltersForm.filterData.some(filterDataUrl) ?
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
        FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });

  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
    $(".product-swatch-color a").click(function(e){
        e.preventDefault();
        var data_image_variant = $(this).data('image-variant');
        var src_img = $(this).parents('.item-product').find('.product__thumbnail');
        src_img.attr('srcset', data_image_variant);
        $(this).parents('.item-product').find(".product__thumbnail-second").addClass('hidden');
        $(this).parents('.item-product').find(".product__thumbnail").addClass('block');
        $(this).parent('.swatch-element').addClass('act').siblings().removeClass('act');
    });

    $(".product-swatch-color").each(function() {
        var n = $(this).children('.swatch-element').length - 3;
        if ($(this).children('.swatch-element').length > 3) {
            $(this).find('.number').text(n);
            $(this).find('.show_more').show();
        }
        $(this).find('.swatch-element:gt(2)').addClass('hide');
        $(this).children('.show_more').click(function () {
            if ($(this).hasClass('active')) {
                $(this).parent().find('.hide').hide();
                $(this).removeClass('active');
                $(this).parent().find('.number').show();
            } else {
                $(this).parent().find('.hide').show();
                $(this).addClass('active');
                $(this).parent().find('.number').hide();
            }
        })
    })
    Currency.convertAll(shopCurrency, $('#currencies span.selected').attr('data-currency'));
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    if(document.querySelector('price-range')) {
      const min = document.querySelector('[name="filter.v.price.gte"]').getAttribute('data-value');
      const max = document.querySelector('[name="filter.v.price.lte"]').getAttribute('data-value');
      const minName = document.querySelector('[name="filter.v.price.gte"]').getAttribute('name');
      const maxName = document.querySelector('[name="filter.v.price.lte"]').getAttribute('name');
      const valuemin = document.querySelector('[name="filter.v.price.gte"]').value;
      const valuemax = document.querySelector('[name="filter.v.price.lte"]').value;
      const url = new URLSearchParams(formData).toString();
      const a = url.match(/filter.v.price.gte=([^&#]*)/)[0];
      const b = url.match(/filter.v.price.lte=([^&#]*)/)[0];
      const c = document.querySelector('.filter-max__price span').textContent.slice(1);
      const d = document.querySelector('.filter-max__price').getAttribute('data-max');
      const searchParams = url.replace(a, minName + '=' + min).replace(b,  maxName + '=' + max);
      FacetFiltersForm.renderPage(searchParams, event);
    } else {
      const searchParams = new URLSearchParams(formData).toString();
      FacetFiltersForm.renderPage(searchParams, event);
    }
  }

  onSubmitHandlerSortBy(event, form){
    event.preventDefault();
    const formData = new FormData(form);
    if(document.querySelector('price-range')) {
      const min = document.querySelector('[name="filter.v.price.gte"]').getAttribute('data-value');
      const max = document.querySelector('[name="filter.v.price.lte"]').getAttribute('data-value');
      const minName = document.querySelector('[name="filter.v.price.gte"]').getAttribute('name');
      const maxName = document.querySelector('[name="filter.v.price.lte"]').getAttribute('name');
      const url = new URLSearchParams(formData).toString();
      const a = url.match(/filter.v.price.gte=([^&#]*)/)[0];
      const b = url.match(/filter.v.price.lte=([^&#]*)/)[0];
      const searchParams = url.replace(a, minName + '=' + min).replace(b,  maxName + '=' + max);
      FacetFiltersForm.renderPage(searchParams, event);
    } else {
      const searchParams = new URLSearchParams(formData).toString();
      FacetFiltersForm.renderPage(searchParams, event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input').forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
    this.querySelectorAll('input').forEach(element => element.addEventListener('input', this.setCurrency.bind(this)));
    var a = $('.filter-max__price').data('max'),
        b = $('.filter-max__price .money').text().slice(1);
        $('.facets__price').find("input").first().val(0);
        $('.facets__price').find("input").last().val(Math.round(b));
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
  setCurrency() {
    var a = $('.filter-max__price').data('max'),
        b = Number($('.filter-max__price .money').text().slice(1)),
        c = a/b,
        d = $('.facets__price').find("input").first().val(),
        e = $('.facets__price').find("input").last().val();
        $('.facets__price').find("input").first().attr({'data-value': Math.round(d*c), 'max': Math.round(e*c)});
        if (e < b) {
          $('.facets__price').find("input").last().attr({'data-value': Math.round(e*c), 'min': Math.round(d*c)});
        } else {
          $('.facets__price').find("input").last().attr({'data-value': a, 'min': Math.round(d*c)});
        }
  }
}
customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
      form.onActiveFilterClick(event);
    });
    $('.reset_price').click(function () {
      var max = $('.filter-max__price .money').text().slice(1),
          maxround = Math.round(max);
              $('.facets__price').find("input").first().val('0');
              $('.facets__price').find("input").last().val(maxround).attr('data-value', maxround);
    })
  }
}
customElements.define('facet-remove', FacetRemove);
