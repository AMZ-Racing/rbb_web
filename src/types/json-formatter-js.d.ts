declare module 'json-formatter-js' {

  export default class JSONFormatter {
    constructor(object: any);

    render() : any;
    openAtDepth(depth: number) : any;
  }

}
