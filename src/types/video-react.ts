declare module 'video-react' {
  import React from "react";

  class Player implements React.Component<any> {
    props: Readonly<{ children?: React.ReactNode, fluid?: boolean, height?: number, width?: number }> & Readonly<any>;
    state: Readonly<any>;
    context: any;
    refs: { [p: string]: React.ReactInstance };

    setState<K extends keyof any>(state: any, callback?: () => any): void;

    forceUpdate(callBack?: () => any): void;

    render(): React.ReactInstance;
  }

}
