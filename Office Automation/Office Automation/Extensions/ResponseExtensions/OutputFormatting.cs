using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Office_Automation.Extensions.ResponseExtensions
{
    public class OutputFormatting : TextOutputFormatter
    {
        public OutputFormatting()
        {
            SupportedMediaTypes.Add("application/json");
            SupportedEncodings.Add(Encoding.UTF8);
            SupportedEncodings.Add(Encoding.Unicode);
        }
        public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
        {
            await context.HttpContext.Response.WriteAsJsonAsync(new
            {
                code = context.HttpContext.Response.StatusCode,
                data = context.Object
            }, typeof(Object));
        }
    }
}
