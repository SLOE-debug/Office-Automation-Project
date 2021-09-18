using Service_Provider_Extensions;
using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Objects;
using System.Text;

namespace Service_Providers.DataBaseContext
{
    public class SchoolContext : ObjectContext
    {
        public SchoolContext(string connectionString) : base(connectionString)
        {
            if (!DatabaseExists())
            {
                Console.WriteLine(CreateDatabaseScript());
            }
        }
    }
}
