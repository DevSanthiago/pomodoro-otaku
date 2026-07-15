using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace Api.Auth;

public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int MemoryKib = 19456;
    private const int Iterations = 2;
    private const int Parallelism = 1;
    private const string Prefix = "argon2id";

    private static byte[] Derive(string senha, byte[] salt, int memoryKib, int iterations, int parallelism) =>
        new Argon2id(Encoding.UTF8.GetBytes(senha))
        {
            Salt = salt,
            MemorySize = memoryKib,
            Iterations = iterations,
            DegreeOfParallelism = parallelism,
        }.GetBytes(HashSize);

    public static string Hash(string senha)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Derive(senha, salt, MemoryKib, Iterations, Parallelism);
        return $"{Prefix}${MemoryKib}${Iterations}${Parallelism}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string senha, string encoded)
    {
        var parts = encoded.Split('$');
        if (parts.Length != 6 || parts[0] != Prefix) return false;
        if (!int.TryParse(parts[1], out var memoryKib)) return false;
        if (!int.TryParse(parts[2], out var iterations)) return false;
        if (!int.TryParse(parts[3], out var parallelism)) return false;

        var salt = Convert.FromBase64String(parts[4]);
        var esperado = Convert.FromBase64String(parts[5]);
        var calculado = Derive(senha, salt, memoryKib, iterations, parallelism);

        return CryptographicOperations.FixedTimeEquals(calculado, esperado);
    }
}
