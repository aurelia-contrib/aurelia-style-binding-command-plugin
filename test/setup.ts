// tslint:disable
import "aurelia-polyfills";
import { initialize } from "aurelia-pal-browser";


declare const require: any;

initialize();
(Error as any).stackTraceLimit = Infinity;

const testContext: any = require.context('./unit', true, /\.spec/);
testContext.keys().forEach(testContext);
