using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddGamificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AtualizadaEm",
                table: "Progress",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.AddColumn<int>(
                name: "FocosConcluidos",
                table: "Progress",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TarefasConcluidas",
                table: "Progress",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateOnly>(
                name: "UltimoDiaFoco",
                table: "Progress",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AtualizadaEm",
                table: "Progress");

            migrationBuilder.DropColumn(
                name: "FocosConcluidos",
                table: "Progress");

            migrationBuilder.DropColumn(
                name: "TarefasConcluidas",
                table: "Progress");

            migrationBuilder.DropColumn(
                name: "UltimoDiaFoco",
                table: "Progress");
        }
    }
}
