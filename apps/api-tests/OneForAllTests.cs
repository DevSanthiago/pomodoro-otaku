using Api.Domain;

namespace Api.Tests;

public class OneForAllTests
{
    [Theory]
    [InlineData(0, 1, "Herdeiro de One For All")]
    [InlineData(99, 1, "Herdeiro de One For All")]
    [InlineData(100, 2, "Faísca")]
    [InlineData(300, 3, "Full Cowl 5%")]
    [InlineData(11000, 9, "United States of Smash")]
    [InlineData(999999, 9, "United States of Smash")]
    public void Mapeia_xp_para_nivel_e_personagem(int xp, int nivel, string personagem)
    {
        Assert.Equal(nivel, OneForAll.NivelParaXp(xp));
        Assert.Equal(personagem, OneForAll.PersonagemParaXp(xp));
    }

    [Fact]
    public void Nivel_nunca_regride_dentro_da_mesma_faixa()
    {
        Assert.Equal(OneForAll.NivelParaXp(300), OneForAll.NivelParaXp(599));
        Assert.True(OneForAll.NivelParaXp(600) > OneForAll.NivelParaXp(599));
    }
}
