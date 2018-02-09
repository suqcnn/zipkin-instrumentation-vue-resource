const {
  Instrumentation
} = require('zipkin')

function zipkinInterceptor ({ tracer, serviceName, remoteServiceName }) {
  const instrumentation = new Instrumentation.HttpClient({ tracer, serviceName, remoteServiceName })
  return function (request, next) {
    tracer.scoped(() => {
      const options = instrumentation.recordRequest({}, request.url, request.method)

      for (var key in options.headers) {
        if (options.headers.hasOwnProperty(key)) {
          request.headers.set(key, options.headers[key])
        }
      }

      const traceId = tracer.id
      next(function (response) {
        tracer.scoped(() => {
          instrumentation.recordResponse(traceId, response.status)
        })
      })
    })
  }
}