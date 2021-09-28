using Service_Provider_Extensions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service_Providers.Models
{
    [Table("blog")]
    [RedisCaching(60)]
    public class Blog
    {
        public int ID { get; set; }
        public string Name { get; set; }
    }
}
