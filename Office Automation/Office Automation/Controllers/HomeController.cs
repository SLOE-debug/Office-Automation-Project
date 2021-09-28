using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Office_Automation.Extensions.ControllerExtensions;
using Service_Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.IdentityModel.Tokens;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Util;
using Service_Providers.Models;

namespace Office_Automation.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class HomeController : ControllerBase
    {
        [AutoAnalysis]
        public IStudentService stu { get; set; }
        [AutoAnalysis(1)]
        public IStudentService stu2 { get; set; }

        [AutoAnalysis]
        public SchoolService school { get; set; }

        [AutoAnalysis]
        public SecurityTokenGenerator securityTokenGenerator { get; set; }

        [HttpGet]
        [Route("getToken")]
        [AllowAnonymous]
        public string GetToken()
        {
            return securityTokenGenerator.CreateToken();
        }
        [HttpGet]
        public string Get(string name)
        {
            return stu.WriteMessage("张三") + stu2.WriteMessage("李四") + school.GetSchoolName("天津工业大学");
        }

        [HttpGet]
        [Route("getBlogs")]
        public List<Blog> GetBlogs()
        {
            return school.GetBlogs();
        }

        [HttpGet]
        [Route("err")]
        public string err()
        {
            throw new Exception("做咩啊");
        }
    }
}
