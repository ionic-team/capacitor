## JS Module Dev Guide

Use (function(err, data) for callback modes?)

## iOS Module Development Guide


### Only return JSON-serializable data

For example, if you have an array of `URL` objects, those are not JSON serializable. Instead, map
the array to strings, like this:

let paths = urls.map {(url: URL) -> String in
  return url.path
}

call.success([
  "paths": paths
])