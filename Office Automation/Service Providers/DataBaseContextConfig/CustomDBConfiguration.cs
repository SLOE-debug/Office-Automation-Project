using MySql.Data.EntityFramework;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service_Providers.DataBaseContextConfig
{
    class CustomDBConfiguration : DbConfiguration
    {
        public CustomDBConfiguration()
        {
            SetExecutionStrategy("MySql.Data.MySqlClient", () => new MySqlExecutionStrategy());
            //SetDefaultConnectionFactory(new MySqlConnectionFactory());
            SetProviderFactory("MySql.Data.MySqlClient", new MySqlClientFactory());
            SetProviderServices("MySql.Data.MySqlClient", new MySqlProviderServices());
        }
    }
}
