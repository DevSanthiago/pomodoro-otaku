using Api.Auth;

namespace Api.Tests;

public class PasswordHasherTests
{
    [Fact]
    public void Hash_entao_Verify_aceita_a_senha_correta()
    {
        var hash = PasswordHasher.Hash("senha-forte-123");
        Assert.True(PasswordHasher.Verify("senha-forte-123", hash));
    }

    [Fact]
    public void Verify_rejeita_senha_errada()
    {
        var hash = PasswordHasher.Hash("senha-forte-123");
        Assert.False(PasswordHasher.Verify("senha-errada", hash));
    }

    [Fact]
    public void Hash_nao_guarda_a_senha_em_texto_plano()
    {
        var hash = PasswordHasher.Hash("minha-senha-secreta");
        Assert.DoesNotContain("minha-senha-secreta", hash);
        Assert.StartsWith("argon2id$", hash);
    }

    [Fact]
    public void Hashes_da_mesma_senha_sao_diferentes_por_causa_do_salt()
    {
        var a = PasswordHasher.Hash("igual");
        var b = PasswordHasher.Hash("igual");
        Assert.NotEqual(a, b);
        Assert.True(PasswordHasher.Verify("igual", a));
        Assert.True(PasswordHasher.Verify("igual", b));
    }

    [Theory]
    [InlineData("")]
    [InlineData("nao-e-argon2")]
    [InlineData("argon2id$19456$2")]
    public void Verify_nao_quebra_com_hash_malformado(string hashInvalido)
    {
        Assert.False(PasswordHasher.Verify("qualquer", hashInvalido));
    }
}
