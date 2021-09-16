using Microsoft.AspNetCore.Builder;
using Office_Automation.Extensions.ResponseExtensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Office_Automation.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseErrorHandlingCenter(
               this IApplicationBuilder app)
        {
            app.UseMiddleware<ErrorHandlingCenter>();
            return app;
        }
    }
}
