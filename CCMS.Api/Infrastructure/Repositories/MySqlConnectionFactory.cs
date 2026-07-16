using Microsoft.Extensions.Configuration;

namespace CCMS.Api.Infrastructure.Repositories;

public sealed class MySqlConnectionFactory
{
    private readonly IConfiguration _configuration;

    public MySqlConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateConnectionString()
    {
        var host = Environment.GetEnvironmentVariable("DB_HOST") ?? _configuration["DB_HOST"] ?? "localhost";
        var port = Environment.GetEnvironmentVariable("DB_PORT") ?? _configuration["DB_PORT"] ?? "3306";
        var database = Environment.GetEnvironmentVariable("DB_NAME") ?? _configuration["DB_NAME"] ?? "railway";
        var user = Environment.GetEnvironmentVariable("DB_USER") ?? _configuration["DB_USER"] ?? "root";
        var password = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? _configuration["DB_PASSWORD"] ?? string.Empty;

        return $"Server={host};Port={port};Database={database};User ID={user};Password={password};SslMode=Required;AllowPublicKeyRetrieval=True;CharSet=utf8mb4;";
    }
}
