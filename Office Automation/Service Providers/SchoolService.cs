using Service_Provider_Extensions;
using Service_Providers.DataBaseContext;
using Service_Providers.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Service_Providers
{
    [Service(ServiceLifecycle.Transient)]
    public class SchoolService
    {
        private readonly SchoolContext context;
        public SchoolService(SchoolContext _context)
        {
            context = _context;
        }
        public string GetSchoolName(string name)
        {
            return "学校叫：" + name;
        }

        public List<Blog> GetBlogs()
        {
            return context.Set<Blog>().ToList();
        }
    }
}
