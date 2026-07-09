using Npgsql;

namespace Api.Data;

public static class DatabaseConnection
{
    private const string LocalFallback =
        "Host=localhost;Port=5432;Database=pomodoro_otaku;Username=postgres;Password=postgres";

    public static string Resolve(IConfiguration configuration)
    {
        var raw =
            configuration.GetConnectionString("Postgres")
            ?? configuration["DATABASE_URL"]
            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? LocalFallback;

        return NormalizeToNpgsql(raw);
    }

    private static string NormalizeToNpgsql(string value)
    {
        var isUri =
            value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            || value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

        if (!isUri) return value;

        var uri = new Uri(value);
        var userInfo = uri.UserInfo.Split(':', 2);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
            Database = uri.AbsolutePath.TrimStart('/'),
            SslMode = SslMode.Require,
        };

        return builder.ConnectionString;
    }
}
