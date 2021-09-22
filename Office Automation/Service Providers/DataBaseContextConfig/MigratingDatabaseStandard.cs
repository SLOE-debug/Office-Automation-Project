using MySql.Data.EntityFramework;
using Service_Providers.DataBaseContext;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service_Providers.DataBaseContextConfig
{
    public class MigratingDatabaseStandard : DbMigrationsConfiguration<SchoolContext>
    {
        public MigratingDatabaseStandard()
        {
            AutomaticMigrationDataLossAllowed = false;
            AutomaticMigrationsEnabled = true;
            ContextType = typeof(SchoolContext);
            MigrationsNamespace = "Service_Providers.Models";
            SetSqlGenerator("MySql.Data.MySqlClient", new MySqlMigrationSqlGenerator());
        }
    }
}
