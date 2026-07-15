using Api.Domain;

namespace Api.Tests;

public class ContaRulesTests
{
    [Theory]
    [InlineData("voce@exemplo.com")]
    [InlineData("a.b+tag@sub.dominio.co")]
    public void ValidateEmail_aceita_email_valido(string email)
    {
        Assert.Null(ContaRules.ValidateEmail(email));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("sem-arroba")]
    public void ValidateEmail_recusa_email_invalido(string email)
    {
        Assert.NotNull(ContaRules.ValidateEmail(email));
    }

    [Theory]
    [InlineData("1234567", false)]
    [InlineData("12345678", true)]
    [InlineData("", false)]
    public void ValidateSenha_exige_minimo_de_8(string senha, bool valida)
    {
        var erro = ContaRules.ValidateSenha(senha);
        Assert.Equal(valida, erro is null);
    }

    [Fact]
    public void NormalizeEmail_apara_e_baixa_a_caixa()
    {
        Assert.Equal("voce@exemplo.com", ContaRules.NormalizeEmail("  VoCe@Exemplo.COM "));
    }

    [Fact]
    public void NomeFromEmail_usa_a_parte_antes_do_arroba()
    {
        Assert.Equal("johnatan", ContaRules.NomeFromEmail("johnatan@exemplo.com"));
    }
}
