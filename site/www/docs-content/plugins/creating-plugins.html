<h1 id="creating-capacitor-plugins">Creating Capacitor Plugins</h1>
<p>An Capacitor plugin relies on a JavaScript layer that proxies calls to Capacitor&#39;s cross-platform runtime which runs
the corresponding native or pure-web code to handle the operation.</p>
<p>Thus, an Capacitor plugin consists of some JavaScript and then a native implementation for each platform that requires it.</p>
<p>Let&#39;s implement a simple Todo plugin that stores a list of Todo&#39;s in native device storage or web storage depending on the platform available.</p>
<h2 id="generate-plugin-scaffolding">Generate Plugin Scaffolding</h2>
<p>To generate a new plugin for development, run</p>
<pre><code class="lang-bash">capacitor plugin:generate com.example.plugin.todo Todo
</code></pre>
<p>The plugin&#39;s structure will look similar to this:</p>
<h2 id="javascript-implementation">JavaScript Implementation</h2>
<h2 id="ios-plugin">iOS Plugin</h2>
<pre><code class="lang-swift"><span class="hljs-keyword">import</span> Capacitor

<span class="hljs-meta">@objc</span>(<span class="hljs-type">Todo</span>)
<span class="hljs-class"><span class="hljs-keyword">class</span> <span class="hljs-title">Todo</span> : <span class="hljs-title">Plugin</span> </span>{
  <span class="hljs-meta">@objc</span> <span class="hljs-function"><span class="hljs-keyword">func</span> <span class="hljs-title">create</span><span class="hljs-params">(<span class="hljs-number">_</span> call: PluginCall)</span></span> {
    <span class="hljs-comment">// Grab the call arguments, guarding to ensure they exist</span>
    <span class="hljs-keyword">guard</span> <span class="hljs-keyword">let</span> title = call.<span class="hljs-keyword">get</span>(<span class="hljs-string">"title"</span>, <span class="hljs-type">String</span>.<span class="hljs-keyword">self</span>) <span class="hljs-keyword">else</span> {
      call.error(<span class="hljs-string">"Must provide title"</span>)
    }

    <span class="hljs-keyword">guard</span> <span class="hljs-keyword">let</span> text = call.<span class="hljs-keyword">get</span>(<span class="hljs-string">"text"</span>, <span class="hljs-type">String</span>.<span class="hljs-keyword">self</span>) <span class="hljs-keyword">else</span> {
      call.error(<span class="hljs-string">"Must provide text"</span>)
    }

    <span class="hljs-comment">// Create the Todo</span>
    <span class="hljs-keyword">let</span> todo = <span class="hljs-type">Todo</span>(title, text)

    <span class="hljs-comment">// Save it somewhere</span>
    <span class="hljs-comment">// ...</span>

    <span class="hljs-comment">// Construct a new PluginResult object with the</span>
    <span class="hljs-comment">// data we'll send back to the client</span>
    <span class="hljs-keyword">let</span> result = [
      <span class="hljs-string">"todoId"</span>: todo.id
    ]

    <span class="hljs-comment">// Send the result back to the client</span>
    call.success(result)
  }

  <span class="hljs-meta">@objc</span> <span class="hljs-keyword">public</span> <span class="hljs-function"><span class="hljs-keyword">func</span> <span class="hljs-title">update</span><span class="hljs-params">(<span class="hljs-number">_</span> call: PluginCall)</span></span> {
    <span class="hljs-comment">// ... exercise for the reader</span>
  }

  <span class="hljs-meta">@objc</span> <span class="hljs-keyword">public</span> <span class="hljs-function"><span class="hljs-keyword">func</span> <span class="hljs-title">delete</span><span class="hljs-params">(<span class="hljs-number">_</span> call: PluginCall)</span></span> {
    <span class="hljs-comment">// ... exercise for the reader</span>
  }
}
</code></pre>
<h2 id="android-plugin">Android Plugin</h2>
<pre><code class="lang-java"><span class="hljs-keyword">package</span> com.example.plugin;

<span class="hljs-keyword">import</span> com.getcapacitor.NativePlugin;
<span class="hljs-keyword">import</span> com.getcapacitor.Plugin;
<span class="hljs-keyword">import</span> com.getcapacitor.PluginCall;
<span class="hljs-keyword">import</span> com.getcapacitor.PluginMethod;
<span class="hljs-keyword">import</span> com.getcapacitor.JSObject;

<span class="hljs-meta">@NativePlugin</span>()
<span class="hljs-keyword">public</span> <span class="hljs-class"><span class="hljs-keyword">class</span> <span class="hljs-title">Todo</span> <span class="hljs-keyword">extends</span> <span class="hljs-title">Plugin</span> </span>{

  <span class="hljs-meta">@PluginMethod</span>()
  <span class="hljs-function"><span class="hljs-keyword">public</span> <span class="hljs-keyword">void</span> <span class="hljs-title">create</span><span class="hljs-params">(PluginCall call)</span> </span>{
    String title = call.getString(<span class="hljs-string">"title"</span>);
    String text = call.getString(<span class="hljs-string">"text"</span>);

    Todo t = <span class="hljs-keyword">new</span> Todo(title, text);
    <span class="hljs-comment">// save it somewhere</span>

    JSObject ret = <span class="hljs-keyword">new</span> JSONObject();
    <span class="hljs-keyword">try</span> {
      ret.put(<span class="hljs-string">"todoId"</span>, t.id);
      call.success(ret);
    } <span class="hljs-keyword">catch</span>(JSONException ex) {
      call.error(<span class="hljs-string">"Unable to send todo"</span>, ex);
    }
  }

}
</code></pre>
<h2 id="web-plugin">Web Plugin</h2>
