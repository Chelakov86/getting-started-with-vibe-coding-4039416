// Type definitions for ical.js
declare module 'ical.js' {
  class Component {
    constructor(jCal: any[] | string, parent?: Component);
    getAllSubcomponents(name?: string): Component[];
    getFirstPropertyValue(name: string): any;
  }

  class Time {
    isDate: boolean;
    toJSDate(): Date;
  }

  function parse(input: string): any;

  namespace ICAL {
    export { Component, Time, parse };
  }

  export default ICAL;
}
