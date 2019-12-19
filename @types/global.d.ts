declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
  }
}


import Swiper from 'swiper';

declare global {
  var Swiper: Swiper;
}
