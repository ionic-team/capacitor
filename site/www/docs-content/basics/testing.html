<h1 id="testing">Testing</h1>
<p>Stencil makes it easy to unit test your component using Jest and the Stencil unit testing framework.
The testing framework requires very little configuration and has a minimal API consisting of two functions:
<code>render()</code> and <code>flush()</code>. The Stencil unit testing framework can be used to test the rendering of the component
as well as the methods defined on the component class.</p>
<h2 id="testing-config">Testing Config</h2>
<p>Allowing a Stencil component project to run unit tests requires a small amount of configuration in the <code>package.json</code>
file. All of this configuration is included with the Stencil App Starter and the Stencil Component Starter so if you
use one of those templates to start your project, you should not have to add anything. This information is presented
here primarily for informational purposes.</p>
<p>Jest is installed as a development dependency:</p>
<pre><code>  <span class="hljs-string">"devDependencies"</span>: {
      ...
      <span class="hljs-string">"@types/jest"</span>: <span class="hljs-string">"^21.1.1"</span>,
      <span class="hljs-string">"jest"</span>: <span class="hljs-string">"^21.2.1"</span>
  },
</code></pre><p>NPM scripts are set up in order to run the tests:</p>
<pre><code>  <span class="hljs-string">"scripts"</span>: {
      ...
      <span class="hljs-string">"test"</span>: <span class="hljs-string">"jest --no-cache"</span>,
      <span class="hljs-string">"test.watch"</span>: <span class="hljs-string">"jest --watch --no-cache"</span>
  },
</code></pre><p>Jest is configured to find test files and to use the Stencil preprocessor script to compile the sources:</p>
<pre><code>  <span class="hljs-string">"jest"</span>: {
      <span class="hljs-string">"transform"</span>: {
        <span class="hljs-string">"^.+\\.(ts|tsx)$"</span>: <span class="hljs-string">"&lt;rootDir&gt;/node_modules/@stencil/core/testing/jest.preprocessor.js"</span>
      },
      <span class="hljs-string">"testRegex"</span>: <span class="hljs-string">"(/__tests__/.*|\\.(test|spec))\\.(tsx?|jsx?)$"</span>,
      <span class="hljs-string">"moduleFileExtensions"</span>: [
        <span class="hljs-string">"ts"</span>,
        <span class="hljs-string">"tsx"</span>,
        <span class="hljs-string">"js"</span>,
        <span class="hljs-string">"json"</span>,
        <span class="hljs-string">"jsx"</span>
      ]
  }
</code></pre><h2 id="component-rendering-tests">Component Rendering Tests</h2>
<p>The Stencil testing framework API contains two functions that are used to render components for testing:</p>
<ul>
<li><p><code>render({ components: [], html: string })</code> - The <code>render()</code> function takes a list of components and an HTML snippet
and returns the promise of the rendered HTML element.</p>
</li>
<li><p><code>flush(element)</code> - The <code>flush()</code> function is used to refresh the rendering of an element after property changes are made.
This function returns a promise that is resolved when the flush is complete.</p>
</li>
</ul>
<p>Both of these function operate asynchronously.</p>
<p>A common testing pattern when rendering is to <code>render()</code> the component in the <code>beforeEach()</code> for a suite of tests. Each
test case then modifies the element and uses <code>flush(element)</code> to refresh the node.</p>
<h3 id="rendering-a-component">Rendering a Component</h3>
<p>Use the <code>render()</code> function to initially render a component.</p>
<p>This function takes a configuration object with two parameters:</p>
<ul>
<li><p><code>components</code>: a list of components the renderer needs to know about. Generally, this only needs to contain the
component being tested. Child components can also be included if you need to have them rendered for your test
but this is not a requirement otherwise.</p>
</li>
<li><p><code>html</code>: an HTML snippet used to render the component. Usually this just looks like <code>&lt;my-component&gt;&lt;/my-component&gt;</code>.</p>
</li>
</ul>
<p>This function returns a promise that is resolved with the rendered HTML element.</p>
<pre><code class="lang-ts">beforeEach(<span class="hljs-name">async</span> () =&gt; {
  element = await render({
    components: [MyName],
    html: '&lt;my-name&gt;&lt;/my-name&gt;'
  })<span class="hljs-comment">;</span>
})<span class="hljs-comment">;</span>
</code></pre>
<h3 id="refreshing-a-component">Refreshing a Component</h3>
<p>Use the <code>flush()</code> function to re-render the node as needed. This is typically done after changing property values
on the component.</p>
<pre><code class="lang-ts">it('should work with both the first and the last name', async () =&gt; {
  element.first = 'Peter'
  element.last = 'Parker'<span class="hljs-comment">;</span>
  await flush(<span class="hljs-name">element</span>)<span class="hljs-comment">;</span>
  expect(<span class="hljs-name">element</span>.textContent).toEqual('Hello, my name is Peter Parker')<span class="hljs-comment">;</span>
})<span class="hljs-comment">;</span>
</code></pre>
<h3 id="examining-the-element">Examining the Element</h3>
<p>Since the rendered element is an HTMLElement, you can use methods and properties from the
<a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement">HTMLElement interface</a> in order to examine the
contents of the element.</p>
<p>Let&#39;s say that instead of printing the first and last names, our component had to split the names apart on spaces
and print a list of each part of the name. We could write a rendering test for that as such:</p>
<pre><code class="lang-ts">    it('should least each part of the name breaking on spaces', async () =&gt; {
      element.first = 'Pasta Primavera'<span class="hljs-comment">;</span>
      element.last = 'O Shea Buttersworth'<span class="hljs-comment">;</span>
      await flush(<span class="hljs-name">element</span>)<span class="hljs-comment">;</span>
      const list = element.querySelector('ul')<span class="hljs-comment">;</span>
      expect(<span class="hljs-name">list</span>.children.length).toEqual(<span class="hljs-number">5</span>)<span class="hljs-comment">;</span>
      expect(<span class="hljs-name">list</span>.children[<span class="hljs-number">0</span>].textContent).toEqual('Pasta')<span class="hljs-comment">;</span>
      expect(<span class="hljs-name">list</span>.children[<span class="hljs-number">1</span>].textContent).toEqual('Primavera')<span class="hljs-comment">;</span>
      expect(<span class="hljs-name">list</span>.children[<span class="hljs-number">2</span>].textContent).toEqual('O')<span class="hljs-comment">;</span>
      expect(<span class="hljs-name">list</span>.children[<span class="hljs-number">3</span>].textContent).toEqual('Shea')<span class="hljs-comment">;</span>
      expect(<span class="hljs-name">list</span>.children[<span class="hljs-number">4</span>].textContent).toEqual('Buttersworth')<span class="hljs-comment">;</span>
    })<span class="hljs-comment">;</span>
</code></pre>
<p>Anything that you can use on an <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement">HTMLElement</a> you can use in the tests.</p>
<h2 id="component-method-tests">Component Method Tests</h2>
<p>To test the component&#39;s methods, simply instantiate an instance of the component and call the methods.</p>
<pre><code class="lang-ts">it('should return an empty string if there is no first or last name', () =&gt; {
  const myName = new MyName()<span class="hljs-comment">;</span>
  expect(<span class="hljs-name">myName</span>.formatted()).toEqual('')<span class="hljs-comment">;</span>
})<span class="hljs-comment">;</span>
</code></pre>
<pre><code class="lang-ts">it('should return a formatted string if there is no first or last name', () =&gt; {
  const myName = new MyName()<span class="hljs-comment">;</span>
  myName.first = 'Lucas'<span class="hljs-comment">;</span>
  myName.last = 'Kalrickson'<span class="hljs-comment">;</span>
  expect(<span class="hljs-name">myName</span>.formatted()).toEqual('Kalrickson, Lucas')<span class="hljs-comment">;</span>
})<span class="hljs-comment">;</span>
</code></pre>
<p><stencil-route-link url="/docs/handling-arrays" router="#router" custom="true">
  <button class="backButton">
    Back
  </button>
</stencil-route-link></p>
<p><stencil-route-link url="/docs/stencil-config" custom="true">
  <button class="nextButton">
    Next
  </button>
</stencil-route-link></p>
