# Zipkin instrumentation for vue-resource ![Build](https://travis-ci.org/elgris/zipkin-instrumentation-vue-resource.svg?branch=master)

## What? 

An interceptor for [vue-resource](https://github.com/pagekit/vue-resource) that instruments outgoing HTTP requests with [Zipkin](https://github.com/openzipkin/zipkin).

## Why?

Sometimes tracing of your backend components is not enough, so you need to do some tracing on frontend side (part of End User Monitoring). This package helps to solve that problem for [VueJS](https://vuejs.org/) with [Zipkin](https://github.com/openzipkin/zipkin).

## How?

What you need to do is to initialise Zipkin Tracer, because the interceptor does not provide any default for that at the moment. Your application may communicate to Zipkin through HTTP, you can do that using proxy (can be defined with webpack). 

`main.js`  may look like this:

```js
// these imports are zipkin-specific
import {
  Tracer,
  BatchRecorder,
  ExplicitContext,
  jsonEncoder
} from 'zipkin'
import {HttpLogger} from 'zipkin-transport-http'
// and here the interceptor is imported
import {zipkinInterceptor} from 'zipkin-instrumentation-vue-resource'

const serviceName = 'myfancywebsite'

// this Tracer communicates to Zipkin through HTTP protocol
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      // take a look
      endpoint: window.location.protocol + '//' + window.location.host + '/zipkin',
      jsonEncoder: jsonEncoder.JSON_V2
    })
  }),
  localServiceName: serviceName
})

// and here is how the interceptor is created and added to vue-resource's chain
const interceptor = zipkinInterceptor({tracer, serviceName})
Vue.http.interceptors.push(interceptor)
```

Then `proxyTable` in `config/index.js` may look like this:
```js
  proxyTable: {
      '/zipkin': {
      target: process.env.ZIPKIN_ADDRESS || 'http://127.0.0.1:9411/api/v2/spans',
      pathRewrite: {
          '^/zipkin': ''
      },
      secure: false
      },      
  },
```

The piece of configuration above redirects all requests to `/zipkin` path to your actual Zipkin server running on `127.0.0.1:9411`.