import Swiper from "Swiper";
import $ from "jQuery";
import { filterInClientView } from '../tools/viewport';

{
  $(".nav").on("click", ".nav__item", function() {
    $(this)
      .addClass("nav__item--select")
      .siblings()
      .removeClass("nav__item--select");
  });

  var $slideNav = $(".swiper-container.slide-nav")[0];
  var $slideNavOriginTop = $slideNav.offsetTop;

  $(document).on("scroll", function() {
    if (this.documentElement.scrollTop > $slideNavOriginTop) {
      !$($slideNav).hasClass("slide-nav--fixed") &&
        $($slideNav).addClass("slide-nav--fixed");
    } else {
      $($slideNav).hasClass("slide-nav--fixed") &&
        $($slideNav).removeClass("slide-nav--fixed");
    }
  });
}

{
  const floors: HTMLDivElement[] = Array.prototype.slice.call(
    document.querySelectorAll('[data-floor^="slide-nav-"]'),
    0
  );
  const clientHeight = document.documentElement.clientHeight;

  const bannerSwiper = new Swiper(".swiper-container.main-banner", {
    loop: true,
    pagination: {
      el: ".swiper-pagination"
    }
  });

  const slidesPerView = 6;
  /**
   * 定义 页面 滚动状态
   * 如果 true 说明 页面 正在滚动
   */
  var pageTranslateState = false;
  /**
   * @see https://www.swiper.com.cn/api/clicks/207.html
   */
  var navSwiper = new Swiper(".swiper-container.slide-nav", {
    slidesPerView: slidesPerView,
    spaceBetween: 0,
    watchSlidesProgress: true,
    on: {
      init() {
        // @ts-ignore
        this.prevclickedIndex = 0;
      }
    },
  });

  $('.swiper-container.slide-nav').on('click', '.swiper-slide', (el) => {
    pageTranslateState = true;
    /**
     * @type {string}
     */
    var floorNav = $(el.target).data().floorNav;
    var target = document.querySelector<HTMLDivElement>("[data-floor=" + floorNav + "]")!;
    // target.scrollIntoView({ behavior: 'smooth' });
    $("html").animate(
      { scrollTop: $(target).offset()!.top - 60 + "px" },
      function() {
        /**
         * 动画执行完后 状态设置为 false
         */
        pageTranslateState = false;
      }
    );

    // @ts-ignore
    if (navSwiper.prevclickedIndex > navSwiper.clickedIndex) {
      // @ts-ignore
      navSwiper.translateTo(
        // @ts-ignore
        (navSwiper.clickedIndex / slidesPerView) * navSwiper.width,
        1000
      );
    } else {
      // @ts-ignore
      navSwiper.translateTo(
        (-navSwiper.clickedIndex / slidesPerView) * navSwiper.width,
        1000
      );
    }
    // @ts-ignore
    navSwiper.prevclickedIndex = navSwiper.clickedIndex;
  })

  $(document).on("scroll", function() {
    if (pageTranslateState) return;

    var clientViewElements = filterInClientView(floors, clientHeight);
    /**
     * @type {HTMLDivElement | undefined}
     */
    var target = clientViewElements[clientViewElements.length - 1];
    console.log($(target).index(), navSwiper.clickedIndex || 0);

    /**
     * navSwiper.clickedIndex 如果没有点击 此时 clickedIndex 可能是 undefined
     */
    if ($(target).index() > navSwiper.clickedIndex || 1) {
      // @ts-ignore
      navSwiper.translateTo(
        -($(target).index() / slidesPerView) * navSwiper.width,
        1000
      );
    } else {
      // @ts-ignore
      navSwiper.translateTo(
        ($(target).index() / slidesPerView) * navSwiper.width,
        1000
      );
    }

    // @ts-ignore
    navSwiper.prevclickedIndex = $(target).index();
  });

}
