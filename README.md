## Aurelia Style Binding Command Plugin

  * Extends SyntaxInterpreter of default Binding Language implementation with commands `.style` (same with `.style-to-view`, `.style-one-way` but shorter), `.style-one-time`, `.style-two-way`, `.style-from-view` to bind to a single css rule of an element.
  
## Installation

  * Install the dependency
  ```
  npm install aurelia-style-binding-command-plugin
  ```

  * Import the module for side effect (auto extension)
  
  ```js
  // app-entry.js
  import 'aurelia-style-binding-command-plugin';

  ```

## Development

### Build the code

  * After installing dependencies, run `build`

  ```
  npm run build
  ```
    
### Test the code

  ```
  npm run test
  ```

## How it works

  * The `.style-*` binding commands instruct Aurelia to observe view model and assign new value to css property, like standard behavior of an Aurelia Binding. `.style-from-view` and `.style-two-way` work via `MutationObserver`, that detects change on `style` attribute of observed element.

## Possible extension

  * Normal usage looks like this:

  ```html
  <div background-color.style='background'></div>
  ```

  * The following syntax could be made to work:

  ```html
  <div style.background-color='background'></div>
  ```

  The former is predictable, it follows the `[attribute-name].[binding-command]=[expression]` pattern that you see everywhere in an Aurelia application. The later is a more natural syntax for reading, as `background-color` is a property of `style` property of the element. If you have any argument why it should be supported, please file an issue.
