using Service_Providers.DataBaseContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Service_Providers.DataBaseContextConfig
{
    public class ContextFactory : IDbContextFactory<SchoolContext>
    {
        public SchoolContext Create()
        {
            return SchoolContext.Load(null);
        }
    }
}
