using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Service_Provider_Extensions;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Util
{
    [Service(ServiceLifecycle.Singleton)]
    public class SecurityTokenGenerator
    {
        public static SecurityKey GetSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes("这里是加密秘钥"));
        }

        public static SigningCredentials GetSigningCredentials()
        {
            return new SigningCredentials(GetSecurityKey(), SecurityAlgorithms.HmacSha256);
        }

        /// <summary>
        /// 定义JWT验证规则
        /// </summary>
        /// <param name="options">JWT配置对象</param>
        public static void ValidationRules(JwtBearerOptions options)
        {
            options.RequireHttpsMetadata = false;
            // 配置项请参考 https://docs.microsoft.com/zh-cn/azure/active-directory/develop/scenario-protected-web-api-app-configuration
            // 或 https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.identitymodel.tokens.tokenvalidationparameters?view=azure-dotnet
            // 每个配置项的具体意思，请参考 https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3
            options.TokenValidationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = GetSecurityKey(),
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateAudience = true,
                ValidIssuer = "OA",
                ValidAudience = "OA_aud",
                ValidateLifetime = true,
            };
        }

        public string CreateToken()
        {
            // 创建Token（
            //      发布者：OA，
            //      听众：OA_aud，
            //      声明：用户名称及用户性别，
            //      生效时间：立即生效，
            //      过期时间：两小时后，
            //      数字签名的加密密钥和安全算法：秘钥为 Symmetric 类型的 “测试加密”、加密算法为SecurityAlgorithms.HmacSha256
            // ）
            // 对应的秘钥类型要使用对应的加密算法，请参照
            // 秘钥类型：https://docs.microsoft.com/zh-cn/dotnet/api/system.identitymodel.tokens.securitykey?view=netframework-4.8 请参照派生列表中的派生项
            // 加密算法：https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/wiki/Supported-Algorithms
            JwtSecurityToken SecurityToken = new JwtSecurityToken("OA", "OA_aud", new Claim[] {
                new Claim("useranme","张三"),
                new Claim("sex","男"),
            }, DateTime.Now, DateTime.Now.AddHours(2), GetSigningCredentials());
            return new JwtSecurityTokenHandler().WriteToken(SecurityToken);
        }
    }
}
