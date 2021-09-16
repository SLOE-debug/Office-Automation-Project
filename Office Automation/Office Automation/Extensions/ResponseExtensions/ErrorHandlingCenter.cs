using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Office_Automation.Extensions.ResponseExtensions
{
    public class ErrorHandlingCenter
    {
        private readonly RequestDelegate _next;
        public ErrorHandlingCenter(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                await httpContext.Response.WriteAsJsonAsync(new
                {
                    code = 500,
                    Error = new
                    {
                        Message = ex.Message,
                        RequestPath = httpContext.Request.Path.Value,
                    },
                }, typeof(Object));
            }
        }
    }
}
