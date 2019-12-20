import $ from 'jQuery';

{
  $(document).on('DOMContentLoaded', (ev) => {
    console.log(ev.target);
  })

  /**
   * @type {number[]}
   */
  const arr = new Array(7).fill(1);

  const preson = { name: '1111', title: '销售' };

  const { name } = preson;

  console.log(name)

  const ars = Array.of(3, 11, 8);


  class Car {
    constructor(name) {
      this.name = name;
    }
    sayName() {
      console.log(this.name);
    }
  }

  new Car('web前端').sayName();
}
