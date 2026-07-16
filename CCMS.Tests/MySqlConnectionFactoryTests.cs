using CCMS.Api.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;

namespace CCMS.Tests;

public class MySqlConnectionFactoryTests
{
    [Fact]
    public void CreateConnectionString_UsesDatabaseConfigurationValues()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DB_HOST"] = "db.example.com",
                ["DB_PORT"] = "3306",
                ["DB_NAME"] = "railway",
                ["DB_USER"] = "root",
                ["DB_PASSWORD"] = "secret"
            })
            .Build();

        var factory = new MySqlConnectionFactory(config);

        var connectionString = factory.CreateConnectionString();

        Assert.Contains("Server=db.example.com", connectionString);
        Assert.Contains("Port=3306", connectionString);
        Assert.Contains("Database=railway", connectionString);
        Assert.Contains("User ID=root", connectionString);
        Assert.Contains("Password=secret", connectionString);
    }
}
