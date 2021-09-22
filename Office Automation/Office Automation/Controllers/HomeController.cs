using Microsoft.AspNetCore.Mvc;
using Office_Automation.Extensions.ControllerExtensions;
using Service_Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Office_Automation.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        [AutoAnalysis]
        public IStudentService stu { get; set; }
        [AutoAnalysis(1)]
        public IStudentService stu2 { get; set; }

        [AutoAnalysis]
        public SchoolService school { get; set; }

        [HttpGet]
        public string Get(string name)
        {
            return stu.WriteMessage("张三") + stu2.WriteMessage("李四") + school.GetSchoolName("天津工业大学");
        }

        [HttpGet]
        [Route("err")]
        public string err()
        {
            throw new Exception("做咩啊");
        }
    }
}
