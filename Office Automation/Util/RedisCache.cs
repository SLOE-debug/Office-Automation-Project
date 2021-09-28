using StackExchange.Redis;
using Service_Provider_Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;
using System.Data;
using Newtonsoft.Json.Linq;

namespace Util
{
    [Service(ServiceLifecycle.Singleton)]
    public class RedisCache
    {
        private readonly ConnectionMultiplexer redis;
        public readonly IDatabase db;
        private readonly IConfiguration configuration;
        public RedisCache(IConfiguration _configuration)
        {
            configuration = _configuration;
            redis = ConnectionMultiplexer.Connect(configuration["RedisConnAddress"]);
            db = redis.GetDatabase(0);
        }

        public List<T> GetList<T>(string key) where T : class
        {
            return JsonConvert.DeserializeObject<List<T>>(db.StringGet(key));
        }

        public DataTable GetTable(string key)
        {
            using (DataTable dt = JsonConvert.DeserializeObject<DataTable>(db.StringGet(key)))
            {
                DataTable newdt = new DataTable();
                foreach (DataColumn col in dt.Columns)
                {
                    DataColumn newcol = new DataColumn { ColumnName = col.ColumnName, DataType = col.DataType };
                    newdt.Columns.Add(newcol);
                    if (col.DataType.Name == typeof(Int64).Name)
                    {
                        int v;
                        if (Int32.TryParse(dt.Rows[0][col.ColumnName].ToString(), out v))
                        {
                            newcol.DataType = typeof(Int32);
                        }
                    }
                }
                foreach (DataRow r in dt.Rows)
                {
                    newdt.ImportRow(r);
                }
                return newdt;
            }
        }

        public void SetTable(string key, DataTable dt, TimeSpan? exp = null)
        {
            db.StringSet(key, JsonConvert.SerializeObject(dt), exp);
        }

        public void SetList<T>(string key, List<T> ls)
        {
            db.StringSet(key, JsonConvert.SerializeObject(ls));
        }

    }
}
